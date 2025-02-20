const express = require("express");

const {
    getCongresistas,
    addToComite,
} = require("../controllers/administrarComiteController");

const router = express.Router();

// Rutas
router.get("/congresistas", getCongresistas);
router.put("/actualizar-miembro/:id", addToComite);

module.exports = router;
