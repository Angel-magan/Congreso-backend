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

// Para la grafica
exports.obtenerDistribucionSesiones = (req, res) => {
  const sql = `SELECT 
          s.id_sesion,
          DATE_FORMAT(s.fecha_hora, '%Y-%m-%d %H:%i') AS fecha_sesion,
          COUNT(ds.id_trabajo) AS cantidad_trabajos
      FROM sesion s
      LEFT JOIN detalle_sesion ds ON s.id_sesion = ds.id_sesion
      GROUP BY s.id_sesion, s.fecha_hora
      ORDER BY s.fecha_hora;
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(
        "Error al obtener la distribución de trabajos por sesión:",
        error
      );
      return res
        .status(500)
        .json({ message: "Error al obtener datos", error: err });
    }

    //Objetos las sesiones y los trabajos presentados
    res.status(200).json(results);
  });
};

// Uso de salas
exports.obtenerUsoSalas = (req, res) => {
  const sql = `
    SELECT 
        DATE_FORMAT(fecha_hora, '%H:%i') AS horario,
        COUNT(id_sesion) AS sesiones_activas
    FROM sesion
    GROUP BY horario
    ORDER BY horario;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener el uso de salas:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener datos", error: err });
    }

    res.status(200).json(results);
  });
};
