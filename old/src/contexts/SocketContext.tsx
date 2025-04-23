import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const token = localStorage.getItem('token');
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Handle real-time notifications
    newSocket.on('notification', (data) => {
      if (data.type === 'error') {
        toast.error(data.message);
      } else if (data.type === 'warning') {
        toast.warning(data.message);
      } else {
        toast.info(data.message);
      }
    });

    // Handle overstay alerts for admins
    if (user.role === 'admin') {
      newSocket.on('overstayAlert', (vehicle) => {
        toast.warning(
          t('alerts.vehicleOverstay', { 
            vehicleNumber: vehicle.vehicleNumber, 
            days: vehicle.days 
          })
        );
      });
    }

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setConnected(false);
      setSocket(null);
    };
  }, [isAuthenticated, user, t]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;