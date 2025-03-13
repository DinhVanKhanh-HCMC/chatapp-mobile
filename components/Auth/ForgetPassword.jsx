import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useEmailValidation from '../../hook/useEmailValidation';
import { useRoute } from '@react-navigation/native';
import ApiService from '../../services/apis';
import { Toast } from 'antd-mobile';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ForgetPassword = ({ navigation }) => {
  const nav = useNavigation();
  const { email, setEmail, isValid } = useEmailValidation();
  const route = useRoute();
  const {mode} = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  

  const handleContinue = () => {
    console.log('Recovery email:', email);
  };
  

  // ham gui otp
  const handleSendOTP = async () => {
    
    //setIsLoading(true);
    try {
      const response = await ApiService.sendOTP(email, mode);
      if (response?.code === 200) {
        Toast.show({
          icon : 'success',
          content : response.message
        })
        await AsyncStorage.setItem("email", email);
        setConfirmation(true);
        const serverOtp = response.data.otp;
        nav.navigate('EmailVerification',{serverOtp: serverOtp,mode: 'reset'});
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lấy lại mật khẩu</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Nhập email để lấy lại mật khẩu
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!isValid && email !== "" && (
            <Text style={{ color: "red" }}>Email không hợp lệ!</Text>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.continueButton, (!email || !isValid) && styles.continueButtonDisabled]}
          disabled={!email || !isValid}
          onPress={handleSendOTP}
          
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
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
  header: {
    backgroundColor: '#0077EE',  // Màu xanh dương thay cho LinearGradient
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5, // Hiệu ứng bóng cho Android
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 1,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  instruction: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#e8f0fe',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#0066ff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ForgetPassword;
