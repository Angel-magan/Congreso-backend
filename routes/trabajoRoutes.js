const express = require("express");

const {
    getAutores
} = require("../controllers/trabajosController");

const router = express.Router();

// Rutas
router.get("/trabajos", getAutores);

module.exports = router;