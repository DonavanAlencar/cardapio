-- ======= MIGRAÇÃO RESERVAS (SEM QUEBRAR SCHEMA ATUAL) =======
START TRANSACTION;

-- 1) Novas colunas
ALTER TABLE table_reservations
  ADD COLUMN duration_minutes INT NOT NULL DEFAULT 90 AFTER reservation_time,
  ADD COLUMN buffer_after_minutes INT NOT NULL DEFAULT 10 AFTER duration_minutes,
  ADD COLUMN ends_at DATETIME NULL AFTER buffer_after_minutes;

-- 2) Recalcular ends_at para registros existentes
UPDATE table_reservations
SET ends_at = reservation_time + INTERVAL duration_minutes MINUTE
WHERE ends_at IS NULL;

-- 3) Índices p/ acelerar buscas por janelas
CREATE INDEX idx_res_table_time ON table_reservations (table_id, reservation_time, ends_at);
CREATE INDEX idx_res_status_time ON table_reservations (status, reservation_time);

COMMIT;

-- 4) Triggers para manter ends_at e impedir overlap
DELIMITER $$

DROP TRIGGER IF EXISTS trg_res_before_ins $$
CREATE TRIGGER trg_res_before_ins
BEFORE INSERT ON table_reservations
FOR EACH ROW
BEGIN
  -- Calcula ends_at
  IF NEW.ends_at IS NULL THEN
    SET NEW.ends_at = NEW.reservation_time + INTERVAL NEW.duration_minutes MINUTE;
  END IF;

  -- Impede overlap na mesma mesa (considera buffer do existente e o buffer do novo)
  IF EXISTS (
    SELECT 1
    FROM table_reservations r
    WHERE r.table_id = NEW.table_id
      AND r.status IN ('booked','seated')  -- só conflita com reservas ativas
      AND TIMESTAMPADD(MINUTE, 0, NEW.reservation_time)
            < TIMESTAMPADD(MINUTE, r.buffer_after_minutes, r.ends_at)
      AND TIMESTAMPADD(MINUTE, 0, r.reservation_time)
            < TIMESTAMPADD(MINUTE, NEW.buffer_after_minutes, NEW.ends_at)
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflito: mesa já reservada no intervalo.';
  END IF;
END $$

DROP TRIGGER IF EXISTS trg_res_before_upd $$
CREATE TRIGGER trg_res_before_upd
BEFORE UPDATE ON table_reservations
FOR EACH ROW
BEGIN
  -- Recalcula ends_at se horário/duração mudarem
  IF NEW.reservation_time <> OLD.reservation_time
     OR NEW.duration_minutes <> OLD.duration_minutes
     OR NEW.ends_at IS NULL THEN
    SET NEW.ends_at = NEW.reservation_time + INTERVAL NEW.duration_minutes MINUTE;
  END IF;

  -- Impede overlap (ignorando a própria reserva)
  IF EXISTS (
    SELECT 1
    FROM table_reservations r
    WHERE r.table_id = NEW.table_id
      AND r.id <> OLD.id
      AND r.status IN ('booked','seated')
      AND TIMESTAMPADD(MINUTE, 0, NEW.reservation_time)
            < TIMESTAMPADD(MINUTE, r.buffer_after_minutes, r.ends_at)
      AND TIMESTAMPADD(MINUTE, 0, r.reservation_time)
            < TIMESTAMPADD(MINUTE, NEW.buffer_after_minutes, NEW.ends_at)
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflito: mesa já reservada no intervalo.';
  END IF;
END $$

DELIMITER ;
