import twilio from "twilio";
  
  const client = twilio('ACc6191b7192660ec1827198f299de6387', 'bf4137cdd30261c1c3657390ad2e4534');
  
  async function sendWhatsApp(senderPhoneNumber, messageBody) {
    try {
      const messageOptions = {
        from: 'whatsapp:+14155238886',
        to: `whatsapp:${senderPhoneNumber}`,
        body: messageBody,
      };
      
      const message = await client.messages.create(messageOptions);
      console.log("WhatsApp message sent:", message.sid);
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  }

  export default sendWhatsApp