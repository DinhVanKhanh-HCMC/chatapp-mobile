import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Router from "./routers/routers"; // Import file routers.jsx
import HomePage from "./components/Message/HomePage";
import { Linking } from "react-native";
import FriendRequest from "./components/Contact/FriendRequest";
import ChatScreen from "./components/Message/ChatScreen";
import CreateGroupScreen from "./components/Pages/CreateGroupScreen";
import PersonalInfoScreen from "./components/Profile/PersonalInfoScreen";
import { WebSocketProvider } from "./components/Message/WebSocketContext";
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

export default function App() {
  return (
    <ActionSheetProvider>
    <WebSocketProvider>
    <NavigationContainer
      linking={{
        prefixes: ['myapp://'], // Tiền tố URL của ứng dụng
        config: {
          screens: {
            OTP: 'otp', // Xử lý URL có dạng myapp://otp?mode=...
          },
        },
      }}
     >
      <Router/>
      {/* <ChatScreen/> */}
      {/* <PersonalInfoScreen/> */}
    </NavigationContainer>
    </WebSocketProvider>
    </ActionSheetProvider>
  );
}
