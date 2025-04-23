import {React, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, MessageCircle, Users, User, LogOut, Camera, Edit2 } from 'react-native-feather';
import { LinearGradient } from 'expo-linear-gradient';
import ApiService from '../../services/apis';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useActionSheet } from "@expo/react-native-action-sheet";

const Options = ({ navigation, route }) => {

  const { showActionSheetWithOptions } = useActionSheet();
  const nav = useNavigation()
  //modal edit name group
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [name, setName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  

  //view user
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //add use to group
  const [visible, setVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [adding, setAdding] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const { conversationId } = route.params;

  // Lấy currentUserId từ AsyncStorage
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('id');
        console.log('currentUserId:', userId);
        if (userId) {
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error('Failed to get current user ID:', error);
      }
    };
    
    getCurrentUserId();
  }, []);


  //fuction view user
  const fetchGroupMembers = async () => {
    if (!conversationId) {
      setError('Thiếu ID cuộc trò chuyện');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // 1. Lấy thông tin conversation
      const convResponse = await ApiService.getConversationById(conversationId);
      console.log("Conversation response:", convResponse);
      setName(convResponse.name)
      const conversation = convResponse.data;
      
      // 2. Lấy danh sách tất cả user
      const usersResponse = await ApiService.getAllUser();
      const allUsers = usersResponse.data;

      // 3. Kết hợp dữ liệu
      const combinedMembers = conversation.users.map(user => {
        // Tìm role từ groupMembers
        const memberRole = conversation.groupMembers?.find(
          m => m.userId === user.id
        )?.role || 'USER';
        
        // Tìm thông tin bổ sung từ allUsers
        const userDetails = allUsers.find(u => u.id === user.id) || {};
        
        return {
          ...user,
          ...userDetails, // Thêm các thông tin bổ sung
          role: memberRole,
        };
      });

      setMembers(combinedMembers);
    } catch (err) {
      setError('Không thể tải danh sách thành viên');
      console.error('Lỗi khi tải thành viên:', err);
    } finally {
      setLoading(false);
    }
  };

  //open and close modal view user
  const openModal = () => {

    setIsModalVisible(true);
    fetchGroupMembers();
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Lấy danh sách bạn bè
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getFriendUserLogin();
      setFriends(response.data || []);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách bạn bè');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // Kiểm tra bạn đã trong nhóm chưa
  const isMemberInGroup = (friendId) => {
    return members.some(member => member.id === friendId);
  };

  // Xử lý chọn bạn
  const toggleFriendSelection = (friend) => {
    if (isMemberInGroup(friend.friendId)) return; // Không cho chọn nếu đã trong nhóm

    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f.friendId === friend.friendId);
      if (isSelected) {
        return prev.filter(f => f.friendId !== friend.friendId);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một thành viên');
      return;
    }

    try {
      setAdding(true);
      const data = selectedFriends.map(f => ({ id: f.friendId }));

      const response = await ApiService.addUserToGroup(conversationId, data);
      if (response.code === 200) {
        Alert.alert('Thành công', 'Đã thêm thành viên vào nhóm');
        handleCloseAddMember(); // Truyền true để báo hiệu cần refresh danh sách
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Thêm thành viên thất bại');
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchFriends();
      fetchGroupMembers();
      setSelectedFriends([]); // Reset khi mở modal
    }
  }, [visible]);

// Khi mở modal thêm thành viên
const handleOpenAddMember = () => {
  setVisible(true);
};

// Xử lý khi đóng modal thêm thành viên
const handleCloseAddMember = (needRefresh) => {
  setVisible(false);
};



  // Component hiển thị mỗi thành viên trong danh sách thành viên
  const renderMemberItem = ({ item }) => (
    <TouchableOpacity onLongPress={() => handleLongPress(item)}>
    <View style={styles.memberItem}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/50' }} 
        style={styles.avatar}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberPhone}>{item.phoneNumber}</Text>
      </View>
      {item.role === 'ADMIN' && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminText}>Trưởng nhóm</Text>
        </View>
      )}
    </View>
    </TouchableOpacity>
  );


  //ham xử lý khi nhấn giữ thành viên
  const handleLongPress = (selectedMember) => {
    const options = ["Xóa khỏi nhóm", "Chuyển quyền nhóm trưởng", "Hủy"];
    const cancelButtonIndex = 2;
    
    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      async (buttonIndex) => {
        if (buttonIndex === 0) {
          if (!currentUserId || !members) return;
  
          const currentMember = members.find(m => m.id === currentUserId);
  
          if (!currentMember || currentMember.role !== 'ADMIN') {
            Alert.alert("Bạn không có quyền!", "Chỉ trưởng nhóm mới có thể xóa thành viên.");
            return;
          }
  
          // Không cho tự xóa chính mình
          if (selectedMember.id === currentUserId) {
            Alert.alert("Không hợp lệ", "Bạn không thể tự xóa chính mình.");
            return;
          }
  
          Alert.alert(
            "Xác nhận",
            `Bạn có chắc muốn xóa ${selectedMember.name || "thành viên"} khỏi nhóm?`,
            [
              { text: "Hủy", style: "cancel" },
              {
                text: "Đồng ý",
                onPress: async () => {
                  try {
                    const response = await ApiService.removeMember(conversationId, selectedMember.id);
                    if (response.message.includes("Xóa thành viên thành công")) {
                      Alert.alert("Thành công", "Thành viên đã bị xóa khỏi nhóm.");
                      fetchGroupMembers(); // reload danh sách thành viên
                    } else {
                      Alert.alert("Lỗi", "Không thể xóa thành viên.");
                    }
                  } catch (err) {
                    console.error("Lỗi xóa thành viên:", err);
                    Alert.alert("Lỗi", err.response?.data?.message || "Có lỗi xảy ra khi xóa thành viên.");
                  }
                }
              }
            ]
          );
          return;
        }
        
        // nút chuyển quyền nhóm trưởng
        if (buttonIndex === 1) {
          if(!currentUserId || !members) return;

          const currentMember = members.find(m => m.id === currentUserId);
  
          if (!currentMember || currentMember.role !== 'ADMIN') {
            Alert.alert("Bạn không có quyền!", "Chỉ trưởng nhóm mới có thể chuyển quyền.");
            return;
          }
  
          try {
            const response = await ApiService.ChangeLeader(conversationId,selectedMember.id)
  
            if (response.message === 'SUCCESS') {
              Alert.alert("Thành công", "Bạn đã chuyển quyền nhóm trưởng.");
              fetchGroupMembers(); // Cập nhật lại danh sách
            }
          } catch (err) {
            Alert.alert("Lỗi", err.response?.data?.message || "Không thể chuyển quyền nhóm trưởng.");
            console.error("Lỗi chuyển quyền:", err);
          }
        }
      }
    );
    return;
  }

  //hiển thị mỗi bạn bè trong danh sách muốn thêm vào group
  const renderFriendItem = ({ item }) => {
    const isMember = isMemberInGroup(item.friendId);
    const isSelected = selectedFriends.some(f => f.friendId === item.friendId);

    return (
      <TouchableOpacity 
        style={[
          styles.friendItem,
          isMember && styles.disabledItem,
          isSelected && styles.selectedItem
        ]}
        onPress={() => !isMember && toggleFriendSelection(item)}
        disabled={isMember}
      >
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.friendName}</Text>
          {isMember && <Text style={styles.memberStatus}>Đã trong nhóm</Text>}
        </View>
        {!isMember && (
          <View style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected
          ]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleconfirmExit = () => {
    Alert.alert(
      'Rời nhóm',
      'Bạn có chắc chắn muốn rời nhóm?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Rời',
          style: 'destructive',
          onPress: () => {
            handleExitGroup();
          },
        },
      ],
    );
  };

  // hàm xử lý rời nhóm
  const handleExitGroup = async () => {
    
    
    try {

      await fetchGroupMembers();

      if(!conversationId || !currentUserId || !members || members.length === 0){
        Alert.alert("Lỗi", "Không tải được danh sách thành viên");
        return;
      } 

      const currentMember = members.find(m => m.id === currentUserId);
      console.log(members)
  
      if (!currentMember) {
        Alert.alert("Lỗi", "Không tìm thấy bạn trong danh sách thành viên.");
        return;
      }
  
      if (currentMember.role === 'ADMIN') {
        Alert.alert("Không thể rời nhóm", "Bạn là trưởng nhóm. Vui lòng chuyển quyền trưởng nhóm trước khi rời.");
        return;
      }
  
      // Nếu không phải admin → gọi API luôn
      const response = await ApiService.exitGroup(conversationId,currentUserId)
  
      if (response.message === "Rời nhóm thành công") {
        Alert.alert("Thành công", "Bạn đã rời khỏi nhóm.");
        nav.navigate('Home'); // trở lại homepage
      }
    } catch (error) {
      Alert.alert("Lỗi", "Rời nhóm thất bại");
      console.error("Lỗi rời nhóm:", error);
    }
  };

  //hàm xử lý giải tán nhóm
  const handleDeleteGroup = async () => {
    
    try {

      await fetchGroupMembers();

      if(!conversationId || !currentUserId || !members || members.length === 0){
        Alert.alert("Lỗi", "Không tải được danh sách thành viên");
        return;
      } 

      // Tìm thành viên hiện tại trong danh sách
      const currentMember = members.find(m => m.id === currentUserId);
  
      // Kiểm tra quyền
      if (!currentMember || currentMember.role !== 'ADMIN') {
        Alert.alert("Bạn không có quyền!", "Chỉ trưởng nhóm mới có thể giải tán nhóm.");
        return;
      }
  
      // Xác nhận từ người dùng
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn giải tán nhóm không?",
        [
          {
            text: "Hủy",
            style: "cancel"
          },
          {
            text: "Đồng ý",
            onPress: async () => {
              try {
                const response = await ApiService.DeleteConversation(conversationId);
                
                if (response?.message?.includes("xoa thanh cong")) {
                  Alert.alert("Thành công", "Nhóm đã được giải tán.");
                  navigation.goBack(); // hoặc chuyển về màn khác tùy app bạn
                } else {
                  Alert.alert("Lỗi", "Không thể giải tán nhóm.");
                }
              } catch (err) {
                console.error("Lỗi giải tán nhóm:", err);
                Alert.alert("Lỗi", err.response?.data?.message || "Có lỗi xảy ra khi gọi API.");
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error("Lỗi ngoài:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý yêu cầu.");
    }
  };

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
          <ChevronLeft stroke="#fff" width={24} height={24} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.profileSection}>
        
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=1' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Camera width={20} height={20} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.profileName}>{name}</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.editIcon}>
            <Edit2 width={18} height={18} color="#666" />
          </TouchableOpacity>
        </View>

      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} 
        onPress={() => {handleOpenAddMember()}}>
          <Text style={styles.menuText}>Thêm thành viên</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}
        onPress={() => {openModal();console.log('Current conversationId:', conversationId)}}>
          <Text style={styles.menuText}>Xem thành viên</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Xóa lịch sử trò chuyện</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteGroup}>
          <Text style={styles.menuText}>Giải tán nhóm</Text>
        </TouchableOpacity>


        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleconfirmExit}
        >
          <LogOut stroke="#ff3b30" width={20} height={20} />
          <Text style={styles.logoutText}>Rời nhóm</Text>
        </TouchableOpacity>
      </View>

    {/* Modal chỉnh sửa group */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder="Nhập tên mới"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setName(newName);
                  setModalVisible(false);
                }}
                style={[styles.modalButton,styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

       {/* Modal hiển thị danh sách thành viên */}
       <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thành viên nhóm</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>Đóng</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={members}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </Modal>

    {/* Modal thêm thành viên */}
      <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => onClose(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Thêm thành viên</Text>
          <TouchableOpacity onPress={() => handleCloseAddMember()}>
            <Text style={styles.closeButton}>Đóng</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <>
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={item => item.friendId}
              contentContainerStyle={styles.listContainer}
            />
            
            <TouchableOpacity 
              style={[
                styles.addButton,
                (selectedFriends.length === 0 || adding) && styles.addButtonDisabled
              ]}
              onPress={handleAddMembers}
              disabled={selectedFriends.length === 0 || adding}
            >
              {adding ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.addButtonText}>
                  Thêm ({selectedFriends.length}) thành viên
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>

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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuSection: {
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff3b30',
    marginLeft: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#0088ff',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeNavText: {
    color: '#0088ff',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // hoặc marginLeft cho icon
    marginTop: 12,
  },
  editIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  
  cancelButton: {
    backgroundColor: '#ccc',
  },
  
  
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
  },
  
  viewMembersButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    paddingTop: 70,
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    color: '#2196F3',
  },
  listContainer: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
  },
  adminBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  adminText: {
    color: '#2196F3',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    color: '#2196F3',
  },
  listContainer: {
    paddingBottom: 70,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  disabledItem: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  memberStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    marginTop: 50,
  },
  
});

export default Options;