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

exports.getSesionesReporte = (req, res) => {
  const query = `
        SELECT 
            s.id_sesion AS sesion,
            s.fecha_hora,
            t.titulo AS trabajo,
            CONCAT(u.nombre, ' ', u.apellido) AS ponente
        FROM sesion s
        JOIN detalle_sesion ds ON s.id_sesion = ds.id_sesion
        JOIN trabajo t ON ds.id_trabajo = t.id_trabajo
        JOIN congresista c ON ds.id_ponente_congresista = c.id_congresista
        JOIN usuario u ON c.id_usuario = u.id_usuario;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching sesiones");
        } else {
            res.json(results);
        }
    });
};

exports.getChairmansReporte = (req, res) => {
  const query = `
        SELECT 
            s.id_sesion AS sesion,
            s.fecha_hora,
            CONCAT(u.nombre, ' ', u.apellido) AS chairman
        FROM sesion s
        JOIN congresista c ON s.id_moderador_congresista = c.id_congresista
        JOIN usuario u ON c.id_usuario = u.id_usuario;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching chairmans");
        } else {
            res.json(results);
        }
    });
};


exports.getDiaMasTrabajos = (req, res) => {
  const query = `
        SELECT 
            DATE(s.fecha_hora) AS fecha,
            COUNT(ds.id_trabajo) AS cantidad_trabajos
        FROM sesion s
        JOIN detalle_sesion ds ON s.id_sesion = ds.id_sesion
        GROUP BY DATE(s.fecha_hora)
        ORDER BY cantidad_trabajos DESC
        LIMIT 1;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching día con más trabajos");
        } else {
            res.json(results);
        }
    });
};