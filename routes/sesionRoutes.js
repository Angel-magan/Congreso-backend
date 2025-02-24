const express = require("express"); //Crear el server para dar rutas

const {
  getSesiones
} = require("../controllers/sesionController");

const router = express.Router(); 

// Rutas de sesion
router.get("/", getSesiones);

module.exports = router;
