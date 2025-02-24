const db = require("../config/db");

//Ver sesiones
exports.getSesiones = (req, res) => {
    const sql = `SELECT 
          s.fecha_hora, 
          s.sala, 
          us.nombre AS moderador, 
          u.nombre AS ponente, 
          t.titulo 
        FROM sesion s
        INNER JOIN usuario u ON u.id_usuario = s.id_ponente_congresista
        INNER JOIN usuario us ON us.id_usuario = s.id_moderador_congresista
        INNER JOIN trabajo t ON t.id_trabajo = s.id_trabajo`;
    //Ejecutar la consulta y manejar las respuestas con err, result
    db.query(sql, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json(result); //Enviar al front en formato json
    });
};