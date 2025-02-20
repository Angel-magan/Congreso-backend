require("dotenv").config(); //Cargar variables d entorno
const express = require("express"); //Crear servidor web
const cors = require("cors"); //Para permitir solicitudes desde otro dominio

const db = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const administrarComiteRoutes = require("./routes/adminstrarComiteRoutes");
const { errorHandler } = require("./middleware/errorHandler");

const app = express(); //Instancia del servidor
app.use(cors()); //Evitar errores al consumir en React
app.use(express.json()); //Recibir los datos en JSON

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    process.exit(1); // Sale de la aplicación en caso de error
  }
  console.log("Conectado a la base de datos MySQL");
});

// Ruta para ver todos los usuarios
app.use("/api/users", userRoutes);
// Ruta para el administrar comite
app.use("/api/users", administrarComiteRoutes);

// Middleware para manejo de errores
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
