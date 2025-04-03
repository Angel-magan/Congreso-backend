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

		const autores = result.map((autor) => ({
			id: autor.id_autor,
			nombre: `${autor.nombre} ${autor.apellido}`,
			correo: autor.correo,
			esCongresista: autor.id_congresista !== null, //  Si no es null, es congresista
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
		.then((trabajoId) => {
			return insertarAutoresTrabajo(trabajoId, autores);
		})
		.then(() => {
			return res.status(201).json({ mensaje: "Trabajo subido con éxito" }); // Agrega return aquí
		})
		.catch((error) => {
			console.error("Error al subir trabajo:", error);
			return res.status(500).json({ mensaje: "Error interno del servidor" }); // Agrega return aquí
		});
};

// Funciones auxiliares para interactuar con la base de datos
function insertarTrabajo(titulo, abstract, urlArchivo) {
	return new Promise((resolve, reject) => {
		const sql = "INSERT INTO trabajo (titulo, abstract, url, trabajoAceptado) VALUES (?, ?, ?, '2')";
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
		const promises = autores.map((autor) => {
			// Asegúrate de que autor sea un número o un objeto con un id numérico
			const autorId = typeof autor === "object" ? autor.id : autor; // Extrae el ID si es un objeto
			return new Promise((resolve, reject) => {
				const sql =
					"INSERT INTO detalle_trabajo_autor (id_trabajo, id_autor) VALUES (?, ?)";
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
			.catch((err) => reject(err));
	});
}

exports.validarCongresista = (req, res) => {
	const { idsUsuarios } = req.body;

	if (!idsUsuarios || idsUsuarios.length === 0) {
		return res
			.status(400)
			.json({ message: "No se enviaron autores para validar" });
	}

	const sql = `
        SELECT COUNT(*) AS cantidad FROM congresista WHERE id_usuario IN (?);
    `;

	db.query(sql, [idsUsuarios], (err, result) => {
		if (err) {
			return res
				.status(500)
				.json({ message: "Error al validar congresistas", error: err.message });
		}

		const esValido = result[0].cantidad > 0; // Si hay al menos un congresista, es válido
		res.json({ esValido });
	});
};

// Buscar el trabajo para la HU Crear Sesión
exports.buscarTrabajoPorTitulo = (req, res) => {
	const { titulo } = req.query;

	if (!titulo) {
		return res
			.status(400)
			.json({ message: "El título es requerido para la búsqueda" });
	}

	const query = "SELECT * FROM trabajo WHERE titulo LIKE ?";
	db.query(query, [`%${titulo}%`], (err, results) => {
		if (err) {
			console.error("Error al buscar trabajos:", err);
			return res.status(500).json({ message: "Error interno del servidor" });
		}
		res.json(results);
	});
};

exports.getAutoresPorTrabajo = (req, res) => {
	const { id_trabajo } = req.params;

	const query = `
        SELECT 
            a.id_autor,
            u.nombre,
            u.apellido
        FROM 
            detalle_trabajo_autor dta
        JOIN
            autor a ON a.id_autor = dta.id_autor
        JOIN 
            usuario u ON a.id_usuario = u.id_usuario
            WHERE dta.id_trabajo = ? AND a.id_congresista IS NOT NULL;
    `;

	db.query(query, [id_trabajo], (err, results) => {
		if (err) {
			console.error("Error al obtener autores congresistas:", err);
			return res.status(500).json({ error: "Error en el servidor" });
		}
		res.json(results);
	});
};

//Obtiene todos los trabajos
exports.getTrabajos = (req, res) => {
	const sql = `
        SELECT 
            id_trabajo,
            titulo,
            CONVERT(abstract USING utf8) AS abstract,
            url, 
            trabajoAceptado
        FROM 
            trabajo
    `;

	db.query(sql, (err, result) => {
		if (err) {
			return res.status(500).send(err);
		}

		const trabajos = result.map((trabajo) => ({
			id: trabajo.id_trabajo,
			titulo: trabajo.titulo,
			abstract: trabajo.abstract,
			url: trabajo.url,
			trabajoAceptado: trabajo.trabajoAceptado
		}));

		res.json(trabajos);
	});
};


//Obtiene un trabajo por el id
exports.getTrabajo = (req, res) => {
	const id = req.params.id;
	const sql = `
        SELECT 
            id_trabajo,
            titulo,
            CONVERT(abstract USING utf8) AS abstract,
            CONVERT(url USING utf8) AS url, 
            trabajoAceptado
        FROM 
            trabajo
        WHERE id_trabajo = ?
    `;

	db.query(sql, [id], (err, result) => {
		if (err) {
			return res.status(500).send(err);
		}

		if (result.length === 0) {
			return res.status(404).send("Trabajo no encontrado");
		}


		const trabajo = {
			id: result[0].id_trabajo,
			titulo: result[0].titulo,
			abstract: result[0].abstract,
			url: result[0].url,
			trabajoAceptado: result[0].trabajoAceptado
		};

		res.json(trabajo);
	});
};

exports.updateTrabajo = (req, res) => {
	const id = req.params.id;
	const trabajoAceptado = req.params.trabajoAceptado;

	console.log("Id: " + { id } + "y valor de trabajoAceptado:" + { trabajoAceptado })

	const sql = `
        UPDATE trabajo
        SET trabajoAceptado = ?
        WHERE id_trabajo = ?
    `;

	db.query(sql, [trabajoAceptado, id], (err, result) => {
		if (err) {
			return res.status(500).send(err);
		}

		res.json({ message: "Trabajo actualizado correctamente." });
	});
};

//Obtiene un trabajo por el id
exports.getTrabajosReporte = (req, res) => {
	const query = `
	SELECT t.titulo,CONVERT(t.abstract USING utf8) AS resumen, GROUP_CONCAT(u.nombre, ' ', u.apellido) AS autores
	FROM trabajo t
	JOIN detalle_trabajo_autor dta ON t.id_trabajo = dta.id_trabajo
	JOIN autor a ON dta.id_autor = a.id_autor
	JOIN usuario u ON a.id_usuario = u.id_usuario
	GROUP BY t.id_trabajo;
`;
	db.query(query, (err, results) => {
		if (err) {
			console.error(err);
			res.status(500).send("Error fetching trabajos");
		} else {
			res.json(results);
		}
	});
};

exports.getTrabajosNoAceptados = (req, res) => {
	const query = `
        SELECT 
            t.titulo,
            t.abstract AS resumen,
            GROUP_CONCAT(u.nombre, ' ', u.apellido) AS autores
        FROM trabajo t
        JOIN detalle_trabajo_autor dta ON t.id_trabajo = dta.id_trabajo
        JOIN autor a ON dta.id_autor = a.id_autor
        JOIN usuario u ON a.id_usuario = u.id_usuario
        WHERE t.trabajoAceptado = '0' or t.trabajoAceptado = null
        GROUP BY t.id_trabajo;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching trabajos no aceptados");
        } else {
            res.json(results);
        }
    });

};

// Obtiene los trabajos de un autor
exports.getTrabajosPorAutor = (req, res) => {
    const { id_autor } = req.params;

    const sql = `
        SELECT 
            t.id_trabajo,
            t.titulo,
            t.abstract,
            t.url,
            t.trabajoAceptado
        FROM 
            trabajo t
        JOIN 
            detalle_trabajo_autor dta ON t.id_trabajo = dta.id_trabajo
        WHERE 
            dta.id_autor = ?
    `;

    db.query(sql, [id_autor], (err, result) => {
        if (err) {
            console.error("Error al obtener los trabajos:", err);
            return res.status(500).json({ error: "Error en el servidor" });
        }

        const trabajos = result.map((trabajo) => ({
            id: trabajo.id_trabajo,
            titulo: trabajo.titulo,
            abstract: trabajo.abstract,
            url: trabajo.url,
            trabajoAceptado: trabajo.trabajoAceptado
        }));

        res.json(trabajos);
    });
};



