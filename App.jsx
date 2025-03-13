import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Router from "./routers/routers"; // Import file routers.jsx
import HomePage from "./components/User/HomePage";
import { Linking } from "react-native";

export default function App() {
  return (
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
    </NavigationContainer>
  );
}
