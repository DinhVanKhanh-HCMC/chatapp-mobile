import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import useEmailValidation from '../../hook/useEmailValidation';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import ApiService from '../../services/apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { message } from 'antd-mobile';
import { useEffect } from 'react';

const Register = ({ navigation }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [socialTermsAccepted, setSocialTermsAccepted] = useState(false);
  const { email, setEmail, isValid } = useEmailValidation();
  const nav = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const { mode } = route.params;
  const [confirmation, setConfirmation] = useState(false);


  const handleContinue = () => {
    // Handle login logic here
    console.log('Continue with email:', email);
  };

  //form du lieu gui di
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm gửi OTP
  const handleSendOTP = async () => {
    setIsLoading(true);
  
    // const showToast = (type, msg) => {
    //   if (Platform.OS === 'web') {
    //     if (type === 'success') message.success(msg);
    //     else message.error(msg);
    //   } else {
    //     Toast.show({ type, text1: msg });
    //   }
    // };
  
    try {
      console.log('Before API call');
      const response = await ApiService.sendOTP(email, mode);
      console.log('API response:', response);
  
      if (response?.code === 200) {
        console.log('Storing email and navigating...');
        await AsyncStorage.setItem("email", email);
        const expireAt = Date.now() + 60 * 1000;
        setConfirmation(true);
        
        const serverOtp = response.data.otp;
        if (!navigation) {
          throw new Error('Navigation is not available');
        }
        nav.navigate('EmailVerification', {
          serverOtp,
          mode: 'register',
          expireAt,
          email
        });
      } else if(response?.code === 409) {
        Alert.alert('Lỗi', response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Full error:', error);
      Alert.alert('Lỗi ', 'Email đã tồn tại!');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Nhập email của bạn</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={(value) => {
              const emailData = { email: value }; // Tạo đối tượng JSON
              setEmail(value); // Cập nhật state
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!isValid && email !== "" && (
            <Text style={{ color: "red" }}>Email không hợp lệ!</Text>
          )}
          
        </View>


        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkboxBox, termsAccepted && styles.checkboxChecked]} />
            <Text style={styles.checkboxText}>
              Tôi đồng ý với các <Text style={styles.link}>điều khoản sử dụng</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.checkbox}
            onPress={() => setSocialTermsAccepted(!socialTermsAccepted)}
          >
            <View style={[styles.checkboxBox, socialTermsAccepted && styles.checkboxChecked]} />
            <Text style={styles.checkboxText}>
              Tôi đồng ý với <Text style={styles.link}>điều khoản mạng xã hội</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!termsAccepted || !socialTermsAccepted || !email || !isValid || isLoading) && styles.continueButtonDisabled
          ]}
          disabled={!termsAccepted || !socialTermsAccepted || !email || !isValid || isLoading}
          onPress={handleSendOTP}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Đang xử lý...' : 'Tiếp tục'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => nav.navigate('Login')}>
          <Text style={styles.loginText}>
            Bạn đã có tài khoản? <Text style={styles.link}>Đăng nhập ngay</Text>
          </Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 16,
  },
  backButtonText: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 24,
  },
  input: {
    padding: 16,
    fontSize: 16,
  },
  checkboxContainer: {
    marginBottom: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
  },
  link: {
    color: '#007AFF',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#333',
  },
});

export default Register;