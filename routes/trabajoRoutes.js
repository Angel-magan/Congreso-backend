const express = require("express");

const {
  getAutores,
  SubirTrabajo,
  validarCongresista,
  buscarTrabajoPorTitulo,
  getAutoresPorTrabajo,
  obtenerEstadoTrabajos,
} = require("../controllers/trabajosController");

const router = express.Router();

// Rutas
router.get("/autores", getAutores);
router.post("/SubirTrabajos", SubirTrabajo);
router.post("/validarCongresista", validarCongresista);
router.get("/buscar", buscarTrabajoPorTitulo);
router.get("/:id_trabajo/autores", getAutoresPorTrabajo);
router.get("/estadoTrabajos", obtenerEstadoTrabajos);

module.exports = router;
