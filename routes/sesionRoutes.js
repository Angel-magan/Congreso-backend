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
  getMiembrosDisponibles,
  asistirSesion,
  verificarAsistencia,

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
router.get("/miembros-comite", getMiembrosDisponibles); 
router.post("/asistir-sesion", asistirSesion);
router.get("/verificarAsistencia/:id_congresista/:id_sesion", verificarAsistencia);

module.exports = router;
