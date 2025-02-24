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

//Iniciar sesión
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const sql =
    "SELECT id_usuario, nombre, apellido, correo, contrasena FROM usuario WHERE correo = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error en la consulta", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Obtiene el usuario encontrado en la base de datos
    const user = results[0];

    // Comparar la contraseña ingresada con la cifrada en la base de datos
    bcrypt.compare(password, user.contrasena, (err, isMatch) => {
      if (err) {
        console.error("Error al comparar contraseñas:", err);
        return res
          .status(500)
          .json({ message: "Error al verificar la contraseña" });
      }

      if (!isMatch) {
        return res.status(400).json({ message: "Contraseña incorrecta" });
      }

      res.status(200).json({
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
      });
    });
  });
};
