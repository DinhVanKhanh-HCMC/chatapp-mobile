import axios from 'axios';

import AsyncStorage from "@react-native-async-storage/async-storage";
//import { BASE_URL } from "./env"; 
import Toast from 'react-native-toast-message';
import { message } from 'antd-mobile';
import axiosInstance from './axiosconfig';
import { Platform,Alert } from 'react-native';
const BASE_URL = 'http://192.168.1.2:8080/api';



export default class ApiService {
  

  static async getHeader() {
    try {
      const token = await AsyncStorage.getItem("token"); // Lấy token từ AsyncStorage
      return {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.error("Lỗi khi lấy token:", error);
      return {
        Authorization: "",
        "Content-Type": "application/json",
      };
    }
  }

  //AUTH login

  static async loginApi(loginDetails) {
    try {
      console.log("Dữ liệu gửi đi:", JSON.stringify(loginDetails));
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        loginDetails
      );
      console.log("Phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi từ API:", error.response?.data || error.message);
      throw error.response?.data?.message || 'Đăng nhập thất bại';
    }
  }


  // register
  static async register(formDataToSend) {
    try {
        const apiUrl = `${BASE_URL}/auth/register`;

        const response = await axios.post(apiUrl, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        return response; // Trả về response để xử lý ở handleSubmit
    } catch (error) {
      //console.error("❌ Error saving profile:", error.response?.data?.message || error.message);
      // Toast.show({
      //     icon : 'error',
      //     content : error.response?.data?.message || "Lưu hồ sơ thất bại, vui lòng thử lại"
      // });
      Alert.alert('Thông báo','Lưu hồ sơ thất bại')
  }
  };


  static async resetPassword(resetPasswordDetails) {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/resetPassword`,
        resetPasswordDetails
      );
      Alert.alert('Thông báo', 'Đặt lại mật khẩu thành công!')
      return response.data;
    } catch (error) {
      Alert.alert(error)
    }
  }

  static async sendOTP(email, mode) {
    try {
      console.log("Dữ liệu gửi đi:", email);
      console.log("Chế độ:", mode);
  
      const response = await axios.post(
        `${BASE_URL}/otp/send?mode=${mode}`,
        { email }
      );
      return response.data;
    } catch (error) {
      const errorData = error?.response?.data;
      const showError = (msg) => {
        if (Platform.OS === 'web') {
          message.error(msg); // Ant Design
        } else {
        
        }
      };
  
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((err) => {
          console.log(err);
          showError(err);
        });
      } else {
        showError(errorData?.message || "Có lỗi xảy ra");
      }
  
      throw error; // để `handleSendOTP` biết là lỗi
    }
  }
  

  //get conversation
  static async getAllConversations() {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${BASE_URL}/conversation`, {
        headers: headers, 
      });
  
      return response.data; // Trả về danh sách các conversation
    } catch (error) {
      Alert.alert('Lỗi','Không thể lấy danh sách cuộc trò chuyện!')
      throw error;
    }
  }

  //update info
  static async updateInfo(id,formData) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/users/update/${id}`,formData, {
        headers: {headers, "Content-Type": "multipart/form-data" }
      });
  
      return response.data; // Trả về danh sách các conversation
    } catch (error) {
      Alert.alert('Lỗi','Update không thành công!')
      console.error("Loi tu server:",error)
      throw error;
    }
  }

  //get infor user
  static async getUserInfo() {
    try {
      const headers = await this.getHeader();
      const response = await axiosInstance.get(`${BASE_URL}/users/get-phone`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  


  // USER

  static async getAllUser() {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${BASE_URL}/users/get-all`, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      message.error('Lỗi khi lấy thông tin all user:', error);
    }
  }

  static async getPhoneLogin() {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${this.BASE_URL}/users/get-phone`, {
        headers: headers
      });
      return response.data;
    } catch (error) {
      message.error('Lỗi khi lấy thông tin phone user:', error);
    }
  }

  // // CONVERSSTION

  // static async getConversation() {
  //   try {
  //     const response = await axios.get(`${this.BASE_URL}/conversation`, {
  //       headers: this.getHeader()
  //     });
  //     return response.data;
  //   } catch (error) {
  //     message.error('Lỗi khi lấy thông tin conversation:', error);
  //   }
  // }
  // static async getConversationId(conversationId) {
  //   try {
  //     const response = await axios.post(
  //       `${this.BASE_URL}/conversation/${conversationId}`
  //     );
  //     return response.data;
  //   } catch (error) {
  //     message.error(error.response?.data);
  //     throw error;
  //   }
  // }

  // // MESSAGE
  // static async getMessages(conversationId) {
  //   try {
  //     const response = await axios.post(
  //       `${this.BASE_URL}/messages/${conversationId}`
  //     );
  //     return response.data;
  //   } catch (error) {
  //     message.error(error.response?.data);
  //     throw error;
  //   }
  // }

  static isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
