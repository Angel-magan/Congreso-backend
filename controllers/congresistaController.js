const db = require("../config/db");
const { sendSms } = require("../sms");

exports.registrarCongresista = (req, res) => {
  const { nombre, apellido, correo, institucion, telefono, notificacion } =
    req.body;

  if (!institucion) {
    return res
      .status(400)
      .json({ message: "La institución es de carácter obligatorio" });
  }

  // Buscar el usuario por nombre, apellido y correo
  const getUserSql =
    "SELECT * FROM usuario WHERE nombre = ? AND apellido = ? AND correo = ?";
  db.query(getUserSql, [nombre, apellido, correo], (err, results) => {
    if (err) {
      console.error("Error al buscar usuario:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "No se encontró un usuario con esos datos" });
    }

    const usuario = results[0];
    const id_usuario = usuario.id_usuario;
    console.log("Usuario encontrado:", usuario);

    // Verificar que el usuario NO esté ya registrado como congresista
    const checkCongresistaSql =
      "SELECT id_usuario FROM congresista WHERE id_usuario = ?";
    db.query(checkCongresistaSql, [id_usuario], (err, congresistaResults) => {
      if (err) {
        console.error("Error al verificar congresista:", err);
        return res.status(500).json({ message: "Error en el servidor" });
      }

      if (congresistaResults.length > 0) {
        return res
          .status(400)
          .json({ message: "El usuario ya está registrado como congresista" });
      }

      // Insertar nuevo congresista
      const addCongresistaSql = `
                INSERT INTO congresista (id_usuario, institucion, telefono, notificacion, miembro_comite)
                VALUES (?, ?, ?, ?, '0')
            `;

      db.query(
        addCongresistaSql,
        [id_usuario, institucion, telefono || null, notificacion ? "1" : "0"],
        (err, result) => {
          if (err) {
            console.error("Error al registrar congresista:", err);
            return res.status(500).json({
              message: "Error al registrar el congresista",
              error: err,
            });
          }

          console.log("Congresista registrado, resultado:", result);

          // Consulta para obtener teléfono y notificación
          const getTelefonoNotificacionSql = `
                        SELECT telefono, notificacion
                        FROM congresista
                        WHERE id_usuario = ?;
                    `;

          db.query(
            getTelefonoNotificacionSql,
            [id_usuario],
            (err, telefonoNotificacionResults) => {
              if (err) {
                console.error("Error al obtener teléfono y notificación:", err);
                return res.status(500).json({
                  message: "Error al obtener teléfono y notificación",
                  error: err,
                });
              }

              if (telefonoNotificacionResults.length > 0) {
                const { telefono: telefonoDB, notificacion: notificacionDB } =
                  telefonoNotificacionResults[0];

                console.log("Teléfono desde la base de datos:", telefonoDB);
                console.log(
                  "Notificación desde la base de datos:",
                  notificacionDB
                );

                if (telefonoDB !== null && notificacionDB === "1") {
                  const formattedPhoneNumber = formatPhoneNumber(telefonoDB);
                  console.log("Número formateado:", formattedPhoneNumber);
                  console.log("Nombre completo:", `${nombre} ${apellido}`);
                  sendSms(formattedPhoneNumber, `${nombre} ${apellido}`);
                }
              }

              // Ahora obtener roles:
              let roles = [];
              // Consulta para congresista
              const sqlCongresista =
                "SELECT * FROM congresista WHERE id_usuario = ?";
              db.query(sqlCongresista, [id_usuario], (err, congresistaRes) => {
                if (err) {
                  console.error("Error al consultar rol congresista:", err);
                  return res.status(500).json({
                    message: "Error al consultar rol congresista",
                    error: err,
                  });
                }
                console.log("Resultado de congresista:", congresistaRes);
                if (congresistaRes.length > 0) {
                  roles.push("Congresista");
                }
                // Consulta para autor
                const sqlAutor = "SELECT * FROM autor WHERE id_usuario = ?";
                db.query(sqlAutor, [id_usuario], (err, autorRes) => {
                  if (err) {
                    console.error("Error al consultar rol autor:", err);
                    return res.status(500).json({
                      message: "Error al consultar rol autor",
                      error: err,
                    });
                  }
                  console.log("Resultado de autor:", autorRes);
                  if (autorRes.length > 0) {
                    roles.push("Autor");
                  }
                  // Si no se encontró ningún rol, asigna "Usuario"
                  if (roles.length === 0) {
                    roles.push("Usuario");
                  }
                  // Armar el objeto actualizado
                  const updatedUser = {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    correo: usuario.correo,
                    roles: roles,
                  };
                  console.log("Usuario actualizado:", updatedUser);
                  return res.status(201).json(updatedUser); // Parentesis agregado aquí
                });
              });
            }
          );
        }
      );
    });
  });
};

//Para los gráficos***********************************************************************************************
exports.obtenerCongresistasPorInstitucion = (req, res) => {
  // const sql =
  //   "SELECT institucion, COUNT(*) AS cantidad FROM congresista GROUP BY institucion";
  const sql =
    "SELECT institucion, COUNT(*) AS cantidad FROM congresista GROUP BY institucion ORDER BY cantidad DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener congresistas por institución:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener datos", error: err });
    }

    //Objetos con la institución y la cantidad de congresistas por cada una
    res.status(200).json(results);
  });
};

// Para los graficos de relacion de congresistas
exports.obtenerRelacionesCongresistas = (req, res) => {
  const sql = `
          SELECT DISTINCT
          c1.id_congresista AS source,
          c2.id_congresista AS target,
          u1.nombre AS source_name,
          u2.nombre AS target_name,
          'Trabajo en común' AS relation
      FROM detalle_trabajo_autor dta1
      JOIN autor a1 ON dta1.id_autor = a1.id_autor
      JOIN congresista c1 ON a1.id_congresista = c1.id_congresista
      JOIN usuario u1 ON c1.id_usuario = u1.id_usuario
      JOIN detalle_trabajo_autor dta2 ON dta1.id_trabajo = dta2.id_trabajo
      JOIN autor a2 ON dta2.id_autor = a2.id_autor
      JOIN congresista c2 ON a2.id_congresista = c2.id_congresista
      JOIN usuario u2 ON c2.id_usuario = u2.id_usuario
      WHERE c1.id_congresista <> c2.id_congresista

      UNION

      SELECT DISTINCT
          a1.id_congresista AS source,
          a2.id_congresista AS target,
          u1.nombre AS source_name,
          u2.nombre AS target_name,
          'Misma sesión' AS relation
      FROM asistencia asis1
      JOIN congresista a1 ON asis1.id_congresista = a1.id_congresista
      JOIN usuario u1 ON a1.id_usuario = u1.id_usuario
      JOIN asistencia asis2 ON asis1.id_sesion = asis2.id_sesion
      JOIN congresista a2 ON asis2.id_congresista = a2.id_congresista
      JOIN usuario u2 ON a2.id_usuario = u2.id_usuario
      WHERE a1.id_congresista <> a2.id_congresista;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener las relaciones:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener datos", error: err });
    }

    res.status(200).json(results);
  });
};

//Evolución de las inscripciones
exports.obtenerEvolucionInscripciones = (req, res) => {
  const sql = `
    SELECT 
        DATE(fecha_registro) AS fecha,
        COUNT(*) AS cantidad
    FROM congresista
    GROUP BY DATE(fecha_registro)
    ORDER BY fecha ASC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener la evolución de inscripciones:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener datos", error: err });
    }

    res.status(200).json(results);
  });
};

//Grafico para ver cuantos congresistas quieren MSM
exports.obtenerNotificaciones = (req, res) => {
  const sql = `
    SELECT 
      CASE 
        WHEN notificacion = 'S' THEN 'Sí Notificaciones'
        WHEN notificacion = 'N' THEN 'No Notificaciones'
      END AS estado,
      COUNT(*) AS cantidad
    FROM congresista
    WHERE notificacion IN ('S', 'N')
    GROUP BY notificacion;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener los datos de notificaciones:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener datos", error: err });
    }

    res.status(200).json(results);
  });
};

//Grafica cantidad de trabajos por congresista
exports.obtenerCongresistasConTrabajos = (req, res) => {
  const sql = `
    SELECT c.id_congresista, u.nombre, COUNT(t.id_trabajo) AS cantidad_trabajos
      FROM congresista c
      JOIN usuario u ON c.id_usuario = u.id_usuario
      JOIN trabajo t ON c.id_congresista = t.id_congresista
      GROUP BY c.id_congresista
      ORDER BY cantidad_trabajos DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(
        "Error al obtener datos de congresistas con trabajos:",
        err
      );
      return res
        .status(500)
        .json({ message: "Error al obtener datos", error: err });
    }

    res.status(200).json(results);
  });
};

//a***************************************************************************************************************

function formatPhoneNumber(phoneNumber) {
  // Eliminar guiones y espacios
  const cleanedNumber = phoneNumber.replace(/[-\s]/g, "");

  // Agregar el código de país
  return `+503${cleanedNumber}`;
}
