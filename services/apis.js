import axios from 'axios';

import AsyncStorage from "@react-native-async-storage/async-storage";
//import { BASE_URL } from "./env"; 
import Toast from 'react-native-toast-message';
import { message } from 'antd-mobile';
import axiosInstance from './axiosconfig';
import { Platform,Alert } from 'react-native';
const BASE_URL = 'http://192.168.1.6:8080/api';



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

  //AUTH --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  
  //login
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

  //logout
  static async logoutApi() {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/auth/loggout`,{}, {
        headers: headers, 
      });
  
      return response.data; // Trả về danh sách các conversation
    } catch (error) {
      Alert.alert('Lỗi','Lỗi khi gọi api logout!')
      throw error;
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

  //reset password
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

  //send OTP
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

  //verify otp
  static async verifyOtp(email,otp) {
    try {
      const response = await axios.post(
        `${BASE_URL}/otp/verifyOTP`,{},
        {params: {Email: email, otp: otp}}
      );
      return response.data;
    } catch (error) {
      console.error(error)
    }
  }




  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


  //CONVER --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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

  //lay chi tiet conver bang converID của người dùng hiện tại
  static async getConversationById(converId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/conversation/${converId}`,{}, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      message.error('Lỗi khi lấy thông tin tất cả friendship của user:', error);
    }
  }

  //tao nhom
  static async createConversation(data) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/conversation/create/conversation`,data, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      message.error('Lỗi khi tạo conversation:', error);
    }
  }

  //get user trong group
  static async getUsersConversation(conversationId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${BASE_URL}/conversation/getUser/${conversationId}`, {
        headers: headers, 
      });
  
      return response.data; // Trả về danh sách các conversation
    } catch (error) {
      Alert.alert('Lỗi','Không thể lấy danh sách cuộc trò chuyện!')
      throw error;
    }
  }

  //thêm user vảo group
  static async addUserToGroup(conversationId,data) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/conversation/addUserConversation/${conversationId}`,data, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      message.error('Lỗi khi thêm user vào group:', error);
    }
  }

  // roi khoi nhom
  static async exitGroup(conversationId,id) {
    try {
      const headers = await this.getHeader();
      const response = await axios.put(`${BASE_URL}/conversation/exit/${conversationId}`,{},
        {
          headers: headers,
          params: { newAdminId: id }
        }
      );
      return response.data;
    } catch (error) {
      message.error('Lỗi khi rời khỏi nhóm:', error);
    }
  }

  //chuyển quyền nhóm trưởng
  static async ChangeLeader(conversationId,id) {
    try {
      const headers = await this.getHeader();
      const response = await axios.put(`${BASE_URL}/conversation/changeLeader/${conversationId}`,{},
        {
          headers: headers,
          params: { newAdminId: id }
        }
      );
      return response.data;
    } catch (error) {
      message.error('Lỗi khi rời khỏi nhóm:', error);
    }
  }

  //giải tán nhóm
  static async DeleteConversation(conversationId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/conversation/delete/${conversationId}`,{}, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      message.error('Lỗi khi thêm user vào group:', error);
    }
  }

  //xóa thành viên nhóm bởi admin
  static async removeMember(conversationId, id) {
    try {
      const headers = await this.getHeader();
      const response = await axios.delete(`${BASE_URL}/conversation/removeMember/${conversationId}`, 
        {
          headers: headers,
          params: { memberId: id }
        }
      );
      return response.data;
    } catch (error) {
      message.error('Lỗi khi gọi api xóa thành viên:', error);
    }
  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  

  //USER --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  //get all user
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

  //get info current user login
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

  //get user infor by phone to add friend 
  static async getInfoByPhone(phoneNumber) {
    try {
      const response = await axios.get(
        `${BASE_URL}/users/getPhoneFriend`,{
          params:{
            phoneNumber: phoneNumber
          }
        }
      );
      console.log("Phản hồi API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Lỗi từ API:", error.response?.data || error.message);
      throw error.response?.data?.message || 'Lỗi lấy thông tin';
    }
  }

  //get online user
  static async getOnlineUsers() {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${BASE_URL}/users/onlineUser`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user online:', error);
    }
  }
  
  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


  //FRIEND --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  // send Request Friend
  static async sendRequestFriend(friendId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(
        `${BASE_URL}/friend/sendFriend`,{},
        {
          headers: headers,
          params: { friendId: friendId }
        }
      );
      return response.data;
    } catch (error) {
      // ✅ Kiểm tra an toàn
      if (error.response) {
        console.error('Lỗi từ server:', error.response.data);
      } else if (error.request) {
        console.error('Không nhận được phản hồi từ server:', error.request);
      } else {
        console.error('Lỗi khi gửi request:', error.message);
      }
      throw error; // Nên throw để xử lý ở nơi gọi hàm
    }
  }

  //get friendShip user login
  static async getFriendUserLogin() {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${BASE_URL}/friend/getFriendUserAccept`, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      message.error('Lỗi khi lấy thông tin tất cả bạn bè của user:', error);
    }
  }

  //get friend request
  static async getFriendRequest() {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${BASE_URL}/friend/received-requests`, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin lời mời kết bạn:', error);
    }
  }

  //accept friend
  static async acceptFriend(friendId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/friend/acceptFriend`,{}, {
        headers: headers, params:{ friendId: friendId}
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi api chấp nhận kết bạn:', error);
    }
  }

  //get friendShip user login
  static async getPendingFriendRequestSentByUser() {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${BASE_URL}/friend/getPendingFriendRequestsSentByUser`, {
        headers: headers,
      });
      return response.data;
    } catch (error) {
      message.error('Lỗi khi lấy thông tin tất cả các lời mời của user đã gửi đi:', error);
    }
  }

  //unfriend
  static async unFriend(friendId) {
    try {
      if (!friendId) {
        throw new Error('friendId không được xác định!');
      }
  
      const headers = await this.getHeader();
      const response = await axios.post(
        `${BASE_URL}/friend/unfriend`,
        null,
        {
          headers,
          params: { friendId }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi api unfriend:', error);
      throw error;
    }
  }
  

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  


  //MESSAGE---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  //get all message
  static async getAllMessage(conversationId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.get(`${BASE_URL}/messages/${conversationId}`, {
        headers: headers
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi api lấy tất cả tin nhắn của conver:', error);
    }
  }

  //upload file
  static async uploadFile(formData) {
    try {
      const headers = await this.getHeader();
  
      // const formData = new FormData();
      // formData.append('photo', {
      //   uri: fileUri,
      //   name: 'upload.jpg',
      //   type: 'image/jpeg',
      // });
  
      const response = await axios.post(`${BASE_URL}/messages/upload`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      return response.data; // hoặc response.data nếu bạn để khác
    } catch (error) {
      console.error('Lỗi khi upload file:', error);
      throw error;
    }
  }

  //delete message
  static async deleteMessage(messageId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.delete(`${BASE_URL}/messages/${messageId}/xoa`, {
        headers: headers
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi api xóa tin nhắn:', error);
    }
  }

  //unsend message
  static async unsendMessage(messageId,conversationId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.delete(`${BASE_URL}/messages/${messageId}/thu-hoi`, {
        headers: headers, params: {conversationId: conversationId}
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert('Lỗi', 'Quá thời gian thu hồi (6 phút)');
      } else {
        console.error('Lỗi khi gọi API thu hồi tin nhắn:', error);
      }
      
    }
  }

  //share message
  static async shareMessage(formData) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/messages/shareMessage`,formData, {
        headers: headers
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        Alert.alert('Lỗi', 'Tin nhăn này đã bị thu hồi');
      } else {
        console.error('Lỗi khi gọi API chuyển tiếp tin nhắn:', error);
      }
    }
      
  }

  //seen message
  static async seenMessage(conversationId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/messages/${conversationId}/seen`,{},{
        headers: headers
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi api seen message:', error);
    }
  }

  //xóa lịch sử trò chuyện
  static async deleteHistoryChat(conversationId) {
    try {
      const headers = await this.getHeader();
      const response = await axios.post(`${BASE_URL}/messages/deleteHistoryMessageUser/${conversationId}`,{}, {
        headers: headers
      });
      return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API xóa lịch sử chat:', error);
    }
      
  }
  



  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  static isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
