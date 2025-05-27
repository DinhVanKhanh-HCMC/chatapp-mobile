import React, { useState,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../services/apis';
import { useNavigation } from '@react-navigation/native';
import { Toast } from 'antd-mobile';


const NewPassword = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const nav = useNavigation();


  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  //lay email tu storage va gan vao formdata
  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) {
        setFormData((prev) => ({ ...prev, email: storedEmail }));
      }
    };
    fetchEmail();
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContinue = async() => {
  try{
    await ApiService.resetPassword(formData);
    nav.navigate('Login');
  } catch (error) {
    Toast.show({
      icon : 'error',
      content : 'Lỗi đặt lại mật khẩu!'
    })
  }
  };

  const isValidForm = formData.password && confirmPassword && formData.password === confirmPassword;

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
          Nhập mật khẩu mới của bạn
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu mới"
            value={formData.password}
            onChangeText={(value) => handleChange("password", value)}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {formData.password.length > 0 && formData.password.length < 6 && (
          <Text style={styles.errorText}>
            Mật khẩu phải có ít nhất 6 ký tự
          </Text>
        )}

        {formData.password !== confirmPassword && confirmPassword !== '' && (
          <Text style={styles.errorText}>
            Mật khẩu không khớp
          </Text>
        )}

        <TouchableOpacity 
          style={[styles.continueButton, !isValidForm && styles.continueButtonDisabled]}
          disabled={!isValidForm}
          onPress={handleContinue}
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
    backgroundColor: '#0077EE',
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
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
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 16,
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

export default NewPassword;
