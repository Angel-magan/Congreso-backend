const db = require("../config/db");
const { sendSms } = require('../sms');

exports.registrarCongresista = (req, res) => {
    const { nombre, apellido, correo, institucion, telefono, notificacion } = req.body;

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
                        return res
                            .status(500)
                            .json({
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

                    db.query(getTelefonoNotificacionSql, [id_usuario], (err, telefonoNotificacionResults) => {
                        if (err) {
                            console.error("Error al obtener teléfono y notificación:", err);
                            return res.status(500).json({ message: "Error al obtener teléfono y notificación", error: err });
                        }

                        if (telefonoNotificacionResults.length > 0) {
                            const { telefono: telefonoDB, notificacion: notificacionDB } = telefonoNotificacionResults[0];

                            console.log("Teléfono desde la base de datos:", telefonoDB);
                            console.log("Notificación desde la base de datos:", notificacionDB);

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
                                return res
                                    .status(500)
                                    .json({
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
                                    return res
                                        .status(500)
                                        .json({
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
                    });
                }
            );
        });
    });
};

function formatPhoneNumber(phoneNumber) {
    // Eliminar guiones y espacios
    const cleanedNumber = phoneNumber.replace(/[-\s]/g, '');

    // Agregar el código de país
    return `+503${cleanedNumber}`;
}

exports.getCongresistas = (req, res) => {
    const query = `
        SELECT c.id_congresista, u.nombre, u.apellido, c.institucion, c.telefono
        FROM congresista c
        JOIN usuario u ON c.id_usuario = u.id_usuario;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching congresistas");
        } else {
            res.json(results);
        }
    });
};