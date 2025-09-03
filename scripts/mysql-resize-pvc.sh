#!/bin/bash

# Uso: ./scripts/mysql-resize-pvc.sh <novo_tamanho>
set -e

SIZE="$1"
NS="cardapio"
STS_NAME="mysql-with-backup"
PVC_NAME="mysql-storage-mysql-with-backup-0"
BACKUP_LOCAL="/tmp/backup_resize.sql"

if [ -z "$SIZE" ]; then
  echo "Uso: $0 <novo_tamanho_ex: 20Gi>"
  exit 1
fi

echo "🗄️  Redimensionando PVC do MySQL para: $SIZE"

if ! kubectl get sts "$STS_NAME" -n "$NS" >/dev/null 2>&1; then
  echo "❌ StatefulSet $STS_NAME não encontrado no namespace $NS"
  exit 1
fi

# Pausar backend (se existir)
if kubectl get deploy cardapio-backend-fixed -n "$NS" >/dev/null 2>&1; then
  echo "⏸️  Pausando backend (replicas=0)"
  kubectl scale deploy/cardapio-backend-fixed -n "$NS" --replicas=0 || true
fi

# Obter senha do root
MYSQL_ROOT_PASS=$(kubectl get secret mysql-pass-fixed -n "$NS" -o jsonpath='{.data.mysql-root-password}' 2>/dev/null | base64 -d || echo "newrootpassword")

echo "💾 Gerando backup final em $BACKUP_LOCAL"
kubectl exec -n "$NS" ${STS_NAME}-0 -- mysqldump -u root -p"$MYSQL_ROOT_PASS" cardapio > "$BACKUP_LOCAL"

echo "🧹 Removendo StatefulSet (preservando PV)"
kubectl delete sts "$STS_NAME" -n "$NS" --cascade=orphan

echo "🧹 Removendo PVC antigo: $PVC_NAME"
kubectl delete pvc "$PVC_NAME" -n "$NS" || true

echo "📝 Gerando manifesto novo do StatefulSet"
kubectl get sts "$STS_NAME" -n "$NS" -o yaml > /tmp/${STS_NAME}-new.yaml || true

if [ ! -s /tmp/${STS_NAME}-new.yaml ]; then
cat > /tmp/${STS_NAME}-new.yaml <<'EOF'
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql-with-backup
  namespace: cardapio
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql-with-backup
  serviceName: mysql-with-backup
  template:
    metadata:
      labels:
        app: mysql-with-backup
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-pass-fixed
              key: mysql-root-password
        - name: MYSQL_DATABASE
          value: cardapio
        - name: MYSQL_USER
          valueFrom:
            secretKeyRef:
              name: mysql-pass-fixed
              key: mysql-user
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-pass-fixed
              key: mysql-password
        volumeMounts:
        - name: mysql-backup
          mountPath: /cardapio/backend/backup_db
        - name: mysql-init-script
          mountPath: /docker-entrypoint-initdb.d
        - name: mysql-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-backup
        configMap:
          name: mysql-backup-current
      - name: mysql-init-script
        configMap:
          name: mysql-auto-init
  volumeClaimTemplates:
  - metadata:
      name: mysql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
EOF
fi

# Limpar campos dinâmicos
sed -i '/^  creationTimestamp:/d' /tmp/${STS_NAME}-new.yaml || true
sed -i '/^  resourceVersion:/d' /tmp/${STS_NAME}-new.yaml || true
sed -i '/^  uid:/d' /tmp/${STS_NAME}-new.yaml || true
sed -i '/^status:/,$d' /tmp/${STS_NAME}-new.yaml || true

# Atualizar tamanho do PVC
awk -v size="$SIZE" '
  BEGIN{updated=0}
  /volumeClaimTemplates:/ {inVCT=1}
  inVCT && /storage:/ && updated==0 {sub(/storage:.*/,"storage: " size); updated=1}
  {print}
' /tmp/${STS_NAME}-new.yaml > /tmp/${STS_NAME}-resized.yaml

echo "🚢 Recriando StatefulSet com novo tamanho de PVC ($SIZE)"
kubectl apply -n "$NS" -f /tmp/${STS_NAME}-resized.yaml
kubectl rollout status sts/"$STS_NAME" -n "$NS" --timeout=300s

echo "🔎 Verificando PVC"
kubectl get pvc -n "$NS" | grep mysql-storage || true

echo "✅ Resize concluído"

