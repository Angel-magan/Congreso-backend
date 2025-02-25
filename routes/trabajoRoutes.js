const express = require("express");

const {
    getAutores,
    SubirTrabajo,
    validarCongresista
} = require("../controllers/trabajosController");

const router = express.Router();

// Rutas
router.get("/autores", getAutores);
router.post("/SubirTrabajos", SubirTrabajo);
router.post("/validarCongresista", validarCongresista);

module.exports = router;