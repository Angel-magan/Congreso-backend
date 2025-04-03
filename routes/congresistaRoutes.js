const express = require("express"); //Crear el server para dar rutas


const {
    registrarCongresista,
    getInfoCongressman,
    getInfoAuthor,
    getCongresistas
} = require("../controllers/congresistaController");


const router = express.Router(); // Crear un enrutador y para definir las rutas


// Rutas de congresista
router.post("/registerCongressman", registrarCongresista);
router.get("/congressmanInfo/:id", getInfoCongressman);
router.get("/getInfoAuthor/:id", getInfoAuthor);
router.get("/getCongresistas", getCongresistas);
module.exports = router;
