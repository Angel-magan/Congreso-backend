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

            WHERE a.id_congresista = ? && s.fecha_hora>CURDATE()`;




  db.query(sql, [id_usuario], (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
};
