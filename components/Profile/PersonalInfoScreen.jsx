import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { X, Camera, Edit2 } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';

const PersonalInfoScreen = ({ navigation }) => {
  const [gender, setGender] = useState('male');
  const [profileImage, setProfileImage] = useState(null);

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving profile information');
    navigation.goBack();
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
            <View style={styles.profileImagePlaceholder}>
              <Camera width={32} height={32} color="#666" />
            </View>
          )}
          <TouchableOpacity style={styles.cameraButton}>
            <Camera width={20} height={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Văn Khanh Định</Text>
            <TouchableOpacity>
              <Edit2 width={20} height={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>13/06/2003</Text>
            <TouchableOpacity>
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
          >
            <Text style={styles.saveButtonText}>Lưu</Text>
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