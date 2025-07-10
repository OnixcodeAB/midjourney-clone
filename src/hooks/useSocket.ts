import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

export function useSocket<T = any>(
  url: string,
  event: string,
  onMessage: (data: T) => void
) {
  const socketRef = useRef<typeof Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket"], // Force WebSocket (optional)
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected");
      setIsConnected(false);
    });

    // Listen for specific event (e.g., 'db_update')
    socket.on(event, (data: T) => {
      console.log(`Received event '${event}':`, data);
      onMessage(data);
    });

    return () => {
      socket.off(event); // Cleanup listener
      socket.disconnect();
    };
  }, [url, event, onMessage]);

  const sendMessage = (eventName: string, message: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(eventName, message);
    } else {
      console.warn("Socket.IO is not connected");
    }
  };

  return { isConnected, sendMessage };
}
