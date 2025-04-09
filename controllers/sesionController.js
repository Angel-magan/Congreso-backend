const db = require("../config/db");

//Ver sesiones
exports.getSesiones = (req, res) => {
      const sql = `SELECT 
      s.fecha_hora, 
      s.sala, 
      us.nombre AS moderador, 
      JSON_ARRAYAGG(u.nombre) AS ponentes_trabajo,
      JSON_ARRAYAGG(t.titulo) AS titulos_trabajos 
    FROM sesion s
    INNER JOIN detalle_sesion ds ON s.id_sesion = ds.id_sesion
    INNER JOIN usuario u ON u.id_usuario = ds.id_ponente_congresista
    INNER JOIN usuario us ON us.id_usuario = s.id_moderador_congresista
    INNER JOIN trabajo t ON t.id_trabajo = ds.id_trabajo
    GROUP BY s.id_sesion;`;
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

exports.getSesionesPorUsuario = (req, res) => {
  const { id_usuario, rol } = req.params;


  let sql = "";

  if (rol.includes("ponente")) {
    sql = 
    `
    SELECT 
    s.fecha_hora, 
    s.sala, 
    CONCAT(u_moderador.nombre, ' ', u_moderador.apellido) AS chairman, 
    CONCAT(u_ponente.nombre, ' ', u_ponente.apellido) AS ponente, 
    t.titulo 

      FROM sesion s INNER JOIN congresista c_moderador ON c_moderador.id_congresista = s.id_moderador_congresista 
        INNER JOIN usuario u_moderador ON u_moderador.id_usuario = c_moderador.id_usuario 
        INNER JOIN detalle_sesion dts ON dts.id_sesion = s.id_sesion 
        INNER JOIN congresista c_ponente ON c_ponente.id_congresista = dts.id_ponente_congresista 
        INNER JOIN usuario u_ponente ON u_ponente.id_usuario = c_ponente.id_usuario 
        INNER JOIN trabajo t ON t.id_trabajo = dts.id_trabajo 

            WHERE dts.id_ponente_congresista = ?`;

  } else if (rol.includes("chairman")) {
    sql = 
    `
    SELECT 
    s.fecha_hora, 
    s.sala, 
    CONCAT(u_moderador.nombre, ' ', u_moderador.apellido) AS chairman, 
    CONCAT(u_ponente.nombre, ' ', u_ponente.apellido) AS ponente,  
    t.titulo 

      FROM sesion s INNER JOIN congresista c_moderador ON c_moderador.id_congresista = s.id_moderador_congresista 
        INNER JOIN usuario u_moderador ON u_moderador.id_usuario = c_moderador.id_usuario 
        INNER JOIN detalle_sesion dts ON dts.id_sesion = s.id_sesion 
        INNER JOIN congresista c_ponente ON c_ponente.id_congresista = dts.id_ponente_congresista 
        INNER JOIN usuario u_ponente ON u_ponente.id_usuario = c_ponente.id_usuario 
        INNER JOIN trabajo t ON t.id_trabajo = dts.id_trabajo 

            WHERE s.id_moderador_congresista = ?`;

  }else{
    return res.status(400).json({error: "Rol invalido"});
  }



  db.query(sql, [id_usuario], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
};


exports.getAsistenciaPorUsuario = (req, res) => {
  const { id_usuario} = req.params;


  let sql = `
    SELECT 
    s.fecha_hora, 
    s.sala, 
    CONCAT(u_moderador.nombre, ' ', u_moderador.apellido) AS chairman, 
    CONCAT(u_ponente.nombre, ' ', u_ponente.apellido) AS ponente, 
    t.titulo 

      FROM sesion s INNER JOIN congresista c_moderador ON c_moderador.id_congresista = s.id_moderador_congresista 
        INNER JOIN usuario u_moderador ON u_moderador.id_usuario = c_moderador.id_usuario 
        INNER JOIN detalle_sesion dts ON dts.id_sesion = s.id_sesion 
        INNER JOIN congresista c_ponente ON c_ponente.id_congresista = dts.id_ponente_congresista 
        INNER JOIN usuario u_ponente ON u_ponente.id_usuario = c_ponente.id_usuario 
        INNER JOIN trabajo t ON t.id_trabajo = dts.id_trabajo 
        INNER JOIN asistencia a ON a.id_sesion = s.id_sesion

            WHERE a.id_congresista = ? AND s.fecha_hora>NOW()`;




  db.query(sql, [id_usuario], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
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
// Validación antes de asignar trabajo a una sesión
exports.crearSesion = async (req, res) => {
  console.log("Datos recibidos:", req.body);

  const { trabajos, sala, fecha, hora } = req.body;
  const chairmanId = trabajos[0]?.autor_id; // Extraer chairmanId del primer trabajo

  if (!trabajos || !Array.isArray(trabajos) || trabajos.length === 0) {
    console.log("Error: Lista de trabajos inválida.");
    return res.status(400).json({ error: "La lista de trabajos es requerida y debe contener al menos un trabajo." });
  }
  if (!sala || !chairmanId || !fecha || !hora) {
    console.log("Error: Campos faltantes.");
    return res.status(400).json({ error: "Todos los campos (sala, chairmanId, fecha, hora) son requeridos." });
  }
  // const { trabajos, salaId, chairmanId, fecha, hora } = req.body;

  try {
    // Verificar si algún trabajo ya está asignado a otra sesión
    for (const trabajo of trabajos) {
      const [existeTrabajo] = await db.promise().query(
        'SELECT id_trabajo FROM detalle_sesion WHERE id_trabajo = ?',
        [trabajo.id_trabajo]
      );
      if (existeTrabajo.length > 0) {
        return res.status(400).json({ error: `El trabajo ${trabajo.id_trabajo} ya está asignado a otra sesión` });
      }
    }

    // Verificar si la sala está libre en ese día y hora
    const [salaOcupada] = await db.promise().query(
      'SELECT id_sesion FROM sesion WHERE sala = ? AND DATE(fecha_hora) = ? AND TIME(fecha_hora) = ?',
      [sala, fecha, hora]
    );
    if (salaOcupada.length > 0) {
      return res.status(400).json({ error: 'La sala ya está ocupada en este horario' });
    }

    // Verificar si el chairman ya está moderando otra sesión al mismo tiempo
    const [chairmanOcupado] = await db.promise().query(
      'SELECT id_sesion FROM sesion WHERE id_moderador_congresista = ? AND DATE(fecha_hora) = ? AND TIME(fecha_hora) = ?',
      [chairmanId, fecha, hora]
    );
    if (chairmanOcupado.length > 0) {
      return res.status(400).json({ error: 'El chairman ya modera otra sesión en este horario' });
    }

    // Insertar la nueva sesión
    const fecha_hora = `${fecha} ${hora}`;
    const [sesionResult] = await db.promise().query(
      'INSERT INTO sesion (fecha_hora, sala, id_moderador_congresista) VALUES (?, ?, ?)',
      [fecha_hora, sala, chairmanId]
    );
    const idSesion = sesionResult.insertId;

    // Insertar los trabajos en detalle_sesion
    for (const trabajo of trabajos) {
      const [result] = await db.promise().query(
        'SELECT id_autor FROM detalle_trabajo_autor WHERE id_trabajo = ?',
        [trabajo.id_trabajo]
      );
      const idAutor = result.length > 0 ? result[0].id_autor : null;

      if (idAutor) {
        await db.promise().query(
          'INSERT INTO detalle_sesion (id_sesion, id_trabajo, id_ponente_congresista) VALUES (?, ?, ?)',
          [idSesion, trabajo.id_trabajo, idAutor]
        );
      } else {
        console.error(`No se encontró autor para el trabajo ${trabajo.id_trabajo}`);
      }
    }

    res.status(200).json({ mensaje: 'Sesión creada y trabajos asignados correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener lista de miembros disponibles como chairman
exports.getChairmanDisponibles = async (req, res) => {
  const { fecha, hora } = req.query;

  try {
    const [miembros] = await db.query(
      `SELECT id, nombre FROM miembros_comite 
       WHERE id NOT IN (SELECT chairman_id FROM sesiones WHERE fecha = ? AND hora = ?)`,
      [fecha, hora]
    );

    res.status(200).json(miembros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo miembros disponibles' });
  }
};
