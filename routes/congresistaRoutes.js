const express = require("express"); //Crear el server para dar rutas


const {
    registrarCongresista,
} = require("../controllers/congresistaController");


const router = express.Router(); // Crear un enrutador y para definir las rutas


// Rutas de congresista
router.post("/registerCongressman", registrarCongresista);
module.exports = router;
