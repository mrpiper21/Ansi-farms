import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrl } from '../config/api';

interface ChatContextType {
  socket: Socket | null;
  activeChats: any[];
  unreadCount: number;
  markAsRead: (chatId: string) => void;
  setActiveChats: React.Dispatch<React.SetStateAction<any[]>>;
}

const ChatContext = createContext<ChatContextType>({
  socket: null,
  activeChats: [],
  unreadCount: 0,
  markAsRead: () => {},
  setActiveChats: () => {},
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  

  useEffect(() => {
    const initSocket = async () => {
      
      const newSocket = io(baseUrl!, {
        // auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('newMessage', (message) => {
        setActiveChats(prev => prev.map(chat => {
          if (chat._id === message.chatId) {
            return { 
              ...chat, 
              messages: [...chat.messages, message],
              unreadCount: chat.unreadCount + 1 
            };
          }
          return chat;
        }));
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      socket?.disconnect();
    };
  }, []);

  const markAsRead = async (chatId: string) => {
    setActiveChats(prev => prev.map(chat => 
      chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
    ));
    
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/chats/${chatId}/markAsRead`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`,
        },
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <ChatContext.Provider value={{ socket, activeChats, unreadCount, markAsRead, setActiveChats }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);