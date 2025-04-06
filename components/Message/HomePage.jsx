import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  Modal,
  ActivityIndicator
} from 'react-native';
import { MessageCircle, Users, User, Plus, Search, UserPlus, Users as UsersGroup } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import BottomMenuBar from '../Sidebar/BottomMenuBar';
import ApiService from '../../services/apis';

const HomePage = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getAllConversations();
        if (response && response.data) {
          setConversations(response.data);
        }
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách trò chuyện');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getConversationName = (conversation) => {
    if (conversation.isGroup) {
      return conversation.name || 'Nhóm không tên';
    } else {
      // Trường hợp không phải nhóm, hiển thị tên người dùng khác trong cuộc trò chuyện
      // Bạn cần thêm logic để lấy tên người dùng khác ở đây
      // Ví dụ: lọc ra user khác với user hiện tại
      return 'Người dùng cá nhân'; // Tạm thời để như vậy, bạn cần cập nhật
    }
  };

  const getAvatar = (conversation) => {
    // Nếu là nhóm hoặc chưa có avatar, trả về avatar mặc định
    // Bạn có thể thêm logic để lấy avatar của người dùng khác nếu là chat cá nhân
    return conversation.isGroup 
      ? 'https://i.pravatar.cc/100?img=3' 
      : 'https://i.pravatar.cc/100?img=1';
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
    >
      <Image source={{ uri: getAvatar(item) }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{getConversationName(item)}</Text>
          <Text style={styles.chatDate}>{formatDate(item.lastMessageAt)}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {/* Bạn có thể thêm logic hiển thị tin nhắn cuối cùng ở đây */}
          {item.lastMessage || 'Bắt đầu trò chuyện'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0088ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0088ff', '#0055ff']}
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <Search stroke="#fff" width={24} height={24} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#fff"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Plus stroke="#fff" width={24} height={24} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={conversations}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        style={styles.chatList}
      />

      <BottomMenuBar navigation={navigation} activeTab={activeTab} />
      
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalItem}>
              <UserPlus stroke="#666" width={24} height={24} />
              <Text style={styles.modalText}>Thêm bạn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem}>
              <UsersGroup stroke="#666" width={24} height={24} />
              <Text style={styles.modalText}>Tạo nhóm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    color: '#fff',
    fontSize: 16,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatDate: {
    fontSize: 14,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#0088ff',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#0088ff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginTop: 80,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalText: {
    fontSize: 16,
    marginLeft: 12,
  },
});

export default HomePage;