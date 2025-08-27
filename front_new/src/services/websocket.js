import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  // Conectar ao servidor WebSocket
  connect() {
    if (this.socket && this.isConnected) {
      console.log('🔌 [WebSocket] Já conectado');
      return;
    }

    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const serverUrl = isDevelopment ? 'http://localhost:4000' : 'https://food.546digitalservices.com';

    console.log('🔌 [WebSocket] Conectando ao servidor:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
      autoConnect: true
    });

    this.setupEventListeners();
  }

  // Configurar listeners de eventos
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ [WebSocket] Conectado ao servidor');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Emitir evento de conexão estabelecida
      this.emit('client:ready', {
        clientId: Date.now(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ [WebSocket] Desconectado do servidor:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Servidor desconectou, tentar reconectar
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ [WebSocket] Erro de conexão:', error);
      this.isConnected = false;
      
      this.reconnectAttempts++;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`🔄 [WebSocket] Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        setTimeout(() => {
          this.socket.connect();
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
      } else {
        console.error('❌ [WebSocket] Máximo de tentativas de reconexão atingido');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ [WebSocket] Reconectado após ${attemptNumber} tentativas`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ [WebSocket] Erro na reconexão:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ [WebSocket] Falha na reconexão após todas as tentativas');
    });
  }

  // Emitir evento para o servidor
  emit(event, data) {
    if (this.socket && this.isConnected) {
      console.log(`📤 [WebSocket] Emitindo evento: ${event}`, data);
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ [WebSocket] Socket não conectado, não é possível emitir evento');
    }
  }

  // Escutar eventos do servidor
  on(event, callback) {
    if (this.socket) {
      console.log(`👂 [WebSocket] Escutando evento: ${event}`);
      this.socket.on(event, callback);
      
      // Armazenar listener para cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remover listener específico
  off(event, callback) {
    if (this.socket) {
      console.log(`🚫 [WebSocket] Removendo listener: ${event}`);
      this.socket.off(event, callback);
      
      // Remover do mapa de listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Remover todos os listeners de um evento
  offAll(event) {
    if (this.socket) {
      console.log(`🚫 [WebSocket] Removendo todos os listeners: ${event}`);
      this.socket.off(event);
      
      if (this.listeners.has(event)) {
        this.listeners.delete(event);
      }
    }
  }

  // Desconectar do servidor
  disconnect() {
    if (this.socket) {
      console.log('🔌 [WebSocket] Desconectando do servidor');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      
      // Limpar todos os listeners
      this.listeners.clear();
    }
  }

  // Verificar status da conexão
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // Ping para verificar latência
  ping() {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket não conectado'));
        return;
      }

      const startTime = Date.now();
      
      this.socket.emit('ping', { timestamp: startTime });
      
      const timeout = setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 5000);

      this.socket.once('pong', (data) => {
        clearTimeout(timeout);
        const latency = Date.now() - startTime;
        resolve({ latency, serverTime: data.timestamp });
      });
    });
  }
}

// Criar instância singleton
const webSocketService = new WebSocketService();

// Conectar automaticamente quando o serviço é importado
webSocketService.connect();

export default webSocketService;
