const express = require("express"); //Crear el server para dar rutas

const {
  getSesiones,
  getSesionesReporte,
  getChairmansReporte,
  getDiaMasTrabajos
} = require("../controllers/sesionController");

const router = express.Router(); 

// Rutas de sesion
router.get("/", getSesiones);
router.get("/getSesionesReporte", getSesionesReporte);
router.get("/getChairmansReporte", getChairmansReporte);
router.get("/getDiaMasTrabajos", getDiaMasTrabajos);

module.exports = router;
