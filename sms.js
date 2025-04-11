const axios = require("axios");



async function sendSms(phoneNumber, fullName) {

    console.log(phoneNumber);
    try {
        let message = `¡Bienvenido a CICMA 2025, ${fullName}!`;
        console.log(fullName);

        // Validar la longitud del mensaje
        if (message.length > 80) {
            message = message.substring(0, 79); // Truncar a 79 caracteres
        }

        const response = await axios.post("https://textbelt.com/text", {
            phone: phoneNumber,
            message: message,
            key: "c3bbb69eb63622c9b74c10797a08a8b6cfd97d2fn8jJHhq5RXl63TNROSQu33rwM", // Clave 
        });

        console.log(phoneNumber, message);

        console.log("Respuesta del API:", response.data);
    } catch (error) {
        console.error("Error al enviar el mensaje:", error.response?.data || error.message);
    }
}

module.exports = {
    sendSms,
};
