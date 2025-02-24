const db = require("../config/db");

// Obtener todos los autores
exports.getAutores = (req, res) => {
    const sql = `
        SELECT 
            a.id_autor,
            u.nombre,
            u.apellido,
            u.correo
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
            correo: autor.correo
        }));

        res.json(autores);
    });
};

// // Verifica si al menos uno de los co-autores es congresista
// exports.VerificarSiCoautorEsCongresista = (req, res) => {

// };

//Guarda el trabajo en la bd
exports.SubirTrabajo = (req, res) => {

};
