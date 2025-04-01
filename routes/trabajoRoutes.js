const express = require("express");

const {
    getAutores,
    SubirTrabajo,
    validarCongresista,
    buscarTrabajoPorTitulo,
    getAutoresPorTrabajo,
    getTrabajos,
    getTrabajo,
    updateTrabajo
} = require("../controllers/trabajosController");

const router = express.Router();

// Rutas
router.get("/autores", getAutores);
router.post("/SubirTrabajos", SubirTrabajo);
router.post("/validarCongresista", validarCongresista);
router.get("/buscar", buscarTrabajoPorTitulo);
router.get("/:id_trabajo/autores", getAutoresPorTrabajo);
router.get("/trabajos", getTrabajos);
router.get("/getTrabajo/:id", getTrabajo);
router.put("/actualizarTrabajo/:id/:trabajoAceptado", updateTrabajo);

module.exports = router;