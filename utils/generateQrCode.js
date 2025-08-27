import QRCode from 'qrcode'

export const generateQRCode = async (data) => {
  try {
    
    const qrCode = await QRCode.toDataURL(data);
    console.log("QR Code generated:", qrCode);
    return qrCode; // You can use this in an image tag or save it
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
};


