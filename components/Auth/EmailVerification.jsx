import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import useBackHandler from '../../hook/useBackHandle';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'antd-mobile';
import { useRoute } from '@react-navigation/native';
import {Toast} from 'react-native-toast-message';




const EmailVerification = ({ navigation }) => {
  const [timer, setTimer] = useState(30);
  const [isResendActive, setIsResendActive] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const {serverOtp} = route.params;
  const {mode} = route.params;

  useBackHandler();
  const nav = useNavigation();

  // Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setIsResendActive(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerification = () => {
    // Handle verification logic here
    console.log('Verifying code:');
  };

  //form du lieu gui di
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm xác thực OTP
  const handleVerifyOTP = () => {
    if (otp.trim() === '') {
      Alert.alert('Error','Vui lòng nhập OTP!')
      return;
    }
    if (otp === serverOtp) {
      // Toast.show({
      //   icon: 'success',
      //   content: 'Xác thực OTP thành công!'
      // });

      Alert.alert('Thông báo','Xác thực thành công')
      if (mode === 'register') {
        nav.navigate("RegisProfile")
      } else if (mode === 'reset') {
        nav.navigate("NewPassword")
      }
    } else {
      Alert.alert('error','Mã OTP không đúng!')
    }
  };


  const handleResendCode = () => {
    setTimer(53);
    setIsResendActive(false);
    // Handle resend logic here
    console.log('Resending verification code');
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
        <Text style={styles.title}>Nhập mã xác thực</Text>
        <Text style={styles.subtitle}>
          Chúng tôi đã gửi mã xác minh đến địa chỉ email của bạn.
          Vui lòng kiểm tra hộp thư đến của bạn và nhập mã gồm 6 chữ số bên dưới.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã xác thực"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            !otp && styles.continueButtonDisabled
          ]}
          disabled={!otp}
          onPress={handleVerifyOTP}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Bạn không nhận được mã? </Text>
          {isResendActive ? (
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendActiveText}>Gửi lại</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>Gửi lại ({timer}s)</Text>
          )}
        </View>

        
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
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
  resendContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendActiveText: {
    color: '#007AFF',
    fontSize: 14,
  },
  timerText: {
    color: '#666',
    fontSize: 14,
  },
  helpLink: {
    marginTop: 24,
  },
  helpText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default EmailVerification;