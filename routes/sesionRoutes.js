const express = require("express"); //Crear el server para dar rutas

const {
  getSesiones,
  obtenerDistribucionSesiones,
  obtenerUsoSalas,
} = require("../controllers/sesionController");

const router = express.Router();

// Rutas de sesion
router.get("/", getSesiones);
router.get("/distribucionSesiones", obtenerDistribucionSesiones);
router.get("/usoSalas", obtenerUsoSalas);

module.exports = router;
