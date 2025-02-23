const db = require("../config/db");

// Obtener datos de un usuario por ID
exports.getUsuarioById = (req, res) => {
    const userId = req.params.id;

    // Consulta para obtener los datos del usuario y, si es congresista, el id_congresista
    const sql = `
        SELECT u.nombre, u.apellido, u.correo, c.id_congresista
        FROM usuario u
        LEFT JOIN congresista c ON u.id_usuario = c.id_usuario
        WHERE u.id_usuario = ?`;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error al obtener usuario", error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Devolver los datos, incluyendo id_congresista si existe
        const usuario = result[0];
        const response = {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            idCongresista: usuario.id_congresista || null, // Si no tiene id_congresista, lo dejamos como null
        };

        res.json(response);
    });
};


// Registrar autor
exports.registrarAutor = (req, res) => {
    console.log("Datos recibidos en el backend:", req.body); // <-- Esto mostrará los datos recibidos

    const { id_usuario, id_congresista } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ message: "Error: id_usuario es requerido" });
    }

    const sql = "INSERT INTO autor (id_usuario, id_congresista) VALUES (?, ?)";
    db.query(sql, [id_usuario, id_congresista || null], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error al registrar autor", error: err.message });
        }
        res.json({ success: true, message: "Autor registrado correctamente" });
    });
};




