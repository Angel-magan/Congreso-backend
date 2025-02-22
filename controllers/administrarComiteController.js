const db = require("../config/db");

// Obtener todos los congresistas
exports.getCongresistas = (req, res) => {
  const sql = "SELECT c.id_congresista, u.nombre, u.apellido, c.institucion, c.miembro_comite FROM congresista c INNER JOIN usuario u ON c.id_usuario = u.id_usuario";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
};

// Actualizar el estado de un congresista a miembro del comité
exports.actualizarMiembroComite = (req, res) => {
  const idCongresista = req.params.id;
  const miembroComite = req.params.miembroComite; // Obtén el valor de miembro_comite

  const sql = "UPDATE congresista SET miembro_comite = ? WHERE id_congresista = ?";

  db.query(sql, [miembroComite, idCongresista], (err, result) => {
    if (err) {
      console.error("Error en la actualización:", err);
      return res.status(500).json({
        message: "Error en la actualización",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encontró el congresista" });
    }

    res.json({ success: true, message: "Miembro del comité actualizado" });
  });
};