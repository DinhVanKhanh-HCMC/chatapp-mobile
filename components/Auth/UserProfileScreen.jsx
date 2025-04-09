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
  Image,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../services/apis';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "react-datepicker/dist/react-datepicker.css";
import { Toast } from 'antd-mobile';
import {Camera} from 'react-native-feather';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';



const UserProfileScreen = ({ navigation,onDateChange }) => {
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState('');
  const nav = useNavigation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [isAndroidModalVisible, setIsAndroidModalVisible] = useState(false);

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

  const handleChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };
  
  const formatDateForAPI = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };



  

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setIsAndroidModalVisible(false);
    }
    
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    if (onDateChange) {
      onDateChange(currentDate);
    }

    // Cập nhật ngày sinh vào formData
    setFormData(prev => ({
      ...prev,
      dateOfBirth: currentDate, // Hoặc: currentDate.toISOString()
    }));

    // Gọi callback nếu có
    if (onDateChange) {
      onDateChange(currentDate);
    }
  };
  const displayDate = format(date, 'dd/MM/yyyy', { locale: vi });

  const showDatePicker = () => {
    if (Platform.OS === 'android') {
      setIsAndroidModalVisible(true);
    } else {
      setShowPicker(true);
    }
  };


  //chuyển đổi kiểu Base64 thành Blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  };


  const handleSubmit = async (e) => {
    console.log("===> Bắt đầu handleSubmit");

    if (e && e.preventDefault) {
        e.preventDefault();
        console.log("===> Đã gọi e.preventDefault()");
    }

    console.log("===> formData hiện tại:", formData);

    // Kiểm tra và format lại ngày sinh trước khi gửi
    let formattedDateOfBirth = null;
    if (formData.dateOfBirth) {
        // Nếu dateOfBirth là string (từ DateTimePicker), chuyển thành Date object trước
        const dateObj = typeof formData.dateOfBirth === 'string' 
            ? new Date(formData.dateOfBirth) 
            : formData.dateOfBirth;
        
        // Format thành YYYY-MM-DD (định dạng LocalDate Java)
        formattedDateOfBirth = dateObj.toISOString().split('T')[0];
        console.log("===> Ngày sinh sau khi format:", formattedDateOfBirth);
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.displayName);
    formDataToSend.append("phoneNumber", formData.phoneNumber);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("dateOfBirth", formattedDateOfBirth); // Sử dụng ngày đã format
    formDataToSend.append("gender", formData.gender);

    console.log("===> Đã append các trường cơ bản vào FormData");

    // Xử lý file ảnh
    if (selectedFile && selectedFile.uri) {
        console.log("===> Selected File:", selectedFile);

        try {
            // Tạo object file với các thuộc tính cần thiết
            const imageFile = {
                uri: selectedFile.uri,
                type: selectedFile.type || 'image/jpeg',
                name: selectedFile.name || `profile_${Date.now()}.jpg`,
            };
            
            // Append file vào FormData
            formDataToSend.append("image", imageFile);
            console.log("===> Đã append image vào FormData:", imageFile);
        } catch (fileError) {
            console.error("❌ Lỗi khi xử lý file ảnh:", fileError);
            Alert.alert('Lỗi', 'Không thể xử lý ảnh đại diện');
            return;
        }
    } else {
        console.log("===> Không có ảnh được chọn");
    }

    try {
        console.log("===> Gọi API đăng ký với FormData:", formDataToSend);
        
        // Gọi API với headers multipart/form-data
        const response = await ApiService.register(formDataToSend);
        console.log("===> Phản hồi từ API:", response);

        if (response?.status === 201 || response?.data?.code === 200) {
            Alert.alert('Thành công', 'Đăng ký tài khoản thành công');
            nav.navigate("Login");
        } else {
            const errorMsg = response?.data?.message || 'Không rõ lỗi';
            console.error("Lỗi từ server:", errorMsg);
            Alert.alert('Lỗi', `Đăng ký thất bại: ${errorMsg}`);
        }
    } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error);
        
        // Xử lý lỗi chi tiết hơn
        let errorMessage = 'Đăng ký thất bại, vui lòng thử lại';
        if (error.response) {
            if (error.response.data?.errors) {
                errorMessage = Object.values(error.response.data.errors).join('\n');
            } else if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            }
        }
        
        Alert.alert('Lỗi', errorMessage);
    }
};


const handlePickImage = async () => {
  // Yêu cầu quyền truy cập thư viện
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Quyền bị từ chối', 'Bạn cần cấp quyền truy cập để chọn ảnh.');
    return;
  }

  // Mở thư viện ảnh
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    const selectedAsset = result.assets[0];
    
    // Cập nhật vào state để hiển thị trong Image
    setProfileImage(selectedAsset.uri);

    // Gửi dữ liệu vào formData
    setSelectedFile({
      uri: selectedAsset.uri,
      type: selectedAsset.type || 'image/jpeg',
      name: selectedAsset.fileName || `image_${Date.now()}.jpg`,
    });
  }
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

        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Camera width={32} height={32} color="#666" />
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
            <Camera width={20} height={20} color="#666" />
          </TouchableOpacity>
        </View>


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

        <View style={styles.container}>
      <Text style={styles.label}>Ngày sinh:</Text>
      
      <TouchableOpacity 
        style={styles.dateInput} 
        onPress={showDatePicker}
        activeOpacity={0.7}
      >
        <Text style={styles.dateText}>{displayDate}</Text>
      </TouchableOpacity>

      {Platform.OS === 'android' && isAndroidModalVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsAndroidModalVisible(false)}
        >
          <View style={styles.androidPickerContainer}>
            <View style={styles.androidPicker}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                locale="vi-VN"
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setIsAndroidModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'ios' && showPicker && (
        <View style={styles.iosPickerContainer}>
          <View style={styles.iosPickerHeader}>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={styles.doneButton}>Xong</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            maximumDate={new Date()}
            locale="vi-VN"
            textColor="#000"
          />
        </View>
      )}
    </View>

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
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  androidPickerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  androidPicker: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  confirmButton: {
    backgroundColor: '#0088ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  doneButton: {
    color: '#0088ff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserProfileScreen;