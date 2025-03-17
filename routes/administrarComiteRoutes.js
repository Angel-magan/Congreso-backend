const express = require("express");

const {
    getCongresistas,
    actualizarMiembroComite,
    getMiembrosComite
} = require("../controllers/administrarComiteController");

const router = express.Router();

// Rutas
router.get("/congresistas", getCongresistas);
router.put("/congresistas/:id/:miembroComite", actualizarMiembroComite);
router.get('/miembros-comite', getMiembrosComite);

module.exports = router;
