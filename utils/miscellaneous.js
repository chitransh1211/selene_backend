import crypto from 'crypto'


export const isValidIndianPhoneNumber = (phone) => {
    const regex = /^(?:\+91|0)?[6789]\d{9}$/;
    return regex.test(phone);
  };

  
export const generateOTP = () => crypto.randomInt(100000, 999999).toString();
  
  
  