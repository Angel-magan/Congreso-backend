const db = require("../config/db");
const bcrypt = require("bcryptjs");

//Ver usuarios
exports.infoUser = (req, res) => {
  const sql = "SELECT * FROM usuario";
  //Ejecutar la consulta y manejar las respuestas con err, result
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result); //Enviar al front en formato json
  });
};

//Registrar un usuario
exports.registerUser = (req, res) => {
  const { name, lastName, email, password } = req.body;

  if (!name || !lastName || !email || !password) {
    return res.status(400).json({ message: "Faltan datos por ingresar" });
  }

  //Verificar si el correo ya existe
  const checkEmailSql = "SELECT correo FROM usuario WHERE correo = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      console.error("Error al verificar email:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Validar que tenga 8 carac, 1 numero y una mayuscula
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula y un número.",
      });
    }

    // Encriptar la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error al encriptar la contraseña:", err);
        return res.status(500).json({
          message: "Error al registrar el usuario.",
          error: err,
        });
      }

      const addUserSql =
        "INSERT INTO usuario(nombre, apellido, correo, contrasena) VALUES(?, ?, ?, ?)";

      db.query(
        addUserSql,
        [name, lastName, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error SQL:", err); // Añadir para depurar
            return res
              .status(500)
              .json({ message: "Error al registrar el usuario", error: err });
          }
          res.status(201).json({ message: "Usuario registrado correctamente" });
        }
      );
    });
  });
};

//Registrar un usuario
exports.registerUser = (req, res) => {
  const { name, lastName, email, password } = req.body;

  if (!name || !lastName || !email || !password) {
    return res.status(400).json({ message: "Faltan datos por ingresar" });
  }

  //Verificar si el correo ya existe
  const checkEmailSql = "SELECT correo FROM usuario WHERE correo = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      console.error("Error al verificar email:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Validar que tenga 8 carac, 1 numero y una mayuscula
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula y un número.",
      });
    }

    // Encriptar la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error al encriptar la contraseña:", err);
        return res.status(500).json({
          message: "Error al registrar el usuario.",
          error: err,
        });
      }

      const addUserSql =
        "INSERT INTO usuario(nombre, apellido, correo, contrasena) VALUES(?, ?, ?, ?)";

      db.query(
        addUserSql,
        [name, lastName, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error SQL:", err); // Añadir para depurar
            return res
              .status(500)
              .json({ message: "Error al registrar el usuario", error: err });
          }
          res.status(201).json({ message: "Usuario registrado correctamente" });
        }
      );
    });
  });
};

//Iniciar sesión
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  // Buscar al usuario en la tabla "usuario" usando el correo
  const sqlUsuario = "SELECT * FROM usuario WHERE correo = ?";
  db.query(sqlUsuario, [email], (err, usuarioResults) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error en la consulta", error: err });
    }
    if (usuarioResults.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const usuario = usuarioResults[0];

    // Comparar la contraseña ingresada con la almacenada (cifrada)
    bcrypt.compare(password, usuario.contrasena, (err, isMatch) => {
      if (err) {
        console.error("Error al comparar contraseñas:", err);
        return res
          .status(500)
          .json({ message: "Error al verificar la contraseña" });
      }

      if (!isMatch) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      // Por defecto, asumimos rol "Usuario"
      let roles = [];

      // Primero, verificamos si es congresista
      const sqlCongresista = "SELECT * FROM congresista WHERE id_usuario = ?";
      db.query(
        sqlCongresista,
        [usuario.id_usuario],
        (err, congresistaResults) => {
          if (err) {
            return res.status(500).json({
              message: "Error al verificar rol congresista",
              error: err,
            });
          }

          if (congresistaResults.length > 0) {
            roles.push("Congresista");

            // Consulta para ver si es miembro del comité (INSERTADA AQUÍ)
            const sqlComite = `
              SELECT miembro_comite 
              FROM congresista 
              WHERE id_usuario = ?
            `;
            db.query(sqlComite, [usuario.id_usuario], (err, comiteResults) => {
              if (err) {
                return res.status(500).json({
                  message: "Error al verificar si es miembro del comité",
                  error: err,
                });
              }

              if (comiteResults.length > 0) {
                const esMiembro = comiteResults[0].miembro_comite;
                // Lógica de verificación (AJUSTAR SEGÚN TU CAMPO miembro_comite)
                console.log(esMiembro);
                if (esMiembro === '1') {
                  roles.push("miembro_comite");
                }
              }

              // Continuar con la consulta de autor
              const sqlAutor = "SELECT * FROM autor WHERE id_usuario = ?";
              db.query(
                sqlAutor,
                [usuario.id_usuario],
                (err, autorResults) => {
                  if (err) {
                    return res.status(500).json({
                      message: "Error al verificar rol autor",
                      error: err,
                    });
                  }

                  if (autorResults.length > 0) {
                    roles.push("Autor");
                  }
                  if (roles.length === 0) {
                    roles.push("Usuario");
                  }

                  return res.status(200).json({
                    id: usuario.id_usuario,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    correo: usuario.correo,
                    roles: roles,
                  });
                }
              );
            });
          } else {
            // Si no es congresista, continuar con la consulta de autor
            const sqlAutor = "SELECT * FROM autor WHERE id_usuario = ?";
            db.query(
              sqlAutor,
              [usuario.id_usuario],
              (err, autorResults) => {
                if (err) {
                  return res.status(500).json({
                    message: "Error al verificar rol autor",
                    error: err,
                  });
                }

                if (autorResults.length > 0) {
                  roles.push("Autor");
                }
                if (roles.length === 0) {
                  roles.push("Usuario");
                }

                return res.status(200).json({
                  id: usuario.id_usuario,
                  nombre: usuario.nombre,
                  apellido: usuario.apellido,
                  correo: usuario.correo,
                  roles: roles,
                });
              }
            );
          }
        }
      );
    });
  });
};

exports.homeUserInfo = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM usuario WHERE id_usuario = ?";
  
  db.query(sql, [id], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Error en la consulta", error: err });
    if (results.length === 0)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const usuario = results[0];
    let roles = [];

    // Consulta para ver si el usuario es congresista
    const sqlCongresista = "SELECT * FROM congresista WHERE id_usuario = ?";
    db.query(sqlCongresista, [id], (err, congresistaResults) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al consultar rol congresista", error: err });

      if (congresistaResults.length > 0) {
        roles.push("Congresista");

        // Verificar si el usuario es miembro del comité
        const sqlComite = "SELECT miembro_comite FROM congresista WHERE id_usuario = ?";
        db.query(sqlComite, [id], (err, comiteResults) => {
          if (err)
            return res.status(500).json({
              message: "Error al verificar si es miembro del comité",
              error: err,
            });

          if (comiteResults.length > 0) {
            const esMiembro = comiteResults[0].miembro_comite;

            // Validar si el usuario es miembro del comité
            if (esMiembro === '1') {
              roles.push("miembro_comite");
            }
          }

          // Consulta para ver si el usuario es autor
          const sqlAutor = "SELECT * FROM autor WHERE id_usuario = ?";
          db.query(sqlAutor, [id], (err, autorResults) => {
            if (err)
              return res
                .status(500)
                .json({ message: "Error al consultar rol autor", error: err });

            if (autorResults.length > 0) {
              roles.push("Autor");
            }

            // Si no se encontró ningún rol, asigna "Usuario" (opcional)
            if (roles.length === 0) {
              roles.push("Usuario");
            }

            // Agregar la propiedad roles al objeto usuario
            const updatedUser = {
              ...usuario,
              roles: roles,
            };

            return res.status(200).json(updatedUser);
          });
        });
      } else {
        // Si no es congresista, continuar con la consulta de autor
        const sqlAutor = "SELECT * FROM autor WHERE id_usuario = ?";
        db.query(sqlAutor, [id], (err, autorResults) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Error al consultar rol autor", error: err });

          if (autorResults.length > 0) {
            roles.push("Autor");
          }

          // Si no se encontró ningún rol, asigna "Usuario" (opcional)
          if (roles.length === 0) {
            roles.push("Usuario");
          }

          // Agregar la propiedad roles al objeto usuario
          const updatedUser = {
            ...usuario,
            roles: roles,
          };

          return res.status(200).json(updatedUser);
        });
      }
    });
  });
};


//Registrar un usuario y su autor
exports.registerUserAndAuthor = (req, res) => {
  const { name, lastName, email } = req.body;

  if (!name || !lastName || !email) {
    return res.status(400).json({ message: "Faltan datos por ingresar" });
  }

  // Verificar si el correo ya existe
  const checkEmailSql = "SELECT correo FROM usuario WHERE correo = ?";
  db.query(checkEmailSql, [email], (err, results) => {
    if (err) {
      console.error("Error al verificar email:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Procedimiento almacenado para insertar tanto el usuario como el autor (sin contraseña)
    const sql = "CALL RegistrarUsuarioYAutor(?, ?, ?)";
    db.query(
      sql,
      [name, lastName, email], // Solo pasamos nombre, apellido y correo
      (err, result) => {
        if (err) {
          console.error("Error al ejecutar el procedimiento almacenado:", err);
          return res.status(500).json({
            message: "Error al registrar el usuario y autor",
            error: err,
          });
        }

        // Si el procedimiento almacenado tiene éxito
        res.status(201).json({ message: "Usuario y autor registrados correctamente" });
      }
    );
  });
};

