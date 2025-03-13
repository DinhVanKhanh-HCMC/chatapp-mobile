import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const withAuth = (Component) => {
  return (props) => {
    const navigation = useNavigation();
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
      const checkAuth = async () => {
        const token = await AsyncStorage.getItem("token");
        setIsAuthenticated(!!token);
        if (!token) {
          navigation.replace("Login");
        }
      };

      checkAuth();
    }, [navigation]);

    // Hiển thị loading khi đang kiểm tra token
    if (isAuthenticated === null) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }

    return <Component {...props} />;
  };
};

export default withAuth;
