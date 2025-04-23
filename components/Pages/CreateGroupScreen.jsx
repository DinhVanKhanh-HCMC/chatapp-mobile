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
  ActivityIndicator,
} from 'react-native';
import { X, Camera, Search } from 'react-native-feather';
import ApiService from '../../services/apis';

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // const friends = [
  //   {
  //     id: '1',
  //     name: 'Tuấn Anh',
  //     avatar: 'https://i.pravatar.cc/100?img=1',
  //     lastActive: '14 giờ trước',
  //   },
  //   {
  //     id: '2',
  //     name: 'Hưng Wibruh',
  //     avatar: null,
  //     initials: 'HW',
  //     lastActive: '15 giờ trước',
  //     backgroundColor: '#00bcd4',
  //   },
  //   // Add more friends as needed
  // ];

  // Lấy danh sách bạn bè từ API
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await ApiService.getFriendUserLogin();
        if (response.code === 200) {
          setFriends(response.data);
        } else {
          Alert.alert('Lỗi', 'Không thể lấy danh sách bạn bè');
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách bạn bè:', error);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi khi lấy danh sách bạn bè');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const toggleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleCreateGroup = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một thành viên');
      return;
    }

    if (!groupName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên nhóm');
      return;
    }

    setIsCreating(true);
    try {
      const data = {
        name: groupName,
        users: selectedFriends.map(id => ({ id }))
      };

      const response = await ApiService.createConversation(data);
      
      if (response.code === 200) {
        navigation.navigate('ChatScreen', { conversationId: response.data.id });
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tạo nhóm');
      }
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo nhóm');
    } finally {
      setIsCreating(false);
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => toggleFriendSelection(item.friendId)}
    >
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          selectedFriends.includes(item.friendId) && styles.checkboxSelected
        ]} />
      </View>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: item.backgroundColor || '#ccc' }]}>
          <Text style={styles.avatarInitials}>
            {item.friendName ? item.friendName.charAt(0) : '?'}
          </Text>
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.friendName}</Text>
        
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0088ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <X width={24} height={24} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Nhóm mới</Text>
          <Text style={styles.subtitle}>Đã chọn: {selectedFriends.length}</Text>
        </View>
      </View>

      <View style={styles.groupInfo}>
        <TouchableOpacity style={styles.groupPhotoContainer}>
          <View style={styles.groupPhoto}>
            <Camera width={32} height={32} color="#666" />
          </View>
        </TouchableOpacity>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Đặt tên nhóm"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <View style={styles.searchContainer}>
        <Search width={20} height={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên hoặc số điện thoại"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={friends.filter(friend => 
          friend.friendName.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderFriendItem}
        keyExtractor={item => item.friendId}
        style={styles.friendsList}
      />

      {/* Nút tạo nhóm - chỉ hiển thị khi có ít nhất 1 thành viên được chọn */}
      {selectedFriends.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateGroup}
            disabled={isCreating || !groupName.trim()}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Tạo nhóm</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  groupInfo: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupPhotoContainer: {
    marginBottom: 16,
  },
  groupPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupNameInput: {
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    margin: 16,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  friendsList: {
    flex: 1,
    marginBottom: 70, // Để tránh bị nút tạo nhóm che phủ
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkboxSelected: {
    backgroundColor: '#0088ff',
    borderColor: '#0088ff',
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
  friendInfo: {
    marginLeft: 12,
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  createButton: {
    backgroundColor: '#0088ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateGroupScreen;