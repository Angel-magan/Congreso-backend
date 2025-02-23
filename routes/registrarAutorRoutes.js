const express = require("express");

const {
    getUsuarioById,
    registrarAutor,
} = require("../controllers/registrarAutorController");

const router = express.Router();

// Rutas
router.get("/autor/:id", getUsuarioById);  // Para obtener los datos de un autor
router.post("/autor", registrarAutor);  // Para registrar un autor


module.exports = router;
