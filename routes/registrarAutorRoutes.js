const express = require("express");

const {
  getUsuarioById,
  registrarAutor,
  obtenerTopTenAutores,
} = require("../controllers/registrarAutorController");

const router = express.Router();

// Rutas
router.get("/autor/:id", getUsuarioById); // Para obtener los datos de un autor
router.post("/autor", registrarAutor); // Para registrar un autor
// Ruta para obtener el top 10 de autores
router.get("/topTenAutores", obtenerTopTenAutores);

module.exports = router;
