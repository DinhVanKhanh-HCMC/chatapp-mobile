import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const LoadingDots = () => {
  return (
    <View style={styles.dotsContainer}>
      {[...Array(3)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index === 2 ? '#0068FF' : '#E8E8E8' },
          ]}
        />
      ))}
    </View>
  );
};

export default function StartPage() {
  const nav = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Language Selector */}
      <TouchableOpacity style={styles.languageSelector}>
        <Text style={styles.languageText}>Tiếng Việt</Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
            src='../assets/contacts.png'
        />
        <LoadingDots />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={() => nav.navigate('Login')}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.createAccountButton} onPress={() => nav.navigate('Register', { mode: 'register' })}>
          <Text style={styles.createAccountText}>Tạo tài khoản mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  languageSelector: {
    position: 'absolute',
    top: height * 0.05, // Cách mép trên 5% chiều cao màn hình
    right: width * 0.03, // Cách mép phải 3% chiều rộng màn hình
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  languageText: {
    fontSize: width * 0.04,
    marginRight: 4,
  },
  chevron: {
    fontSize: width * 0.03,
    color: '#666',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: width * 0.5,
    height: height * 0.12, // 12% chiều cao màn hình
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: height * 0.02,
    gap: width * 0.02,
  },
  dot: {
    width: width * 0.02,
    height: width * 0.02,
    borderRadius: width * 0.01,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.04, // Khoảng cách từ đáy màn hình
    gap: height * 0.015,
  },
  loginButton: {
    backgroundColor: '#0068FF',
    borderRadius: 8,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  createAccountButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    width: '100%',
  },
  createAccountText: {
    color: '#000000',
    fontSize: width * 0.045,
  },
});
