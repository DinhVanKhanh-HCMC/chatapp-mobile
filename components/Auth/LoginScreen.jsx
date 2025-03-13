import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import { ChevronLeft } from 'react-native-feather';
// import LinearGradient from 'react-native-linear-gradient';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import useBackHandler from '../../hook/useBackHandle';
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiService from '../../services/apis';
import { Toast } from 'antd-mobile';




export default function LoginScreen({navigation}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useBackHandler();
  const nav = useNavigation();

  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    setError(null); 
    setIsLoading(true); 
  
    try {
      console.log("Gửi request đăng nhập:", formData);
      // Gọi API để đăng nhập, gửi dữ liệu từ formData
      const data = await ApiService.loginApi(formData);
      console.log("Kết quả từ API:", data);
      
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem("token", data.data.token);
      
      // Chuyển hướng người dùng đến trang "UserScreen"
      nav.navigate('Home');
    } catch (error) {
      Toast.show({
        icon : 'error',
        content : 'Sai tên đăng nhập hoặc mật khẩu!'
      })
      console.log("Lỗi đăng nhập:", error);
      setError(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false); // Ẩn trạng thái loading
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" translucent={true}/>
      
      {/* Header */}
      <LinearGradient
        colors={['#0068FF', '#00A5FF']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => nav.navigate('StartPage')}>
          <ChevronLeft stroke="white" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng nhập</Text>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.instructions}>
          Vui lòng nhập số điện thoại và mật khẩu để đăng nhập
        </Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(value) => handleChange("phoneNumber", value)}
            keyboardType="phone-pad"
            placeholder="Nhập số điện thoại"

          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={formData.password}
              onChangeText={(value) => handleChange("password", value)}
              secureTextEntry={!showPassword}
              placeholder="Nhập mật khẩu"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showButton}
            >
              <Text style={styles.showButtonText}>HIỆN</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword} onPress={() => nav.navigate('ForgetPassword',{ mode: 'reset' })}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity 
          onPress={handleLogin}
          style={[
            styles.loginButton,
            (!formData.phoneNumber || !formData.password) && styles.loginButtonDisabled
          ]}
          disabled={!formData.phoneNumber || !formData.password}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
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
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructions: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  showButton: {
    padding: 8,
  },
  showButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  forgotPassword: {
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#0068FF',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#0068FF',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  faqButton: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  faqText: {
    color: '#666666',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

