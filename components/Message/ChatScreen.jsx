import React, { useState } from 'react';
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
} from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';

const ChatScreen = ({ navigation, route }) => {
  const [message, setMessage] = useState('');
  
  const messages = [
    {
      id: '1',
      text: 'Oke vậy để tui nhắn tụi ns',
      sent: true,
      time: '15:53',
      type: 'text',
    },
    {
      id: '2',
      type: 'image',
      sent: false,
      time: '19:53',
      user: {
        avatar: 'https://i.pravatar.cc/100?img=1',
      },
      imageUrl: 'https://picsum.photos/300/200',
      reactions: ['heart'],
    },
    {
      id: '3',
      text: 'ok phét',
      sent: false,
      time: '19:53',
      user: {
        avatar: 'https://i.pravatar.cc/100?img=1',
      },
      type: 'text',
    },
    {
      id: '4',
      text: 'Đỉnh đấy bro',
      sent: true,
      time: '19:54',
      type: 'text',
    },
    {
      id: '5',
      text: 'Chắc nhóm mình làm nhanh nhất rồi',
      sent: true,
      time: '19:54',
      type: 'text',
    },
    {
      id: '6',
      text: 'Mấy thằng bạn ông học lớp kia làm xong ch',
      sent: true,
      time: '19:54',
      type: 'text',
    },
    {
      id: '7',
      text: 'mới làm login vs regis',
      sent: false,
      time: '19:54',
      user: {
        avatar: 'https://i.pravatar.cc/100?img=1',
      },
      type: 'text',
    },
  ];

  const renderMessage = ({ item }) => {
    if (item.type === 'image') {
      return (
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
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          {item.reactions && (
            <View style={styles.reactionContainer}>
              <Heart fill="#ff0000" stroke="#ff0000" width={16} height={16} />
            </View>
          )}
        </View>
      );
    }
    
    return (
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
          <Text style={[
            styles.messageText,
            item.sent ? styles.sentText : styles.receivedText
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
    );
  };

  const sendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
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
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft stroke="#fff" width={24} height={24} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Tuấn Anh</Text>
            <Text style={styles.headerStatus}>Truy cập 12 giờ trước</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Phone stroke="#fff" width={24} height={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Video stroke="#fff" width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            style={styles.messageList}
            contentContainerStyle={styles.messageContent}
            inverted
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputButton}>
            <Smile stroke="#666" width={24} height={24} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Tin nhắn"
            value={message}
            onChangeText={setMessage}
            multiline
          />

          {message.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Send stroke="#0088ff" width={24} height={24} />
            </TouchableOpacity>
          ) : (
            <View style={styles.attachmentButtons}>
              <TouchableOpacity style={styles.inputButton}>
                <File stroke="#666" width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputButton}>
                <ImageIcon stroke="#666" width={24} height={24} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
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
    height: 150,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 16,
  },
  sentText: {
    color: '#000',
  },
  receivedText: {
    color: '#000',
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
});

export default ChatScreen;