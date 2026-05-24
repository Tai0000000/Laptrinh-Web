import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
  autoConnect: false,
  transports: ['websocket'],
});

export default socket;