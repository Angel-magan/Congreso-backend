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

// Usado para obtener los miembros del comité para crear sesión
exports.getMiembrosComite = (req, res) => {
  const { nombre } = req.query;

  let query = `
    SELECT 
        u.nombre,
        u.apellido
    FROM 
        congresista c
    JOIN 
        usuario u ON c.id_usuario = u.id_usuario
    WHERE 
        c.miembro_comite = 1
  `;

  const queryParams = [];

  if (nombre) {
      query += ` AND u.nombre LIKE ?`;
      queryParams.push(`%${nombre}%`);
  }

  db.query(query, queryParams, (err, results) => {
      if (err) {
          console.error("Error al obtener miembros del comité:", err);
          return res.status(500).json({ error: "Error en el servidor" });
      }
      res.json(results);
  });
};