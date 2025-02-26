const db = require("../config/db");

// Obtener todos los autores
exports.getAutores = (req, res) => {
    const sql = `
        SELECT 
            a.id_autor,
            u.nombre,
            u.apellido,
            u.correo,
            a.id_congresista
        FROM 
            autor a
        JOIN 
            usuario u ON a.id_usuario = u.id_usuario
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }


        const autores = result.map(autor => ({
            id: autor.id_autor,
            nombre: `${autor.nombre} ${autor.apellido}`,
            correo: autor.correo,
            esCongresista: autor.id_congresista !== null //  Si no es null, es congresista
        }));

        res.json(autores);
    });
};


// Verifica si al menos uno de los co-autores es congresista
// exports.verificarCoautorEsCongresista = (req, res) => {

// };


// Guarda el trabajo en la bd
exports.SubirTrabajo = (req, res) => {
    const { titulo, abstract, autores, urlArchivo } = req.body;

    if (!titulo || !abstract || !autores || !urlArchivo) {
        return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    insertarTrabajo(titulo, abstract, urlArchivo)
        .then(trabajoId => {
            return insertarAutoresTrabajo(trabajoId, autores);
        })
        .then(() => {
            return res.status(201).json({ mensaje: "Trabajo subido con éxito" }); // Agrega return aquí
        })
        .catch(error => {
            console.error("Error al subir trabajo:", error);
            return res.status(500).json({ mensaje: "Error interno del servidor" }); // Agrega return aquí
        });
};

// Funciones auxiliares para interactuar con la base de datos
function insertarTrabajo(titulo, abstract, urlArchivo) {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO trabajo (titulo, abstract, url) VALUES (?, ?, ?)';
        db.query(sql, [titulo, abstract, urlArchivo], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
}

function insertarAutoresTrabajo(trabajoId, autores) {
    return new Promise((resolve, reject) => {
        const promises = autores.map(autor => {
            // Asegúrate de que autor sea un número o un objeto con un id numérico
            const autorId = typeof autor === 'object' ? autor.id : autor; // Extrae el ID si es un objeto
            return new Promise((resolve, reject) => {
                const sql = 'INSERT INTO detalle_trabajo_autor (id_trabajo, id_autor) VALUES (?, ?)';
                db.query(sql, [trabajoId, autorId], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        });

        Promise.all(promises)
            .then(() => resolve())
            .catch(err => reject(err));
    });
}



exports.validarCongresista = (req, res) => {
    const { idsUsuarios } = req.body;

    if (!idsUsuarios || idsUsuarios.length === 0) {
        return res.status(400).json({ message: "No se enviaron autores para validar" });
    }

    const sql = `
        SELECT COUNT(*) AS cantidad FROM congresista WHERE id_usuario IN (?);
    `;

    db.query(sql, [idsUsuarios], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error al validar congresistas", error: err.message });
        }

        const esValido = result[0].cantidad > 0; // Si hay al menos un congresista, es válido
        res.json({ esValido });
    });
};

