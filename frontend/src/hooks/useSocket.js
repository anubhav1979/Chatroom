// import { io } from 'socket.io-client'

// let socketInstance = null

// export function useSocket() {
//   function getSocket() {
//     if (!socketInstance) {
//       const token = localStorage.getItem('token')
//       socketInstance = io(process.env.REACT_APP_API_URL, {
//         auth: { token },
//         transports: ['websocket']
//       })
//     }
//     return socketInstance
//   }

//   function disconnectSocket() {
//     if (socketInstance) {
//       socketInstance.disconnect()
//       socketInstance = null
//     }
//   }

//   return { getSocket, disconnectSocket }
// }

import { io } from "socket.io-client";

let socketInstance = null;

export function useSocket() {
  function getSocket() {
    if (!socketInstance) {
      const token = localStorage.getItem("token");

      socketInstance = io(import.meta.env.VITE_API_URL, {
        auth: { token },
        transports: ["websocket"],
        withCredentials: true,
      });
    }

    return socketInstance;
  }

  function disconnectSocket() {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  }

  return { getSocket, disconnectSocket };
}
