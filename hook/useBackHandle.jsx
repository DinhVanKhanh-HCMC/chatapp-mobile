import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const useBackHandler = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack(); // Quay lại trang trước
        return true; // Ngăn chặn thoát ứng dụng
      }
      return false; // Nếu không có trang nào để quay lại, thoát ứng dụng
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [navigation]);
};

export default useBackHandler;
