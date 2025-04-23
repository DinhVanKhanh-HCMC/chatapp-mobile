import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MessageCircle, Users, User, Plus, Search, UserPlus, Users as UsersGroup, ArrowLeft, X } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import BottomMenuBar from '../Sidebar/BottomMenuBar';
import ApiService from '../../services/apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash/debounce';
import { useNavigation } from '@react-navigation/native';

const HomePage = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversationNames, setConversationNames] = useState({});
  const [conversationImages, setConversationImages] = useState({});
  const [currentId, setCurrentId] = useState(null);
  const nav = useNavigation()
  
  // New states for phone search functionality
  const [showPhoneSearchModal, setShowPhoneSearchModal] = useState(false);
  const [phoneSearchResults, setPhoneSearchResults] = useState([]);
  const [phoneSearchLoading, setPhoneSearchLoading] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState('all');
  const [lastMessages, setLastMessages] = useState({});
  //friend
  const [friendStatusMap, setFriendStatusMap] = useState({});
  //online user:
  const [onlineUsers, setOnlineUsers] = useState([]);
  //seen message
  const [unseenMessages, setUnseenMessages] = useState([]);


  //get user online
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await ApiService.getOnlineUsers(); // không cần truyền gì
        if (response.code === 200 && Array.isArray(response.data)) {
          setOnlineUsers(response.data); // Lấy mảng user từ response.data
        } else {
          console.error('Dữ liệu không hợp lệ:', response);
          setOnlineUsers([]); // Đặt mảng rỗng nếu dữ liệu không hợp lệ
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách online:',response.message );
      }
    };
  
    fetchOnlineUsers();
  }, []);

  const getRandomColor = () => {
    const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useFocusEffect(
  //useEffect(() => {
  useCallback(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getAllConversations();
        if (response && response.data) {
          
          
          // Lấy tên cho tất cả các cuộc trò chuyện
          const names = {};
          const avts = {};
          const currentUserId = await AsyncStorage.getItem('id');
          setCurrentId(currentUserId);
          const lastMessagesMap = {};
          const unseenMessages = {};
          // const allUsersResponse = await ApiService.getAllUser();
          // const allUsers = allUsersResponse.data; // Giả sử data chứa danh sách users

          for (const conversation of response.data) {

            if (conversation.isGroup) {
              names[conversation.id] = conversation.name || 'Nhóm không tên';
              //avts[conversation.id] = conversation.image || 'https://i.pravatar.cc/100?img=3';
              // avts[conversation.id] = conversation.image || 
              //   `initial:${conversation.name ? conversation.name.charAt(0).toUpperCase() : '?'}`;

              avts[conversation.id] = {
                type: conversation.image ? 'image' : 'initial',
                value: conversation.image || (conversation.name ? conversation.name.charAt(0).toUpperCase() : '?'),
                backgroundColor: getRandomColor() // Hàm tạo màu ngẫu nhiên
              };
            } else {
              const otherMember = conversation.users?.find(
                member => member.id !== currentUserId
              );
              
              if (otherMember) {
                // Tìm user trong danh sách allUsers đã lấy trước đó
                //const user = allUsers.find(u => u.id === otherMember.userId);
                names[conversation.id] = otherMember?.name || 'Người dùng';
                avts[conversation.id] = otherMember?.image || 'https://i.pravatar.cc/100?img=1';
              } else {
                names[conversation.id] = 'Người dùng';
                avts[conversation.id] = 'https://i.pravatar.cc/100?img=1';
              }
            }

            // Lấy tin nhắn cuối cùng
            const messages = conversation.messages || [];
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

            if (lastMessage) {
              const isSenderMe = lastMessage.sender.id === currentUserId;
              const prefix = isSenderMe ? 'Bạn: ' : '';
              const messageText = lastMessage.deleted ? '[Tin nhắn đã thu hồi]' : lastMessage.body;
              lastMessagesMap[conversation.id] = prefix + messageText;

              // Kiểm tra tin nhắn chưa đọc
              unseenMessages[conversation.id] = !isSenderMe && 
              (!lastMessage.seen || 
              !lastMessage.seen.some(seenUser => seenUser.id === currentUserId));

            } else {
              lastMessagesMap[conversation.id] = 'Bắt đầu trò chuyện';
              unseenMessages[conversation.id] = false;
            }


            
          }
          const sortedConversations = [...response.data].sort((a, b) => {
            const dateA = new Date(a.lastMessageAt || a.createdAt);
            const dateB = new Date(b.lastMessageAt || b.createdAt);
            return dateB - dateA; // Sắp xếp giảm dần (mới nhất lên đầu)
          });

          setConversations(sortedConversations);
          setConversationNames(names);
          setConversationImages(avts);
          setLastMessages(lastMessagesMap)
          setUnseenMessages(unseenMessages);
        }
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách trò chuyện');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])
  );

  // Thêm useEffect để cập nhật khi focus lại màn hình
  useFocusEffect(
    useCallback(() => {
      const updateSeenStatus = async () => {
        const updatedUnseenMessages = {...unseenMessages};
        
        for (const conversation of conversations) {
          const messages = conversation.messages || [];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.sender.id !== currentId) {
            updatedUnseenMessages[conversation.id] = 
              !lastMessage.seen || 
              !lastMessage.seen.some(seenUser => seenUser.id === currentId);
          }
        }
        
        setUnseenMessages(updatedUnseenMessages);
      };
      
      updateSeenStatus();
    }, [conversations])
  );
  

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const renderChatItem = ({ item }) => {
     // Lấy danh sách user IDs trong cuộc trò chuyện (trừ ID của chính mình)
    const otherUserIds = item.users
    .filter(user => user && user.id !== currentId) // currentUserId là ID của bạn
    .map(user => user.id);
    

    // Kiểm tra xem có user nào trong danh sách online không
    const isOnline = Array.isArray(onlineUsers) && 
      onlineUsers.some(onlineUser => 
        otherUserIds.includes(onlineUser.id)
    );
  
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatScreen', { conversationId: item.id })}
      >
        <View style={styles.avatarWrapper}>
        {conversationImages[item.id]?.type === 'initial' ? (
          <View style={[
            styles.avatarInitial, 
            { backgroundColor: conversationImages[item.id].backgroundColor }
          ]}>
            <Text style={styles.initialText}>
              {conversationImages[item.id].value}
            </Text>
          </View>
        ) : (
          <Image 
            source={{ uri: conversationImages[item.id] || 'https://i.pravatar.cc/100' }} 
            style={styles.avatar} 
          />
        )}
  
          {isOnline && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
  
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{conversationNames[item.id] || 'Đang tải...'}</Text>
            <Text style={styles.chatDate}>{formatDate(item.lastMessageAt)}</Text>
          </View>
          <Text style={[styles.lastMessage,unseenMessages[item.id] && styles.unseenMessage]} numberOfLines={1}>
            {lastMessages[item.id] || 'Bắt đầu trò chuyện'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Function to validate Vietnamese phone number
  const isValidPhoneNumber = (phone) => {
    // Basic Vietnamese phone number validation (10 digits starting with 0)
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Function to handle search submission
  const handleSearchSubmit = () => {
    if (isValidPhoneNumber(searchQuery.trim())) {
      setPhoneSearchResults([]);
      searchUserByPhone(searchQuery.trim());
    }
  };

  // Mock function to search user by phone (replace with actual API call)
  const searchUserByPhone = async (phoneNumber) => {
    setPhoneSearchLoading(true);
    try {
      // Gọi API thực tế thay vì mock data
      const response = await ApiService.getInfoByPhone(phoneNumber);
      console.log(response.data.name)
      if (response.data) {
        const userData = response.data;
        setPhoneSearchResults([{
          id: userData.id,
          name: userData.name,
          phoneNumber: userData.phoneNumber || phoneNumber,
          avatar: userData.image || 'https://i.pravatar.cc/100?img=5' // Fallback avatar nếu không có
        }]);
      } else {
        // Nếu không có dữ liệu, hiển thị thông báo hoặc để mảng rỗng
        setPhoneSearchResults([]);
        // Hoặc có thể hiển thị thông báo không tìm thấy
        Alert.alert('Thông báo', 'Không tìm thấy người dùng với số điện thoại này');
      }
      
      setPhoneSearchLoading(false);
      setShowPhoneSearchModal(true);
    } catch (err) {
      console.error('Error searching for user:', err);
      setPhoneSearchLoading(false);
      setPhoneSearchResults([]);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi tìm kiếm người dùng');
    }
  };

  // hàm xử lý khi nhấn vào nút Kết bạn
  const handleAddFriend = async (userId) => {
    try {
      const response = await ApiService.sendRequestFriend(userId);
  
      if (response.data.status === 'PENDING') {
        setFriendStatusMap(prev => ({
          ...prev,
          [userId]: response.data.status,
        }));
      }
    } catch (error) {
      console.error('Lỗi gửi lời mời kết bạn:', error);
    }
  };
  

  // Render user search result
  const renderUserSearchResult = ({ item }) => {
    const status = friendStatusMap[item.id];
    return(
      <View style={styles.searchResultItem}>
        <Image source={{ uri: item.avatar }} style={styles.searchResultAvatar} />
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultName}>{item.name}</Text>

          {status === 'PENDING' && (
            <Text style={styles.requestSentText}>Đã gửi lời mời kết bạn</Text>
          )}

          {!status && (
          <Text style={styles.searchResultPhone}>Số điện thoại: {item.phoneNumber}</Text>
        )}
        </View>
        {String(item.id) !== String(currentId) && !status &&(
        <TouchableOpacity style={styles.addFriendButton} onPress={() => handleAddFriend(item.id)}>
          <Text style={styles.addFriendButtonText}>Kết bạn</Text>
        </TouchableOpacity>
        )}
      </View>
    )
  };

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

  const closeModal = () => {
    setShowPhoneSearchModal(false);
    setSearchQuery('');
    setPhoneSearchResults([]); // 👈 clear kết quả
  };

  return (
    //render giao dien man hinh tin nhan
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
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
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
            <TouchableOpacity style={styles.modalItem} 
            onPress={() => {
              setShowModal(false);
              setShowPhoneSearchModal(true);
              }}>
              <UserPlus stroke="#666" width={24} height={24} />
              <Text style={styles.modalText}>Thêm bạn</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={()=> {setShowModal(false);nav.navigate('CreateGroupScreen')}}>
              <UsersGroup stroke="#666" width={24} height={24} />
              <Text style={styles.modalText}>Tạo nhóm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      
      {/* Phone Search Modal */}
      <Modal
        visible={showPhoneSearchModal}
        animationType="slide"
        onRequestClose={() => setShowPhoneSearchModal(false)}
      >
        <SafeAreaView style={styles.phoneSearchModalContainer}>
          <View style={styles.phoneSearchHeader}>
            <TouchableOpacity 
              style={styles.phoneSearchBackButton}
              onPress={closeModal}
            >
              <ArrowLeft stroke="#000" width={24} height={24} />
            </TouchableOpacity>
            <View style={styles.phoneSearchInputContainer}>
              <TextInput
                style={styles.phoneSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                >
                  <X stroke="#888" width={20} height={20} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.phoneSearchTabs}>
            <TouchableOpacity 
              style={[
                styles.phoneSearchTab, 
                activeSearchTab === 'all' && styles.phoneSearchTabActive
              ]}
              onPress={() => setActiveSearchTab('all')}
            >
              <Text style={[
                styles.phoneSearchTabText,
                activeSearchTab === 'all' && styles.phoneSearchTabTextActive
              ]}>Tất cả</Text>
              {activeSearchTab === 'all' && <View style={styles.phoneSearchTabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.phoneSearchTab, 
                activeSearchTab === 'discover' && styles.phoneSearchTabActive
              ]}
              onPress={() => setActiveSearchTab('discover')}
            >
              <Text style={[
                styles.phoneSearchTabText,
                activeSearchTab === 'discover' && styles.phoneSearchTabTextActive
              ]}>Khám phá</Text>
              {activeSearchTab === 'discover' && <View style={styles.phoneSearchTabIndicator} />}
            </TouchableOpacity>
          </View>

          <View style={styles.phoneSearchContent}>
            {phoneSearchLoading ? (
              <ActivityIndicator size="large" color="#0088ff" style={styles.phoneSearchLoading} />
            ) : (
              <>
                <Text style={styles.phoneSearchResultTitle}>
                  Tìm bạn qua số điện thoại ({phoneSearchResults.length})
                </Text>
                <FlatList
                  data={phoneSearchResults}
                  renderItem={renderUserSearchResult}
                  keyExtractor={item => item.id}
                  style={styles.phoneSearchResultList}
                />
              </>
            )}
          </View>
        </SafeAreaView>
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
    overflow: 'visible',
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
  avatarWrapper: {
    position: 'relative',
    width: 50,
    height: 50,
    marginRight: 10,
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
  // Phone search modal styles
  phoneSearchModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  phoneSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0088ff',
  },
  phoneSearchBackButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 12,
  },
  phoneSearchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  phoneSearchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 4,
  },
  phoneSearchTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  phoneSearchTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  phoneSearchTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  phoneSearchTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888',
  },
  phoneSearchTabTextActive: {
    color: '#000',
  },
  phoneSearchTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: '100%',
    backgroundColor: '#000',
  },
  phoneSearchContent: {
    flex: 1,
    padding: 16,
  },
  phoneSearchLoading: {
    marginTop: 40,
  },
  phoneSearchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  phoneSearchResultList: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 16,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultPhone: {
    fontSize: 14,
    color: '#666',
  },
  addFriendButton: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addFriendButtonText: {
    color: '#0088ff',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50', // màu xanh lá
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1, // viền trắng
  },
  unseenMessage: {
    fontWeight: 'bold',
    color: 'black' // Hoặc màu bạn muốn
  },
   avatarInitial: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default HomePage;