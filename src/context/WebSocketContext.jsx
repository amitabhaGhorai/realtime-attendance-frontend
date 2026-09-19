import React, { createContext, useContext, useEffect, useState, useRef } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [status, setStatus] = useState("DISCONNECTED"); // CONNECTING, CONNECTED, DISCONNECTED
  const [lastEvent, setLastEvent] = useState(null);
  const [eventsFeed, setEventsFeed] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const defaultWsUrl = window.location.hostname === "localhost"
      ? `ws://${window.location.host}/ws/attendance`
      : "wss://realtime-attendance-backend.onrender.com/ws/attendance";
    const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;

    setStatus("CONNECTING");
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("CONNECTED");
      console.log("WebSocket connected to real-time attendance hub");
    };

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        setLastEvent(data);
        setEventsFeed((prev) => [
          { ...data, receivedAt: new Date().toLocaleTimeString() },
          ...prev.slice(0, 49),
        ]);
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onclose = () => {
      setStatus("DISCONNECTED");
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close();
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, lastEvent, eventsFeed }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
