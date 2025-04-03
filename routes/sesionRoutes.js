const express = require("express"); //Crear el server para dar rutas

const {
  getSesiones,
  crearSesion,
  getChairmanDisponibles
} = require("../controllers/sesionController");

const router = express.Router(); 

// Rutas de sesion
router.get("/", getSesiones);
router.post("/crear-sesion", crearSesion);
router.get("/chairman-disponibles", getChairmanDisponibles); 

module.exports = router;
