const express = require("express");

const {
  getAutores,
  SubirTrabajo,
  validarCongresista,
  buscarTrabajoPorTitulo,
  getAutoresPorTrabajo,
  obtenerEstadoTrabajos,
  getTrabajos,
  getTrabajo,
  updateTrabajo,
  getTrabajosPorAutor,
  getTrabajosReporte,
  getTrabajosNoAceptados,
  buscarTrabajoParaPresentar
} = require("../controllers/trabajosController");

const router = express.Router();

// Rutas
router.get("/autores", getAutores);
router.post("/SubirTrabajos", SubirTrabajo);
router.post("/validarCongresista", validarCongresista);
router.get("/buscar", buscarTrabajoPorTitulo);
router.get("/:id_trabajo/autores", getAutoresPorTrabajo);
router.get("/estadoTrabajos", obtenerEstadoTrabajos);
router.get("/trabajos", getTrabajos);
router.get("/getTrabajo/:id", getTrabajo);
router.put("/actualizarTrabajo/:id/:trabajoAceptado", updateTrabajo);
router.get("/getTrabajosPorAutor/:id_autor", getTrabajosPorAutor);
router.get("/getTrabajosReporte", getTrabajosReporte);
router.get("/getTrabajosNoAceptados", getTrabajosNoAceptados);
router.get("/buscarParaCrearSesion", buscarTrabajoParaPresentar);

module.exports = router;
