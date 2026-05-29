import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [raceData, setRaceData] = useState({}); // Lưu trữ dữ liệu live theo race_id
  
  const socketRef = useRef();

  useEffect(() => {
    // Khởi tạo connection WebSocket
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    socketRef.current = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected:', socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    // Lắng nghe dữ liệu live chung
    socketRef.current.on('race_update', (data) => {
      setRaceData((prev) => ({
        ...prev,
        [data.race_id]: data,
      }));
    });

    setSocket(socketRef.current);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Hàm subscribe vào một cuộc đua cụ thể
  const subscribeToRace = useCallback((raceId) => {
    if (socketRef.current && isConnected) {
      console.log(`Subscribing to race: ${raceId}`);
      socketRef.current.emit('subscribe_race', { race_id: raceId });
    }
  }, [isConnected]);

  // Hàm unsubscribe khỏi một cuộc đua
  const unsubscribeFromRace = useCallback((raceId) => {
    if (socketRef.current && isConnected) {
      console.log(`Unsubscribing from race: ${raceId}`);
      socketRef.current.emit('unsubscribe_race', { race_id: raceId });
    }
  }, [isConnected]);

  const value = {
    socket,
    isConnected,
    raceData,
    subscribeToRace,
    unsubscribeFromRace,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
