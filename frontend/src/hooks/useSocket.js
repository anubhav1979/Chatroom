import { io } from 'socket.io-client'

let socketInstance = null

export function useSocket() {
  function getSocket() {
    if (!socketInstance) {
      const token = localStorage.getItem('token')
      socketInstance = io(process.env.REACT_APP_SOCKET_URL, {
        auth: { token },
        transports: ['websocket']
      })
    }
    return socketInstance
  }

  function disconnectSocket() {
    if (socketInstance) {
      socketInstance.disconnect()
      socketInstance = null
    }
  }

  return { getSocket, disconnectSocket }
}
