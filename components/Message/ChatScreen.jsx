import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal, 
} from 'react-native';
import { 
  ChevronLeft,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Heart,
  Send,
  File,
  Menu,
} from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useWebSocket } from './WebSocketContext';
import ApiService from '../../services/apis';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EmojiSelector from 'react-native-emoji-selector';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as mime from 'react-native-mime-types';
import * as ImageManipulator from 'expo-image-manipulator';
import { useActionSheet } from "@expo/react-native-action-sheet";
import Icon from 'react-native-vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = ({ navigation, route }) => {
  const { conversationId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const flatListRef = useRef(null);
  const [token, setToken] = useState(null);
  const {connect, subscribe, sendMessage,disconnect } = useWebSocket();
  const [showEmoji, setShowEmoji] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();
  const nav = useNavigation();
  const [isGroup, setIsGroup] = useState(false);

  //foward message
  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [additionalText, setAdditionalText] = useState('');

  //thông tin chi tiết của conver
  const [conversationInfo, setConversationInfo] = useState(null);

  // Lấy token khi component mount
  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          connect(); // Kết nối WebSocket sau khi có token
        }
      } catch (error) {
        console.error('Failed to get token:', error);
      }
    };
    
    getToken();

  }, []);

  // Lấy currentUserId từ AsyncStorage
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('id');
        console.log('currentUserId:', userId);
        if (userId) {
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error('Failed to get current user ID:', error);
      }
    };
    
    getCurrentUserId();
  }, []);

  // Hàm lấy danh sách conversation
  const fetchConversations = async () => {
    try {
      const response = await ApiService.getAllConversations();
      if (response?.data) {
        // Lọc bỏ conversation hiện tại
        const filteredConversations = response.data.filter(
          conv => conv.id !== conversationId
        );
        setConversations(filteredConversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  // cập nhật xem tin nhắn
  useEffect(() => {
    const markAsSeen = async () => {
      try {
        // Chỉ gọi API nếu conversationId hợp lệ và conversation đã có tin nhắn
        if (conversationId && conversationInfo?.messages?.length > 0) {
          await ApiService.seenMessage(conversationId);
        }
      } catch (error) {
        if (error.response?.status !== 404) { // Bỏ qua lỗi 404
          console.error('Error marking as seen:', error);
        }
      }
    };
    
    markAsSeen();
  }, [conversationId, conversationInfo?.messages]);

  // hàm lấy thông tin chi tiết của conver
  useEffect(() => {
    if(!conversationId) return;

    const fetchConversationDetails = async () => {
      try {
        const response = await ApiService.getConversationById(conversationId);
        setConversationInfo(response.data);
        setIsGroup(response.data.isGroup);
      } catch (err) {
        console.error("Lỗi khi lấy chi tiết cuộc trò chuyện", err);
      }
    };
  
    fetchConversationDetails();
  }, [conversationId]);



  // Lấy toàn bộ tin nhắn của conversation
  useEffect(() => {
    if (!conversationId || !currentUserId) return;
  
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getAllMessage(conversationId);
        
        // Check if response has the expected structure
        if (response && response.data) {
          // Chuyển đổi dữ liệu từ API sang định dạng phù hợp với UI
          const formattedMessages = response.data.map(msg => ({
            id: msg.id,
            text: msg.deleted ? "Tin nhắn đã được thu hồi" : msg.body, // CHANGED: from body to message
            sent: msg.sender.id === currentUserId,
            time: moment(msg.createdAt).format('HH:mm'),
            type: msg.image ? 'image' : 'text', // CHANGED: check for image
            imageUrl: msg.image, // CHANGED: from imageUrl to image
            user: {
              avatar: msg.sender.image || null,
              name: msg.sender.name || 'Người dùng',
            },
            createdAt: msg.createdAt,
            seen: msg.seen || [],
            senderId: msg.sender.id,
            deleted: msg.deleted || false
          }));
  
          // Sắp xếp tin nhắn mới nhất lên đầu (do sử dụng inverted FlatList)
          setMessages(formattedMessages.reverse());
        } else {
          console.error('Unexpected response format:', response);
          setMessages([]);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        // Set empty messages array on error to avoid crashes
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, [conversationId, currentUserId]);


  useEffect(() => {
    if (!conversationId || !currentUserId) return;
  
    const subscription = subscribe(
      `/topic/conversation/${conversationId}`,
      (newMessage) => {
        try{
        console.log('Received message from server:', newMessage);
  
        // Kiểm tra dữ liệu hợp lệ
        if (!newMessage || !newMessage.id) {
          console.warn('Received invalid message:', newMessage);
          return;
        }
  
        setMessages(prev => {
          
          if (newMessage.deleted) {
            return prev.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, text: "Tin nhắn đã được thu hồi", deleted: true }
                : msg
            );
          }
          // 1. Tìm và xóa tin nhắn tạm nếu có (nếu là tin nhắn của current user)
          const isCurrentUserMessage = newMessage.sender.id === currentUserId;
          const filteredMessages = isCurrentUserMessage 
            ? prev.filter(msg => !msg.id.startsWith('temp-'))
            : prev;
  
          // 2. Kiểm tra trùng lặp tin nhắn thật
          const isDuplicate = filteredMessages.some(msg => msg.id === newMessage.id);
          if (isDuplicate) {
            console.log('Skipping duplicate message');
            return filteredMessages;
          }
  
          // 3. Format tin nhắn mới
          const formattedMessage = {
            id: newMessage.id,
            text: newMessage.body || '',
            sent: newMessage.sender.id === currentUserId,
            time: moment(newMessage.createdAt).format('HH:mm'),
            type: newMessage.image ? 'image' : 'text',
            imageUrl: newMessage.image || null,
            user: {
              avatar: newMessage.sender.image,
              name: newMessage.sender.name || newMessage.sender.username || 'Người dùng',
            },
            createdAt: newMessage.createdAt,
            senderId: newMessage.sender.id,
            deleted: newMessage.deleted || false
          };
  
          // 4. Thêm tin nhắn mới vào đầu danh sách
          return [formattedMessage, ...filteredMessages];
        });
        }catch(error){
          console.error('Error processing WebSocket message:', error);
        }
      }
    );
  
    return () => {
      if (subscription) subscription();
    };
  }, [conversationId, currentUserId, subscribe]);//cũ thêm subcribe // Đã bỏ dependency messages để tránh loop vô hạn
  
  // Hàm gửi tin nhắn
  const handleSendMessage = async () => {
    if (!message.trim()) return;
  
    try {
      const messageToSend = message.trim();
      
      // Tạo tin nhắn tạm thời
      const tempMessage = {
        id: `temp-${Date.now()}`,
        text: messageToSend,
        sent: true,
        time: moment().format('HH:mm'),
        type: 'text',
        user: {
          id: currentUserId,
          avatar: null,
          name: 'Bạn',
        },
        createdAt: new Date().toISOString(),
      };
  
      // Thêm tin nhắn tạm vào state ngay lập tức
      setMessages(prev => [tempMessage, ...prev]);
      setMessage('');
  
      // Tạo payload gửi lên server
      const payload = {
        message: messageToSend,
        image: null // Thêm nếu có ảnh
      };
  
      console.log('Sending payload:', payload);
  
      // Gửi qua WebSocket
      const success = sendMessage(
        `/app/chat/${conversationId}`,
        payload
      );
  
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      }
  
      if (!success) {
        connect(); // Thử kết nối lại nếu gửi thất bại
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Nếu có lỗi, xóa tin nhắn tạm
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    }
  };


  // hàm xử lý xóa tin nhắn ở phía user đăng nhập
  const handleDeleteMessage = async (messageId) => {
    try {
      await ApiService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId)); // xóa khỏi UI
    } catch (err) {
      Alert.alert('Lỗi','Xóa tin nhắn thất bại')
      console.error("Lỗi khi xóa tin nhắn:", err);
    }
  };

  //hàm xử lý thu hồi tin nhắn
  const handleRecallMessage = async (messageId, conversationId) => {
    try {
      await ApiService.unsendMessage(messageId, conversationId); // gọi API thu hồi
      // không cần làm gì thêm ở đây nếu backend đã gửi message qua WebSocket
    } catch (error) {
      console.error("Thu hồi thất bại", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể thu hồi tin nhắn");
    }
  };

  // Hàm mở modal chuyển tiếp
  const handleOpenForwardModal = (message) => {
    setSelectedMessage(message);
    setSelectedConversations([]);
    setAdditionalText('');
    fetchConversations();
    setForwardModalVisible(true);
  };

  // Hàm chuyển tiếp tin nhắn
  const handleForwardMessage = async () => {
    if (!selectedMessage || selectedConversations.length === 0) return;

    try {
      const request = {
        messageId: selectedMessage.id,
        conversationIds: selectedConversations,
        body: additionalText
      };

      await ApiService.shareMessage(request);
      setForwardModalVisible(false);
      Alert.alert("Thành công", "Đã chuyển tiếp tin nhắn");
    } catch (error) {
      console.error("Forward failed:", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Chuyển tiếp thất bại");
    }
  };

  // Hàm chọn/bỏ chọn conversation
  const toggleConversationSelection = (conversationId) => {
    setSelectedConversations(prev => {
      if (prev.includes(conversationId)) {
        return prev.filter(id => id !== conversationId);
      } else {
        return [...prev, conversationId];
      }
    });
  };

  //hàm render message
  const renderMessage = ({ item }) => {

    //thao tác trên từng tin nhắn
    const handleLongPress = () => {

      // const options = ["Xóa", "Thu hồi", "Chuyển tiếp", "Hủy"];
      // const cancelButtonIndex = 3;
      const isMyMessage = item.senderId === currentUserId;
      const isRecalled = item.deleted;

      if(isRecalled){
        const options = ["Xóa", "Hủy"];
        const cancelButtonIndex = 1;
        
        showActionSheetWithOptions(
          { options, cancelButtonIndex },
          (buttonIndex) => {
            if (buttonIndex === 0) handleDeleteMessage(item.id);
          }
        );
        return;
      }
      
      
      
      
      const options = isMyMessage 
        ? ["Xóa", "Thu hồi", "Chuyển tiếp", "Hủy"]
        : ["Xóa", "Chuyển tiếp", "Hủy"];
      const cancelButtonIndex = options.length - 1;
  
      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            handleDeleteMessage(item.id);
          } else if (buttonIndex === 1 && isMyMessage) {
            handleRecallMessage(item.id,conversationId)
          } else if ((isMyMessage && buttonIndex === 2) || (!isMyMessage && buttonIndex === 1)) {
            handleOpenForwardModal(item);
          }
        }
      );
    };

    const showSenderName = isGroup && !item.sent;


    if (item.type === 'image' && item.imageUrl) {
      return (
        <TouchableOpacity onLongPress={handleLongPress}>
        <View style={[
          styles.messageContainer,
          item.sent ? styles.sentMessage : styles.receivedMessage
        ]}>
          {!item.sent && item.user?.avatar && (
            <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
          )}
          <View style={[
            styles.imageBubble,
            item.sent ? styles.sentBubble : styles.receivedBubble
            
          ]}>

            {showSenderName && (
              <Text style={styles.senderName}>{item.user?.name}</Text>
            )}
            {item.deleted ? (
            <View style={styles.recalledImageContainer}>
              <Text style={styles.recalledText}>Hình ảnh đã được thu hồi</Text>
            </View>
          ) : (
            <>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              
            </>
          )}
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          {item.reactions && (
            <View style={styles.reactionContainer}>
              <Heart fill="#ff0000" stroke="#ff0000" width={16} height={16} />
            </View>
          )}
        </View>
      </TouchableOpacity>
      );
      
    }
    
    return (
      <TouchableOpacity onLongPress={handleLongPress}>
      <View style={[
        styles.messageContainer,
        item.sent ? styles.sentMessage : styles.receivedMessage
      ]}>
        {!item.sent && item.user?.avatar && (
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        )}
        <View style={[
          styles.messageBubble,
          item.sent ? styles.sentBubble : styles.receivedBubble
        ]}>

            {showSenderName && (
              <Text style={styles.senderName}>{item.user?.name}</Text>
            )}
          <Text style={[
            styles.messageText,
            item.sent ? styles.sentText : styles.receivedText,
            item.deleted && styles.recalledText
          ]}>
            {item.text}
          </Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        {item.reactions && (
          <View style={styles.reactionContainer}>
            <Heart fill="#ff0000" stroke="#ff0000" width={16} height={16} />
          </View>
        )}
      </View>
      </TouchableOpacity>
    );
  };

//handle gui hinh anh
  const handleSendImage = async (imageUri) => {
    try {
      // 1. Tạo tin nhắn tạm với ảnh local
      const tempId = `temp-${Date.now()}`;
      setMessages(prev => [{
        id: tempId,
        text: '',
        sent: true,
        time: moment().format('HH:mm'),
        type: 'image',
        imageUrl: imageUri, // Hiển thị ảnh local trước
        user: { avatar: null, name: 'Bạn' },
        createdAt: new Date().toISOString(),
        status: 'uploading'
      }, ...prev]);
  
      // 2. Nén ảnh NHIỀU HƠN trước khi gửi
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 250 } }], // Giảm kích thước xuống 400px
        { compress: 0.2, format: ImageManipulator.SaveFormat.JPEG } // Giảm chất lượng xuống 30%
      );
  
      // 3. Đọc file thành base64 (chỉ gửi qua WebSocket)
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      const mimeType = mime.lookup(manipResult.uri.split('/').pop()) || 'image/jpeg';
      const fullBase64 = `data:${mimeType};base64,${base64}`;
      
      // Kiểm tra kích thước base64
      console.log('Base64 length:', fullBase64.length);
      if (fullBase64.length > 1000000) { // Nếu lớn hơn ~1MB
        throw new Error('Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn');
      }
  
      // 4. Gửi qua WebSocket (backend sẽ tự upload lên S3)
      console.log('Sending image via WebSocket...');
      const success = sendMessage(`/app/chat/${conversationId}`, {
        message: '', // Sử dụng chuỗi rỗng thay vì null
        image: fullBase64
      });
      
      console.log('WebSocket send result:', success);
      
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
      }
      
      if (!success) {
        console.log('Trying to reconnect WebSocket...');
        connect(); // Thử kết nối lại nếu gửi thất bại
      }
  
    } catch (err) {
      console.error('Lỗi gửi ảnh:', err);
      // Cập nhật UI để hiển thị lỗi
      setMessages(prev => prev.map(msg => 
        msg.id.startsWith('temp-') && msg.type === 'image'
          ? { ...msg, status: 'error', error: err.message || 'Gửi ảnh thất bại' } 
          : msg
      ));
      
      Alert.alert("Lỗi", err.message || "Không thể gửi ảnh. Vui lòng thử lại.");
    }
  };


  //hàm chọn ảnh
  const pickImage = async () => {
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Ứng dụng cần quyền truy cập thư viện ảnh để gửi hình.');
        return
      }


    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      await handleSendImage(imageUri);
    }
  };
  

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0088ff" />
      </SafeAreaView>
    );
  }

  const handleSendFile = async (fileUri, fileName) => {
    try {
      // 1. Tạo tin nhắn tạm
      const tempId = `temp-${Date.now()}`;
      setMessages(prev => [{
        id: tempId,
        text: '',
        sent: true,
        time: moment().format('HH:mm'),
        type: 'file',
        fileInfo: {
          uri: fileUri,
          name: fileName,
          size: (FileSystem.getInfoAsync(fileUri)).size
        },
        user: { avatar: null, name: 'Bạn' },
        createdAt: new Date().toISOString(),
        status: 'uploading'
      }, ...prev]);
  
      // 2. Đọc file thành base64 (giống cách bạn làm với ảnh)
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      const mimeType = mime.lookup(fileName) || 'application/pdf';
      const fullBase64 = `data:${mimeType};base64,${base64}`;
  
      // 3. Gửi qua WebSocket NHƯ ẢNH (sử dụng trường image)
      const success = sendMessage(`/app/chat/${conversationId}`, {
        message: `[FILE]${fileName}`, // Đánh dấu đây là file + tên file
        image: fullBase64 // Gửi qua trường image
      });
  
      if (!success) {
        connect(); // Thử kết nối lại nếu gửi thất bại
      }
  
    } catch (err) {
      console.error('Lỗi gửi file:', err);
      setMessages(prev => prev.map(msg => 
        msg.id.startsWith('temp-') && msg.type === 'file'
          ? { ...msg, status: 'error', error: err.message || 'Gửi file thất bại' } 
          : msg
      ));
      Alert.alert("Lỗi", err.message || "Không thể gửi file");
    }
  };


  //hàm xử lý khi nhấn vào nút chọn file gửi
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true, // Copy file vào bộ nhớ tạm của app
      });
  
      if (result.type === 'success') {
        await handleSendFile(result.uri, result.name);
      }
    } catch (err) {
      console.error('Lỗi khi chọn file:', err);
      Alert.alert('Lỗi', 'Không thể chọn file');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0088ff', '#0055ff']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {nav.navigate('Home'),
             disconnect()}
            }
          >
            <ChevronLeft stroke="#fff" width={24} height={24} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>
              {
                conversationInfo
                ? (conversationInfo.isGroup
                  ? conversationInfo.name
                  : conversationInfo.users?.find(user => user.id !== currentUserId)?.name || 'Chat')
                : 'Đang tải...'
              }
            </Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Phone stroke="#fff" width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Video stroke="#fff" width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => nav.navigate('Options', {conversationId: conversationId})}>
              <Menu stroke="#fff" width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageContent}
            inverted
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        </View>

        {showEmoji && ( //set emoji
            <EmojiSelector
              onEmojiSelected={emoji => {
                setMessage(prev => prev + emoji); // thêm emoji vào input
                setShowEmoji(false);
              }}
            />
          )}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputButton} onPress={() => setShowEmoji(!showEmoji)}>
            <Smile stroke="#666" width={24} height={24} />
          </TouchableOpacity>
          
          

          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={message}
            onChangeText={setMessage}
            multiline
            onSubmitEditing={handleSendMessage}
          />

          {message.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send stroke="#0088ff" width={24} height={24} />
            </TouchableOpacity>
          ) : (
            <View style={styles.attachmentButtons}>
              <TouchableOpacity style={styles.inputButton} onPress={handlePickDocument}>
                <File stroke="#666" width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.inputButton}
                // Uncomment to enable image sending
                // onPress={() => pickImage()}
                onPress={pickImage}
              >
                <ImageIcon stroke="#666" width={24} height={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={forwardModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setForwardModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn hội thoại để chuyển tiếp</Text>
            <TouchableOpacity onPress={() => setForwardModalVisible(false)}>
              <Text style={styles.closeButton}>Đóng</Text>
            </TouchableOpacity>
          </View>

          {/* Hiển thị tin nhắn sẽ chuyển tiếp */}
          {selectedMessage && (
            <View style={styles.messagePreview}>
              <Text style={styles.previewTitle}>Tin nhắn sẽ chuyển tiếp:</Text>
              {selectedMessage.type === 'image' ? (
                <Image source={{ uri: selectedMessage.imageUrl }} style={styles.previewImage} />
              ) : (
                <Text style={styles.previewText}>{selectedMessage.text}</Text>
              )}
            </View>
          )}

          {/* Input thêm nội dung */}
          <TextInput
            style={styles.additionalTextInput}
            placeholder="Thêm nội dung (tuỳ chọn)"
            value={additionalText}
            onChangeText={setAdditionalText}
            multiline
          />

          {/* Danh sách conversation */}
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.conversationItem,
                  selectedConversations.includes(item.id) && styles.selectedConversation
                ]}
                onPress={() => toggleConversationSelection(item.id)}
              >
                <View style={styles.checkboxContainer}>
                  {selectedConversations.includes(item.id) ? (
                    <Icon name="check-circle" size={24} color="#007AFF" />
                  ) : (
                    <Icon name="circle" size={24} color="#ccc" />
                  )}
                </View>
                
                {item.isGroup ? (
                  <View style={styles.groupAvatarContainer}>
                    {/* Hiển thị avatar nhóm */}
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.users.find(u => u.id !== currentUserId)?.image }}
                    style={styles.avatar}
                  />
                )}
                
                <View style={styles.conversationInfo}>
                  <Text style={styles.conversationName}>
                    {item.isGroup 
                      ? item.name 
                      : item.users.find(u => u.id !== currentUserId)?.name}
                  </Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage?.text || "Không có tin nhắn"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[
              styles.forwardButton,
              selectedConversations.length === 0 && styles.disabledButton
            ]}
            onPress={handleForwardMessage}
            disabled={selectedConversations.length === 0}
          >
            <Text style={styles.forwardButtonText}>
              Chuyển tiếp ({selectedConversations.length})
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>

    
  );
};

const styles = StyleSheet.create({
  // Your existing styles remain unchanged
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 20,
    padding: 12,
  },
  imageBubble: {
    maxWidth: '70%',
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#fff',
  },
  sentBubble: {
    backgroundColor: '#e3f2fd',
  },
  receivedBubble: {
    backgroundColor: '#fff',
  },
  messageImage: {
    width: 200,
    height: 300,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: 'bold'
  },
  sentText: {
    color: '#000',
  },
  receivedText: {
    color: '#000',
  },
  recalledText: {
    fontStyle: 'italic',
    color: 'gray',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  reactionContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    padding: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  attachmentButtons: {
    flexDirection: 'row',
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedConversation: {
    backgroundColor: '#f5f5f5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  forwardButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  forwardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagePreview: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
  previewTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  additionalTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 60,
  },
  checkboxContainer: {
    marginRight: 12,
  },
});

export default ChatScreen;