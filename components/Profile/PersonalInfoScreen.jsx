import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  Alert
} from 'react-native';
import { X, Camera, Edit2 } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../services/apis';
import * as ImagePicker from 'expo-image-picker';


const PersonalInfoScreen = ({ navigation }) => {
  const [gender, setGender] = useState('male');
  const [profileImage, setProfileImage] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const [user, setUser] = useState({
        id: '',
        name: '',
        imageUrl: '',
        dateOfBirth: '',
      });

  const handleEdit = (field) => {
    setEditingField(field);
  };
  
  const handleChange = (field, value) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };
  
  const handleBlur = () => {
    setEditingField(null);
    // Gọi API cập nhật nếu muốn: ApiService.updateUserInfo(user)
  };
    
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await ApiService.getUserInfo();
        setUser({
          id: response.data.id,
          name: response.data.name,
          imageUrl: response.data.image,
          dateOfBirth: response.data.dateOfBirth
        });
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchUserInfo();
  }, []);

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

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Gọi API update, ví dụ hàm này nhận id và thông tin user
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('dateOfBirth', user.dateOfBirth);
      formData.append('gender', 'male');

      if (profileImage && profileImage !== user.imageUrl) {
        formData.append('image', {
          uri: profileImage,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }
      await ApiService.updateInfo(user.id, formData);
      Alert.alert('Thông báo','Cập nhật thông tin thành công!')
      // Sau khi update thành công, thoát khỏi chế độ chỉnh sửa
      setEditingField(null);
      // Optionally, hiện thông báo thành công cho người dùng
    } catch (error) {
      console.error("Lỗi cập nhật thông tin người dùng:", error);
      // Optionally, xử lý lỗi (hiển thị thông báo lỗi)
    }finally{
      setIsLoading(false)
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0088ff', '#0055ff']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <X stroke="#fff" width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.profileImageContainer}>

            {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                      ) : (
                        <Image source={{ uri: user.imageUrl }} style={styles.profileImage} />
              )}
            
          <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
            <Camera width={20} height={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          {/* Name */}
          <View style={styles.infoRow}>
            {editingField === 'name' ? (
              <TextInput
                style={styles.input}
                value={user.name}
                onChangeText={(text) => handleChange('name', text)}
                onBlur={handleBlur}
                autoFocus
              />
            ) : (
              <Text style={styles.infoLabel}>{user.name}</Text>
            )}
            <TouchableOpacity onPress={() => handleEdit('name')}>
              <Edit2 width={20} height={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Date of Birth */}
          <View style={styles.infoRow}>
            {editingField === 'dateOfBirth' ? (
              <TextInput
                style={styles.input}
                value={user.dateOfBirth}
                onChangeText={(text) => handleChange('dateOfBirth', text)}
                onBlur={handleBlur}
                autoFocus
              />
            ) : (
              <Text style={styles.infoLabel}>{user.dateOfBirth}</Text>
            )}
            <TouchableOpacity onPress={() => handleEdit('dateOfBirth')}>
              <Edit2 width={20} height={20} color="#666" />
            </TouchableOpacity>
          </View>

          

          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[styles.genderOption, gender === 'male' && styles.genderSelected]}
              onPress={() => setGender('male')}
            >
              <View style={[
                styles.genderRadio,
                gender === 'male' && styles.genderRadioSelected
              ]}>
                {gender === 'male' && <View style={styles.genderRadioDot} />}
              </View>
              <Text style={styles.genderText}>Nam</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.genderOption, gender === 'female' && styles.genderSelected]}
              onPress={() => setGender('female')}
            >
              <View style={[
                styles.genderRadio,
                gender === 'female' && styles.genderRadioSelected
              ]}>
                {gender === 'female' && <View style={styles.genderRadioDot} />}
              </View>
              <Text style={styles.genderText}>Nữ</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>{isLoading? 'Đang xử lý...' : 'Lưu'}</Text>
          </TouchableOpacity>
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
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
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
  infoSection: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 32,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 32,
  },
  genderRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderRadioSelected: {
    borderColor: '#0088ff',
  },
  genderRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0088ff',
  },
  genderText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#e8f0fe',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#0088ff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalInfoScreen;