import React, { useState } from 'react';
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

const FriendRequest = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('received');

  const receivedRequests = [
    {
      id: '1',
      name: 'Trần Minh Phụng',
      avatar: 'https://i.pravatar.cc/100?img=1',
      status: 'Muốn kết bạn',
    },
    {
      id: '2',
      name: 'Sky',
      avatar: 'https://i.pravatar.cc/100?img=2',
      status: 'Muốn kết bạn',
    },
    {
      id: '3',
      name: 'Phước Tài',
      avatar: null,
      initials: 'PT',
      status: 'Muốn kết bạn',
      backgroundColor: '#e091ff',
    },
    // Add more received requests as needed
  ];

  const sentRequests = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/100?img=3',
      status: 'Đã gửi lời mời kết bạn',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      avatar: null,
      initials: 'TB',
      status: 'Đã gửi lời mời kết bạn',
      backgroundColor: '#5c6bc0',
    },
    // Add more sent requests as needed
  ];

  const renderAvatar = (item) => {
    if (item.avatar) {
      return <Image source={{ uri: item.avatar }} style={styles.avatar} />;
    }
    return (
      <View style={[styles.avatarPlaceholder, { backgroundColor: item.backgroundColor || '#ccc' }]}>
        <Text style={styles.avatarInitials}>{item.initials}</Text>
      </View>
    );
  };

  const renderReceivedItem = ({ item }) => (
    <View style={styles.requestItem}>
      {renderAvatar(item)}
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>{item.status}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.declineButton}>
            <Text style={styles.declineButtonText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Đồng ý</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSentItem = ({ item }) => (
    <View style={styles.requestItem}>
      {renderAvatar(item)}
      <View style={styles.requestInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.status}>{item.status}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.declineButton}>
            <Text style={styles.declineButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
            Đã gửi
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'received' ? receivedRequests : sentRequests}
        renderItem={activeTab === 'received' ? renderReceivedItem : renderSentItem}
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