import axios from 'axios';
import { message } from 'antd-mobile';
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { BASE_URL } from "./env"; 
import { Toast } from 'antd-mobile';
const BASE_URL = 'http://localhost:8080/api';


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
        `http://localhost:8080/api/auth/login`,
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
        const apiUrl = "http://localhost:8080/api/auth/register";

        const response = await axios.post(apiUrl, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        return response; // Trả về response để xử lý ở handleSubmit
    } catch (error) {
        console.error("❌ Error saving profile:", error.response?.data || error.message);
        throw error; // Ném lỗi để handleSubmit xử lý
    }
};


  static async resetPassword(resetPasswordDetails) {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/auth/resetPassword`,
        resetPasswordDetails
      );
      Toast.show({
        icon : 'success',
        content : 'Đặt lại mật khẩu thành công!'
      })
      return response.data;
    } catch (error) {
      Toast.show(err)
    }
  }

  static async sendOTP(email, mode) {
    try {
      console.log("Dữ liệu gửi đi:", email);
      console.log(mode)
      const response = await axios.post(
        `http://localhost:8080/api/otp/send?mode=${mode}`,
        {
          email: email
        }
        
      );
      return response.data;
    } catch (error) {
      const errorData = error.response.data;
      if (errorData?.errors) {
        Object.values(errorData.errors).forEach((err) => {
          Toast.show(err)
          console.log(err)
        });
      } else {
        Toast.show({
          icon: 'fail',
          content: errorData.message,
        });
      }
    }
  }

  // // USER

  // static async getAllUser() {
  //   try {
  //     const response = await axios.get(`${this.BASE_URL}/users/get-all`, {
  //       headers: this.getHeader()
  //     });
  //     return response.data;
  //   } catch (error) {
  //     message.error('Lỗi khi lấy thông tin all user:', error);
  //   }
  // }

  // static async getPhoneLogin() {
  //   try {
  //     const response = await axios.get(`${this.BASE_URL}/users/get-phone`, {
  //       headers: this.getHeader()
  //     });
  //     return response.data;
  //   } catch (error) {
  //     message.error('Lỗi khi lấy thông tin phone user:', error);
  //   }
  // }

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
