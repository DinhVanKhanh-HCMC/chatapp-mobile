import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SockJS from 'sockjs-client';


// Create a custom WebSocket class that's compatible with SockJS and STOMP
class CustomWebSocket extends WebSocket {
  constructor(url) {
    super(url);
  }
}

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const clientRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const tokenRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  

  const connect = async () => {
    try {
      const token = await AsyncStorage.getItem('token');


      console.log('Using token:', token?.substring(0, 10) + '...'); 
      
      if (!token) {
        console.error('No token found');
        return;
      }

      // if (clientRef.current?.connected) {
      //   console.log('Already connected');
      //   return;
      // }

      // Nếu đã kết nối với cùng token thì bỏ qua
      if (clientRef.current?.connected && token === tokenRef.current) {
        return;
      }

      // Hủy kết nối hiện tại nếu có
      if (clientRef.current) {
        clientRef.current.deactivate();
      }

      tokenRef.current = token;

      // Use HTTP URL for SockJS
      const baseUrl = 'http://192.168.1.5:8080';
      
      const client = new Client({
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => console.log('STOMP:', str),
        reconnectDelay: 0,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        // Use a function that creates a new SockJS instance
        webSocketFactory: () => {
          // Create a SockJS instance
          return new SockJS(`${baseUrl}/ws`);
        },
        
        onConnect: () => {
          console.log('✅ Connected to WebSocket');
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
        },
        onStompError: (frame) => {
          console.error('STOMP Error:', {
            command: frame.command,
            headers: frame.headers,
            body: frame.body
          });
          setIsConnected(false);
        },
        onWebSocketError: (error) => {
          //console.error('WS Error:', error);
          setIsConnected(false);
          handleReconnect();
        },
        onDisconnect: () => {
          console.log('❌ Disconnected from WebSocket');
          setIsConnected(false);
        }
      });

      client.activate();
      clientRef.current = client;
    } catch (error) {
      console.error('Connection setup failed:', error);
      handleReconnect
    }
  };

  const handleReconnect = () => {
    reconnectAttemptsRef.current += 1;
    const delay = Math.min(1000 * reconnectAttemptsRef.current, 5000);
    
    console.log(`Retrying connection in ${delay}ms...`);
    setTimeout(() => {
      if (!isConnected) {
        connect();
      }
    }, delay);
  };

  useEffect(() => {
    connect();

    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
      }
    };
  }, []);




  // Thêm useEffect để theo dõi thay đổi token
  useEffect(() => {
    const checkTokenChange = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token !== tokenRef.current) {
        connect();
      }
    };

    // Kiểm tra mỗi giây (hoặc khoảng thời gian phù hợp)
    const interval = setInterval(checkTokenChange, 3000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    connect();
    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const subscribe = (topic, callback) => {
    if (!clientRef.current?.connected) {
      console.warn(`Cannot subscribe to ${topic}: WebSocket not connected`);
      connect(); // Try to reconnect
      return () => {};
    }

    console.log(`📡 Subscribing to ${topic}`);
    const subscription = clientRef.current.subscribe(topic, (message) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        callback(parsedMessage);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    });

    return () => {
      console.log(`Unsubscribing from ${topic}`);
      subscription.unsubscribe();
    };
  };

  const sendMessage = (destination, payload) => {
    if (!clientRef.current?.connected) {
      console.warn('Cannot send message: WebSocket is not connected');
      connect(); // Try to reconnect
      return false;
    }
  
    try {
      // Log the exact payload being sent
      console.log(`📤 Sending message to ${destination}:`, JSON.stringify(payload));
      
      // Make sure the payload is properly serialized
      const serializedPayload = JSON.stringify(payload);
      
      clientRef.current.publish({
        destination,
        body: serializedPayload,
        headers: {
          'content-type': 'application/json'
        }
      });
      
      console.log('Message sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  };

  // const disconnect = () => {
  //   if (clientRef.current?.connected) {
  //     clientRef.current.deactivate();
  //     console.log('WebSocket manually disconnected');
  //   }
  // };

  const disconnect = async () => {
    if (clientRef.current) {
      console.log('🛑 Disconnecting WebSocket...');
      try {
        // Đảm bảo hủy kết nối và xóa reference
        await clientRef.current.deactivate();
        clientRef.current = null;
        tokenRef.current = null;
        setIsConnected(false);
        console.log('✅ WebSocket disconnected successfully');
      } catch (error) {
        console.error('❌ WebSocket disconnect error:', error);
      }
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ 
      connect, 
      subscribe, 
      sendMessage, 
      disconnect,
      isConnected: () => clientRef.current?.connected || false
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);