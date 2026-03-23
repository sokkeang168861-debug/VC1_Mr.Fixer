import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (userId) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket server
    const newSocket = io(import.meta.env.PROD
      ? window.location.origin
      : 'http://localhost:5000'
    );

    socketRef.current = newSocket;

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);

      // Join user-specific room
      newSocket.emit('join', userId);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Listen for specific events
  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  // Remove event listener
  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  // Get current socket instance (use sparingly, prefer on/off methods)
  const getSocket = () => socketRef.current;

  return {
    isConnected,
    on,
    off,
    getSocket
  };
};

export default useWebSocket;