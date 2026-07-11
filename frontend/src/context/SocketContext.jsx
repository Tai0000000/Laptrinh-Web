import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [raceData, setRaceData] = useState({}); // Lưu trữ dữ liệu live theo race_id
  
  const socketRef = useRef(null);
  const subscriptionsRef = useRef(new Set());
  const messageListenersRef = useRef([]); // Array of { action, callback }
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8080';

  const createSocket = useCallback(() => {
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

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

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Try to reconnect after 3 seconds
      setTimeout(() => {
        createSocket();
      }, 3000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Lắng nghe dữ liệu live chung
    socket.onmessage = (event) => {
      console.log('WebSocket received raw data:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (data.race_id) {
          setRaceData((prev) => ({
            ...prev,
            [data.race_id]: data,
          }));
        }
        // Call all registered listeners for this action
        messageListenersRef.current.forEach(listener => {
          if (listener.action === data.action || listener.action === '*') {
            listener.callback(data);
          }
        });
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e, 'Raw data:', event.data);
      }
    };
  }, [socketUrl]);

  useEffect(() => {
    createSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [createSocket]);

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

  // Hàm đăng ký listener cho message
  const addMessageListener = useCallback((action, callback) => {
    messageListenersRef.current.push({ action, callback });
  }, []);

  // Hàm hủy đăng ký listener
  const removeMessageListener = useCallback((action, callback) => {
    messageListenersRef.current = messageListenersRef.current.filter(
      listener => !(listener.action === action && listener.callback === callback)
    );
  }, []);

  const value = {
    isConnected,
    raceData,
    subscribeToRace,
    unsubscribeFromRace,
    addMessageListener,
    removeMessageListener,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
