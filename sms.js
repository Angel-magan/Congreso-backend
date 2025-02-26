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
            key: "", // Clave 
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
