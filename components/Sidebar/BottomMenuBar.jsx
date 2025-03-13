import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MessageCircle, Users, User } from 'react-native-feather';

const BottomMenuBar = ({ navigation, activeTab }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, activeTab === 'messages' && styles.activeNavItem]}
        onPress={() => navigation.navigate('Home')}
      >
        <MessageCircle
          stroke={activeTab === 'messages' ? '#0088ff' : '#666'}
          width={24}
          height={24}
        />
        <Text style={[styles.navText, activeTab === 'messages' && styles.activeNavText]}>
          Tin nhắn
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'contacts' && styles.activeNavItem]}
        onPress={() => navigation.navigate('Contact')}
      >
        <Users
          stroke={activeTab === 'contacts' ? '#0088ff' : '#666'}
          width={24}
          height={24}
        />
        <Text style={[styles.navText, activeTab === 'contacts' && styles.activeNavText]}>
          Danh bạ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === 'profile' && styles.activeNavItem]}
        onPress={() => navigation.navigate('Profile')}
      >
        <User
          stroke={activeTab === 'profile' ? '#0088ff' : '#666'}
          width={24}
          height={24}
        />
        <Text style={[styles.navText, activeTab === 'profile' && styles.activeNavText]}>
          Cá nhân
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    backgroundColor: '#fff',
    position: 'absolute', // Đặt vị trí tuyệt đối
    bottom: 0, // Luôn nằm ở dưới cùng
    left: 0, // Căn trái
    right: 0, // Căn phải
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

export default BottomMenuBar;