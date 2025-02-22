const express = require("express");

const {
    getCongresistas,
    actualizarMiembroComite,
} = require("../controllers/administrarComiteController");

const router = express.Router();

// Rutas
router.get("/congresistas", getCongresistas);
router.put("/congresistas/:id/:miembroComite", actualizarMiembroComite);

module.exports = router;
