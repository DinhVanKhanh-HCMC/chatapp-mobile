import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import withAuth from "../hoc/withAuth";

// Import các màn hình
import EmailVerification from "../components/Auth/EmailVerification";
import Login from "../components/Auth/LoginScreen";
import Register from "../components/Auth/Register";
import StartPage from "../components/Auth/StartPage";
import NewPassword from "../components/Auth/NewPassword";
import ForgetPassword from "../components/Auth/ForgetPassword";
import HomePage from "../components/Message/HomePage";
import Contact from "../components/Contact/Contact";
import Profile from "../components/Profile/Profile";
import UserProfileScreen from "../components/Auth/UserProfileScreen";
import PersonalInfoScreen from "../components/Profile/PersonalInfoScreen";
import ChatScreen from "../components/Message/ChatScreen";
import FriendRequest from "../components/Contact/FriendRequest";
import CreateGroupScreen from "../components/Pages/CreateGroupScreen";
import Options from "../components/Message/Options";

const Stack = createStackNavigator();

const routers = () => {
  return (
    <Stack.Navigator initialRouteName="StartPage" 
      screenOptions={{
          
          animationEnabled: false, // Tắt hiệu ứng chuyển đổi cho toàn bộ màn hình
        }}
    >
      {/* Màn hình không yêu cầu đăng nhập */}
      <Stack.Screen name="StartPage" component={StartPage} options={{ headerShown: false }}/>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>
      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }}/>
      <Stack.Screen name="EmailVerification" component={EmailVerification} options={{ headerShown: false }}/>
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} options={{ headerShown: false }}/>
      <Stack.Screen name="NewPassword" component={NewPassword} options={{ headerShown: false }}/>
      <Stack.Screen name="RegisProfile" component={UserProfileScreen} options={{ headerShown: false }}/>

      {/* Màn hình yêu cầu đăng nhập */}
      <Stack.Screen name="Home" component={withAuth(HomePage)} options={{ headerShown: false }}/>
      <Stack.Screen name="Contact" component={withAuth(Contact)} options={{ headerShown: false }}/>
      <Stack.Screen name="Profile" component={withAuth(Profile)} options={{ headerShown: false }}/>
      <Stack.Screen name="PersonalInfoScreen" component={withAuth(PersonalInfoScreen)} options={{ headerShown: false }}/>
      <Stack.Screen name="ChatScreen" component={withAuth(ChatScreen)} options={{ headerShown: false }}/>
      <Stack.Screen name="FriendRequest" component={withAuth(FriendRequest)} options={{ headerShown: false }}/>
      <Stack.Screen name="CreateGroupScreen" component={withAuth(CreateGroupScreen)} options={{ headerShown: false }}/>
      <Stack.Screen name="Options" component={withAuth(Options)} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

export default routers;
