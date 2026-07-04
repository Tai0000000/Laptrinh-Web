import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [raceData, setRaceData] = useState({}); // Lưu trữ dữ liệu live theo race_id
  
  const socketRef = useRef(null);
  const subscriptionsRef = useRef(new Set());

  useEffect(() => {
    // Khởi tạo connection WebSocket (Ratchet)
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8080';
    
    let socket;
    try {
      socket = new WebSocket(socketUrl);
      socketRef.current = socket;
    } catch (e) {
      console.warn('WebSocket init failed:', e);
      return;
    }

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Re-subscribe to all previously subscribed races
      subscriptionsRef.current.forEach(raceId => {
        socketRef.current.send(JSON.stringify({
          action: 'subscribe_race',
          race_id: raceId
        }));
      });
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        if (socketRef.current.readyState === WebSocket.CLOSED) {
          console.log('Reconnecting to WebSocket...');
          const newSocket = new WebSocket(socketUrl);
          socketRef.current = newSocket;
        }
      }, 3000);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Lắng nghe dữ liệu live chung
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.race_id) {
        setRaceData((prev) => ({
          ...prev,
          [data.race_id]: data,
        }));
      }
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Hàm subscribe vào một cuộc đua cụ thể
  const subscribeToRace = useCallback((raceId) => {
    if (!subscriptionsRef.current.has(raceId)) {
      subscriptionsRef.current.add(raceId);
    }
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log(`Subscribing to race: ${raceId}`);
      socketRef.current.send(JSON.stringify({
        action: 'subscribe_race',
        race_id: raceId
      }));
    }
  }, []);

  // Hàm unsubscribe khỏi một cuộc đua
  const unsubscribeFromRace = useCallback((raceId) => {
    subscriptionsRef.current.delete(raceId);
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log(`Unsubscribing from race: ${raceId}`);
      socketRef.current.send(JSON.stringify({
        action: 'unsubscribe_race',
        race_id: raceId
      }));
    }
  }, []);

  const value = {
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
