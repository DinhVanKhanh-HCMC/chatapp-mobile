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
} from 'react-native';
import { X, Camera, Search } from 'react-native-feather';

const CreateGroupScreen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const friends = [
    {
      id: '1',
      name: 'Tuấn Anh',
      avatar: 'https://i.pravatar.cc/100?img=1',
      lastActive: '14 giờ trước',
    },
    {
      id: '2',
      name: 'Hưng Wibruh',
      avatar: null,
      initials: 'HW',
      lastActive: '15 giờ trước',
      backgroundColor: '#00bcd4',
    },
    // Add more friends as needed
  ];

  const toggleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem}
      onPress={() => toggleFriendSelection(item.id)}
    >
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          selectedFriends.includes(item.id) && styles.checkboxSelected
        ]} />
      </View>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarPlaceholder, { backgroundColor: item.backgroundColor || '#ccc' }]}>
          <Text style={styles.avatarInitials}>{item.initials}</Text>
        </View>
      )}
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.lastActive}>{item.lastActive}</Text>
      </View>
    </TouchableOpacity>
  );

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
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={item => item.id}
        style={styles.friendsList}
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
  lastActive: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default CreateGroupScreen;