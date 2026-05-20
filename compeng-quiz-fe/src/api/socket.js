import { io } from 'socket.io-client'

// ============================================================
// SOCKET.IO CLIENT MANAGER
// ============================================================
// Connect ke Virtual Router CloudStack — sama dengan API URL.
// Auto-reconnect dengan exponential backoff.
// ============================================================

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://192.168.101.232:3000'

let socketInstance = null

export const connectSocket = (token) => {
  if (socketInstance?.connected) {
    return socketInstance
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  })

  // Logging untuk debugging — bisa di-disable di production
  if (import.meta.env.DEV) {
    socketInstance.on('connect',       () => console.log('🟢 Socket connected:', socketInstance.id))
    socketInstance.on('disconnect',    (r) => console.log('🔴 Socket disconnected:', r))
    socketInstance.on('connect_error', (e) => console.log('⚠️ Socket error:', e.message))
  }

  return socketInstance
}

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}

export const getSocket = () => socketInstance
