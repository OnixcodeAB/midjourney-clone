import { useEffect, useRef, useState, useCallback } from "react";

type MessageHandler<T> = (message: T) => void;

export function useWebSocket<T = any>(
  url: string,
  onMessage: MessageHandler<T>
) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0); // Track reconnect attempts
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current) return; // Already connected or connecting

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("Invalid JSON:", event.data);
      }
    };

    socket.onclose = () => {
      console.warn("WebSocket disconnected");
      setIsConnected(false);
      socketRef.current = null;

      // Exponential backoff for reconnection
      reconnectAttemptsRef.current++;
      const delay = Math.min(30000, 1000 * 2 ** reconnectAttemptsRef.current); // Cap at 30s
      console.log(`Reconnecting in ${delay / 1000} seconds...`);
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      socket.close();
    };
  }, [url, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      socketRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  return { isConnected, sendMessage };
}
