import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Platform
} from 'react-native';
import { ChevronLeft, MessageCircle, Users, User, LogOut } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import BottomMenuBar from '../Sidebar/BottomMenuBar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const nav = useNavigation();

  const clearTokens = async () => {
    try {
      await AsyncStorage.removeItem('token'); // Xóa access token
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('id');
      console.log('Tokens cleared successfully');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Sử dụng window.confirm cho web
      const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmLogout) {
        clearTokens();
        nav.navigate("Login");
        console.log('User logged out on web');
        
      }
    } else {
      // Sử dụng Alert cho mobile
      Alert.alert(
        'Đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Đăng xuất',
            style: 'destructive',
            onPress: () => {
              clearTokens();
              console.log('User logged out on mobile');
              nav.navigate("Login");
              
            },
          },
        ],
      );
    }
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
      </LinearGradient>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100?img=1' }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>Văn Khanh Đinh</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Thông tin</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Đổi ảnh đại diện</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]}
          onPress={() => {
            console.log('Logout button pressed'); // Kiểm tra xem nút có được nhấn không
            handleLogout();
          }}
        >
          <LogOut stroke="#ff3b30" width={20} height={20} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        
        
      </View>

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
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuSection: {
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff3b30',
    marginLeft: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
});

export default Profile;