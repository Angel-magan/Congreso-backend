const express = require("express"); //Crear el server para dar rutas

const {
  getSesiones,
  getSesionesPorUsuario,
  getAsistenciaPorUsuario,


} = require("../controllers/sesionController");

const router = express.Router(); 

// Rutas de sesion
router.get("/", getSesiones);
router.get("/getSesionesPorUsuario/:id_usuario/:rol", getSesionesPorUsuario); 
router.get("/getAsistenciaPorUsuario/:id_usuario", getAsistenciaPorUsuario); 

module.exports = router;
