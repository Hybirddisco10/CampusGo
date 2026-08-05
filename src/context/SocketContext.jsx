// src/context/SocketContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import io from "socket.io-client";
import { WS_URL } from "../utils/constants";
import { STORAGE_KEYS } from "../utils/constants";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect only if authenticated and socket not already connected
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socket = io(WS_URL, {
      auth: { token: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket.IO connected");
      setIsConnected(true);

    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket.IO disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      setIsConnected(false);
    });

    // Cleanup on unmount or when user changes
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, user]);

  // Helper functions
  const joinOrder = (orderId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("join-order", { orderId });
    }
  };

  const leaveOrder = (orderId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("leave-order", { orderId });
    }
  };

  const sendLocationUpdate = (orderId, lat, lng) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("rider-location-update", { orderId, lat, lng });
    }
  };

  const joinRiderChannel = (available) => {
    if (socketRef.current && isConnected && user?.role === "RIDER") {
      socketRef.current.emit("join-rider-channel", {
        courierId: user.id,
        available,
      });
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    joinOrder,
    leaveOrder,
    sendLocationUpdate,
    joinRiderChannel,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
