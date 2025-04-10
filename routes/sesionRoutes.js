const express = require("express"); //Crear el server para dar rutas

const {
  getSesiones,
  obtenerDistribucionSesiones,
  obtenerUsoSalas,
  getSesionesPorUsuario,
  getAsistenciaPorUsuario,
  getSesionesReporte,
  getChairmansReporte,
  getDiaMasTrabajos,
  crearSesion,
  getChairmanDisponibles
} = require("../controllers/sesionController");

const router = express.Router();

// Rutas de sesion
router.get("/", getSesiones);
router.get("/distribucionSesiones", obtenerDistribucionSesiones);
router.get("/usoSalas", obtenerUsoSalas);
router.get("/getSesionesPorUsuario/:id_usuario/:rol", getSesionesPorUsuario); 
router.get("/getAsistenciaPorUsuario/:id_usuario", getAsistenciaPorUsuario); 
router.get("/getSesionesReporte", getSesionesReporte);
router.get("/getChairmansReporte", getChairmansReporte);
router.get("/getDiaMasTrabajos", getDiaMasTrabajos);
router.post("/crearSesion", crearSesion);
router.get("/chairman-disponibles", getChairmanDisponibles); 

module.exports = router;
