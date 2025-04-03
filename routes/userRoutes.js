const express = require("express"); //Crear el server para dar rutas

const {
  infoUser,
  registerUser,
  registerUserAndAuthor,
  loginUser,
  homeUserInfo,
  getAutoresNoCongresistas
} = require("../controllers/userController");

const router = express.Router(); // Crear un enrutador y para definir las rutas

// Rutas de usuario
router.get("/datos", infoUser);
router.get("/infoUser/:id", homeUserInfo);
router.post("/register", registerUser);
router.post("/register-author", registerUserAndAuthor); // Nueva ruta para registrar usuario y autor
router.post("/login", loginUser);
router.get("/getAutoresNoCongresistas", getAutoresNoCongresistas); // Obtener autores que no son congresistas
module.exports = router;
