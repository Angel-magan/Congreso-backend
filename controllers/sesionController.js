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

// Validación antes de asignar trabajo a una sesión
exports.crearSesion = async (req, res) => {
  const { trabajoId, sesionId, salaId, chairmanId, fecha, hora } = req.body;

  try {
    // Verificar si el trabajo ya está asignado a otra sesión
    const [existeTrabajo] = await db.query(
      'SELECT id_trabajo FROM detalle_sesion WHERE id_trabajo = ?',
      [trabajoId]
    );

    if (existeTrabajo.length > 0) {
      return res.status(400).json({ error: 'Este trabajo ya está asignado a otra sesión' });
    }

    // Verificar si la sala está libre en ese día y hora
    const [salaOcupada] = await db.query(
      'SELECT id_sesion FROM sesion WHERE sala = ? AND DATE(fecha_hora) = ? AND TIME(fecha_hora) = ?',
      [salaId, fecha, hora]
    );

    if (salaOcupada.length > 0) {
      return res.status(400).json({ error: 'La sala ya está ocupada en este horario' });
    }

    // Verificar si el chairman ya está moderando otra sesión al mismo tiempo
    const [chairmanOcupado] = await db.query(
      'SELECT id_sesion FROM sesion WHERE id_moderador_congresista = ? AND DATE(fecha_hora) = ? AND TIME(fecha_hora) = ?',
      [chairmanId, fecha, hora]
    );

    if (chairmanOcupado.length > 0) {
      return res.status(400).json({ error: 'El chairman ya modera otra sesión en este horario' });
    }

    // Si todo está bien, insertar la asignación
    // Insertar en sesion
    const [sesionResult] = await db.query(
      'INSERT INTO sesion (fecha_hora, sala, id_moderador_congresista) VALUES (?, ?, ?)',
      [fecha_hora, sala, id_moderador_congresista]
    );

    const idSesion = sesionResult.insertId; // Obtener el ID de la sesión recién creada

    // Insertar los trabajos en detalle_sesion
    for (const trabajo of trabajos) {
      // Obtener el id_autor desde detalle_trabajo_autor
      const [result] = await db.query(
        'SELECT id_autor FROM detalle_trabajo_autor WHERE id_trabajo = ?',
        [trabajo.id_trabajo]
      );

      const idAutor = result.length > 0 ? result[0].id_autor : null;

      if (idAutor) {
        await db.query(
          'INSERT INTO detalle_sesion (id_sesion, id_trabajo, id_ponente_congresista) VALUES (?, ?, ?)',
          [idSesion, trabajo.id_trabajo, idAutor]
        );
      } else {
        console.error(`No se encontró autor para el trabajo ${trabajo.id_trabajo}`);
      }

      res.status(200).json({ mensaje: 'Sesión creada y trabajos asignados correctamente' });
    }
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