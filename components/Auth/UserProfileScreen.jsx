import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import DatePicker from 'react-datepicker';
import ApiService from '../../services/apis';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "react-datepicker/dist/react-datepicker.css";
import { Toast } from 'antd-mobile';

const UserProfileScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState('');
  const nav = useNavigation();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleContinue = () => {
    // Handle form submission logic here
    console.log('Form submitted', {
      displayName,
      phoneNumber,
      password,
      gender,
      dateOfBirth,
      avatarUri,
    });
  };

  const [formData, setFormData] = useState({
    email : "",
    displayName : "",
    phoneNumber : "",
    password : "",
    gender : "",
    dateOfBirth : null,
    });
  

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



  

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setShowDatePicker(false); // Ẩn DatePicker (trên mobile)
      const formattedDate = selectedDate.toISOString().split("T")[0]; // Định dạng YYYY-MM-DD
      setFormData((prev) => ({ ...prev, dateOfBirth: formattedDate }));
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.displayName);
    formDataToSend.append("phoneNumber", formData.phoneNumber);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("dateOfBirth", formData.dateOfBirth);
    formDataToSend.append("gender", formData.gender);

    if (selectedFile) {
        formDataToSend.append("image", selectedFile);
    }

    try {
        const response = await ApiService.register(formDataToSend);
        if (response.status === 201 || response.status === 200) {
          Toast.show({
            icon : 'success',
            content : "Hồ sơ đã được lưu thành công!"
          })
            nav.navigate("Login");
        }
    } catch (error) {
      Toast.show({
        icon : 'error',
        content : "Lưu hồ sơ thất bại, vui lòng thử lại"
      })
    }
};

  const handleImagePick = () => {
    // Implement image picking logic here
    // For this example, we'll just set a dummy URI
    setAvatarUri('https://example.com/avatar.jpg');
  };

  const isValidForm = 
  formData.displayName.trim() !== "" && 
  formData.phoneNumber.trim() !== "" && 
  formData.password.trim() !== "" && 
  confirmPassword.trim() !== "" && 
  formData.gender;

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
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo hồ sơ</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tên hiển thị"
            value={formData.displayName}
            onChangeText={(value) => handleChange("displayName", value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={formData.phoneNumber}
            onChangeText={(value) => handleChange("phoneNumber", value)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
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

        {formData.password !== confirmPassword && confirmPassword !== '' && (
          <Text style={styles.errorText}>
            Mật khẩu không khớp
          </Text>
        )}

        <View style={styles.radioContainer}>
          <Text style={styles.radioLabel}>Giới tính:</Text>
          <TouchableOpacity
            style={[styles.radioButton, formData.gender === 'male' && styles.radioButtonSelected]}
            onPress={() => handleChange('gender', 'male')}
          >
            <Text style={styles.radioText}>Nam</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, formData.gender === 'female' && styles.radioButtonSelected]}
            onPress={() => handleChange('gender', 'female')}
          >
            <Text style={styles.radioText}>Nữ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateContainer}>
        <Text >Ngày sinh:</Text>
        {Platform.OS === 'web' ? (
          <DatePicker
            selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
            onChange={(date) => handleDateChange(null, date)}
            dateFormat="dd/MM/yyyy"
            customInput={
              <input
                style={{
                  ...styles.datePickerButtonText,
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  backgroundColor: 'transparent',
                }}
              />
            }
          />
        ) : (
        <>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerButtonText}>
                {formData.dateOfBirth
                  ? new Date(formData.dateOfBirth).toLocaleDateString('vi-VN')
                  : "Chọn ngày"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </>
        )}
        </View>

        {/* <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerButtonText}>
            {dateOfBirth.toLocaleDateString('vi-VN')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )} */}

        {/* chon anh */}
        {/* <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={handleImagePick}
        >
          <Text style={styles.imagePickerButtonText}>
            {avatarUri ? 'Ảnh đã chọn' : 'Chọn ảnh đại diện'}
          </Text>
        </TouchableOpacity>

        {avatarUri && (
          <Text style={styles.imageUriText}>
            URI ảnh: {avatarUri}
          </Text>
        )} */}

        <TouchableOpacity 
          style={[styles.continueButton, !isValidForm && styles.continueButtonDisabled]}
          disabled={!isValidForm}
          onPress={handleSubmit}
        >
          <Text style={styles.continueButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </ScrollView>
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
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  radioLabel: {
    fontSize: 16,
    marginRight: 16,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#0066ff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#CCFFCC',
  },
  radioText: {
    color: '#0066ff',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%', // Đảm bảo chiều rộng bằng nhau
    backgroundColor: '#fff', // Đảm bảo nền trắng
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  imagePickerButton: {
    backgroundColor: '#e8f0fe',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerButtonText: {
    color: '#0066ff',
    fontSize: 16,
  },
  imageUriText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#e8f0fe',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
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

export default UserProfileScreen;