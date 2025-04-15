import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
} from 'react-native';
import { ChevronLeft } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../services/apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FriendRequest = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  //lay id user hien tai
  useEffect(() =>{
    const fetchData = async () =>{
      try {
        const currentUserId = await AsyncStorage.getItem('id');
        setCurrentId(currentUserId);
        console.log('currentUserId:', currentUserId);
      } catch (error) {
        console.error(error);
        
      }
    };
    fetchData();
  }, []);

  //fetch các lời mời kết bạn đã nhận
  useEffect(() => {
    loadReceivedFriendRequests();
  }, []);
  
  const loadReceivedFriendRequests = async () => {
    try {
      // 1. Gọi API lấy lời mời kết bạn
      const response = await ApiService.getFriendRequest();
      const friendRequests = response.data;
  
      // 2. Gọi API lấy toàn bộ user
      const userResponse = await ApiService.getAllUser();
      const allUsers = userResponse.data;
  
      // 3. Map lời mời với thông tin người gửi
      const mappedRequests = friendRequests.map(req => {
        const sender = allUsers.find(user => user.id === req.userId);
        return {
          id: sender.id,
          name: sender.name,
          avatar: sender.image || null,
          status: 'Muốn kết bạn'
        };
      });
  
      setReceivedRequests(mappedRequests);
    } catch (error) {
      console.error('Lỗi khi lấy lời mời kết bạn:', error);
    }
  };
  

  //fetch các lời mời kết bạn đã gửi
  useEffect(() => {
    if (currentId) {
      loadSentFriendRequests();
    }
  }, [currentId]);

  const loadSentFriendRequests = async () => {
    try {
      // 1. Gọi API lấy tất cả các quan hệ bạn bè
      const response = await ApiService.getFriendUserLogin(); // hoặc ApiService.getAllFriendships nếu có
      const allFriendships = response.data;
  
      // 2. Gọi API lấy toàn bộ user
      const userResponse = await ApiService.getAllUser();
      const allUsers = userResponse.data;
  
      // 3. Lọc ra những lời mời mà user hiện tại là người gửi và đang chờ xác nhận
      const sentPendingRequests = allFriendships.filter(
        req => req.userId === currentId && req.status === 'PENDING'
      );
  
      // 4. Map thông tin bạn bè từ danh sách người dùng
      const mappedRequests = sentPendingRequests.map(req => {
        const receiver = allUsers.find(user => user.id === req.friendId);
        return {
          id: receiver.id,
          name: receiver.name,
          avatar: receiver.image || null,
          status: 'Đã gửi lời mời kết bạn',
        };
      });
  
      setSentRequests(mappedRequests);
    } catch (error) {
      console.error('Lỗi khi lấy lời mời đã gửi:', error);
    }
  };

  // const sentRequests = [
  //   {
  //     id: '1',
  //     name: 'Nguyễn Văn A',
  //     avatar: 'https://i.pravatar.cc/100?img=3',
  //     status: 'Đã gửi lời mời kết bạn',
  //   },
  //   {
  //     id: '2',
  //     name: 'Trần Thị B',
  //     avatar: null,
  //     initials: 'TB',
  //     status: 'Đã gửi lời mời kết bạn',
  //     backgroundColor: '#5c6bc0',
  //   },
  //   // Add more sent requests as needed
  // ];

  const renderAvatar = (item) => {
    if (item.avatar) {
      return <Image source={{ uri: item.avatar }} style={styles.avatar} />;
    }
    return (
      <Image source={{ uri: 'https://i.pravatar.cc/100?img=3' }} style={styles.avatar} />
    );
  };

  const renderReceivedItem = ({ item, index}) => {
    const handleDecline = async () => {
      try {
        await ApiService.unFriend(item.id);
        const updated = [...receivedRequests];
        updated[index].status = 'Đã từ chối lời mời';
        setReceivedRequests(updated);
      } catch (error) {
        console.error('Lỗi khi từ chối lời mời:', error);
      }
    };
  
    const handleAccept = async () => {
      try {
        await ApiService.acceptFriend(item.id);
        const updated = [...receivedRequests];
        updated[index].status = 'Đã chấp nhận lời mời';
        setReceivedRequests(updated);
      } catch (error) {
        console.error('Lỗi khi chấp nhận lời mời:', error);
      }
    };
  
    return (
      <View style={styles.requestItem}>
        {renderAvatar(item)}
        <View style={styles.requestInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.status}>{item.status}</Text>
          {item.status === 'Muốn kết bạn' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                <Text style={styles.declineButtonText}>Từ chối</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.acceptButtonText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSentItem = ({ item, index }) => {
    const handleCancle = async () => {
      try {
        await ApiService.unFriend(item.id);
        const updated = [...sentRequests];
        updated[index].status = 'Đã hủy lời mời kết bạn';
        setSentRequests(updated);
      } catch (error) {
        console.error('Lỗi khi hủy lời mời:', error);
      }
    };

    return (
      <View style={styles.requestItem}>
        {renderAvatar(item)}
        <View style={styles.requestInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.status}>{item.status}</Text>
          {item.status === 'Đã gửi lời mời kết bạn' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.declineButton} onPress={handleCancle}>
                <Text style={styles.declineButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    )
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0088ff', '#0055ff']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft stroke="#fff" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lời mời kết bạn</Text>
      </LinearGradient>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Đã nhận {receivedRequests.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Đã gửi {sentRequests.length}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'received' ? receivedRequests : sentRequests}
        renderItem={({ item, index }) =>
          activeTab === 'received'
            ? renderReceivedItem({ item, index })
            : renderSentItem({ item, index })
        }
        keyExtractor={item => item.id}
        style={styles.list}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0088ff',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#0088ff',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  requestItem: {
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
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  declineButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 8,
  },
  declineButtonText: {
    color: '#666',
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: '#e8f0fe',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  acceptButtonText: {
    color: '#0088ff',
    fontSize: 14,
  },
});

export default FriendRequest;