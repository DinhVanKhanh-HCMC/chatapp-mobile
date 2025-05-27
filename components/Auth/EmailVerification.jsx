import React, { useState, useEffect,useRef } from 'react';
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
import { useRoute,useIsFocused } from '@react-navigation/native';
import {Toast} from 'react-native-toast-message';
import ApiService from '../../services/apis';




const EmailVerification = ({ navigation }) => {
  const route = useRoute();
  const {expireAt} = route.params;
  const now = Date.now();
  const [timer, setTimer] = useState(Math.max(Math.floor((expireAt - now) / 1000), 0));
  const [isResendActive, setIsResendActive] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);
  
  const {serverOtp} = route.params;
  const {email,mode} = route.params;
   const isFocused = useIsFocused();

  useBackHandler();
  const nav = useNavigation();


  // Timer countdown effect
  useEffect(() => {
    let interval = null;

    if (isFocused && timer > 0) { // Chỉ chạy timer nếu màn hình đang active
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (isFocused && timer === 0) { // Chỉ hiện Alert nếu màn hình đang active
      setIsResendActive(true);
      Alert.alert('Thông báo', 'Mã OTP đã hết hạn!');
    }

    return () => clearInterval(interval); // Hủy interval khi unmount hoặc mất focus
  }, [timer, isFocused]);

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
  const handleVerifyOTP = async () => {
    if (otp.trim() === '') {
      Alert.alert('Error','Vui lòng nhập OTP!')
      return;
    }

    try {
      const response = await ApiService.verifyOtp(email, otp);
      if (response?.code === 200) {
        // Toast.show({
        //   icon: 'success',
        //   content: 'Xác thực OTP thành công!'
        // });

        Alert.alert('Thông báo',response?.message )
        if (mode === 'register') {
          nav.navigate("RegisProfile")
        } else if (mode === 'reset') {
          nav.navigate("NewPassword")
        }
      } else{
        Alert.alert('Thông báo',response?.message || 'Mã OTP không đúng hoặc đã hết hạn')
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xác thực OTP. Vui lòng thử lại.');
    }

    
  };


  const handleResendCode = async () => {
    try {
    const response = await ApiService.sendOTP(email, mode); // bạn cần truyền lại email (từ AsyncStorage hoặc truyền qua params)
    if (response?.code === 200) {
      const newExpireAt = Date.now() + 60 * 1000;
      setTimer(60); // hoặc tính từ newExpireAt như trên
      setIsResendActive(false);
    } else {
      Alert.alert("Lỗi", "Không thể gửi lại mã OTP");
    }
  } catch (err) {
    console.error(err)
    Alert.alert("Lỗi", "Gửi lại OTP thất bại");
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