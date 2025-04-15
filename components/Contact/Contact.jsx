import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image
} from 'react-native';
import { Search, Phone, Video, MessageCircle, Users, User, Plus } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import BottomMenuBar from '../Sidebar/BottomMenuBar';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../services/apis';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Contact = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const nav = useNavigation();
  const [contacts, setContacts] = useState([]);
  const [currentId, setCurrentId] = useState(null);


  const groups = [
    {
      id: '1',
      name: 'Bóng Đá ⚽',
      lastMessage: 'Ngô Trung Nguyên tham gia cuộc bình chọn',
      time: '1 giờ',
      avatar: 'https://i.pravatar.cc/100?img=1',
      memberCount: 0,
    },
    {
      id: '2',
      name: 'CNM-HK2-24-25_KTPM17CTT-C',
      lastMessage: 'Hưng Wibruh: dạ của bạn Khoa a, bạn da...',
      time: 'T4',
      avatar: 'https://i.pravatar.cc/100?img=2',
      memberCount: 49,
    },
    // Add more groups as needed
  ];

  const sections = [
    {
      id: 'requests',
      icon: 'users',
      title: 'Lời mời kết bạn',
      color: '#0088ff',
    },
    {
      id: 'phonebook',
      icon: 'book',
      title: 'Danh bạ máy',
      subtitle: 'Liên hệ có dùng Zola',
      color: '#0088ff',
    }
  ];

  useEffect(() =>{
    const fetchData = async () =>{
      try {
        const currentUserId = await AsyncStorage.getItem('id');
        setCurrentId(currentUserId);
      } catch (error) {
        console.error(error);
        
      }
    };
    fetchData();
  }, []);
  //hàm xử lý lấy danh sách bạn bè của người dùng hiện tại
  useEffect(() => {
    
    const fetchContacts = async () => {
      try {
        const response = await ApiService.getFriendUserLogin();
        const accepted = response.data.filter(f => f.status === 'ACCEPTED');
  
        
        const contactList = [];
  
        for (const friend of accepted) {
          const convRes = await ApiService.getConversationById(friend.conversationId);
          const users = convRes.data.users;
  
          // Lấy người không phải mình
          const contact = users.find(u => u.id !== currentId);
          if (contact) {
            contactList.push(contact);
          }
        }
  
        setContacts(contactList); // Gán danh sách user đầy đủ cho component
      } catch (error) {
        console.error('Lỗi khi load danh sách bạn bè:', error);
      }
    };
  
    fetchContacts();
  }, []);
  

  const renderContactItem = ({ item }) => (
    <TouchableOpacity>
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Image source={{ uri: item.image || 'https://i.pravatar.cc/100?img=2' }} style={styles.avatar} />
        {item.online && <View style={styles.onlineIndicator} />}
        <Text style={styles.contactName}>{item.name}</Text>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Phone width={20} height={20} stroke="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Video width={20} height={20} stroke="#666" />
        </TouchableOpacity>
      </View>
    </View>
    </TouchableOpacity>
  );

  const renderSectionItem = ({ item }) => (
    <TouchableOpacity style={styles.sectionItem} 
    onPress={() => {
      if (item.id === 'requests') {
        nav.navigate('FriendRequest');
      } else {
        // có thể xử lý các id khác nếu cần
      }
    }}
    >
      <View style={[styles.sectionIcon, { backgroundColor: item.color }]}>
        <Users width={24} height={24} stroke="#fff" />
      </View>
      <View style={styles.sectionText}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );

  
  

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity style={styles.groupItem}>
      <View style={styles.groupInfo}>
        <Image source={{ uri: item.avatar }} style={styles.groupAvatar} />
        {item.memberCount > 0 && (
          <View style={styles.memberCount}>
            <Text style={styles.memberCountText}>{item.memberCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.groupContent}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.timeText}>{item.time}</Text>
    </TouchableOpacity>
  );

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
        </View>
      </LinearGradient>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}
        >
          <Text style={[styles.tabText, activeTab === 'contacts' && styles.activeTabText]}>
            Bạn bè
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Nhóm
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'contacts' ? (
        <FlatList
          ListHeaderComponent={() => (
            <FlatList
              data={sections}
              renderItem={renderSectionItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <FlatList
          ListHeaderComponent={() => (
            <View>
              <TouchableOpacity style={styles.createGroup} onPress={() => nav.navigate('CreateGroupScreen')}>
                <View style={styles.createGroupIcon}>
                  <Plus stroke="#0088ff" width={24} height={24} />
                </View>
                <Text style={styles.createGroupText}>Tạo nhóm</Text>
              </TouchableOpacity>
              <View style={styles.groupHeader}>
                <Text style={styles.groupHeaderText}>
                  Nhóm đang tham gia (60)
                </Text>
              </View>
            </View>
          )}
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={item => item.id}
        />
      )}

      <BottomMenuBar navigation={navigation} activeTab={activeTab} />
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
    color: '#fff',
    fontSize: 16,
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
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  contactName: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  createGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  createGroupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  createGroupText: {
    fontSize: 16,
    color: '#0088ff',
    fontWeight: '500',
  },
  groupHeader: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  groupHeaderText: {
    fontSize: 14,
    color: '#666',
  },
  groupItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupInfo: {
    position: 'relative',
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  memberCount: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  memberCountText: {
    fontSize: 12,
    color: '#666',
  },
  groupContent: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
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
});

export default Contact;