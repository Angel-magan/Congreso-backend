const express = require("express");

const {
    getAutores,
    SubirTrabajo,
    //verificarCoautorEsCongresista
} = require("../controllers/trabajosController");

const router = express.Router();

// Rutas
router.get("/autores", getAutores);
router.post("/SubirTrabajos", SubirTrabajo);
//router.post("/validarCoautor", verificarCoautorEsCongresista);

module.exports = router;