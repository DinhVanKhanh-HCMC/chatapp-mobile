import { useState, useEffect } from 'react';

const useEmailValidation = () => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Hàm kiểm tra email hợp lệ
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Cập nhật trạng thái hợp lệ khi email thay đổi
  useEffect(() => {
    setIsValid(validateEmail(email));
  }, [email]);

  return { email, setEmail, isValid };
};

export default useEmailValidation;
