import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({ socket: null, onlineUsers: [] });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io('/', {
        withCredentials: true,
        auth: { token },
      });
      newSocket.on('connect', () => {
        newSocket.emit('user-connected', user._id || user.id);
      });
      newSocket.on('online-users', (users: string[]) => {
        setOnlineUsers(users);
      });
      setSocket(newSocket);
      return () => { newSocket.close(); };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
