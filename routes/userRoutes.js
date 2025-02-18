const express = require("express"); //Crear el server para dar rutas

const {
  infoUser,
  registerUser,
  loginUser,
} = require("../controllers/userController");

const router = express.Router(); // Crear un enrutador y para definir las rutas

// Rutas de usuario
router.get("/datos", infoUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
module.exports = router;
