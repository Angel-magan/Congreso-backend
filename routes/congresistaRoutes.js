const express = require("express"); //Crear el server para dar rutas

const {
  registrarCongresista,
  obtenerCongresistasPorInstitucion,
  obtenerRelacionesCongresistas,
  obtenerEvolucionInscripciones,
  obtenerNotificaciones,
  obtenerCongresistasConTrabajos,
} = require("../controllers/congresistaController");

const router = express.Router(); // Crear un enrutador y para definir las rutas

// Rutas de congresista
router.post("/registerCongressman", registrarCongresista);
router.get("/instituciones", obtenerCongresistasPorInstitucion);
router.get("/relacionesCongresistas", obtenerRelacionesCongresistas);
router.get("/evolucionInscripciones", obtenerEvolucionInscripciones);
router.get("/notificaciones", obtenerNotificaciones);
router.get("/congresistasTrabajos", obtenerCongresistasConTrabajos);

module.exports = router;
