const db = require("../config/db");

// Obtener todos los congresistas
exports.getCongresistas = (req, res) => {
  const sql = "SELECT id_congresista, nombre, apellido, institucion, miembro_comite FROM congresista";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
};

// Actualizar el estado de un congresista a miembro del comité
exports.addToComite = (req, res) => {
  const { id } = req.params;

  const sql = "UPDATE congresista SET miembro_comite = 1 WHERE id_congresista = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error en la actualización", error: err });
    }
    res.json({ success: true, message: "Congresista agregado al comité" });
  });
};
