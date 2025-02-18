const db = require("../config/db");

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

    const addUserSql =
      "INSERT INTO usuario(nombre, apellido, correo, contrasena) VALUES(?, ?, ?, ?)";

    db.query(addUserSql, [name, lastName, email, password], (err, result) => {
      if (err) {
        console.error("Error SQL:", err); // Añadir para depurar
        return res
          .status(500)
          .json({ message: "Error al registrar el usuario", error: err });
      }
      res.status(201).json({ message: "Usuario registrado correctamente" });
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
    "SELECT id_usuario, nombre, correo FROM usuario WHERE correo = ? AND contrasena = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error en la consulta", error: err });
    }

    if (results.length > 0) {
      const user = results[0]; // Devuelve el primer resultado de la consulta
      res.status(200).json({
        id: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
      });
    } else {
      res.status(401).json({ message: "Credenciales inválidas" });
    }
  });
};
