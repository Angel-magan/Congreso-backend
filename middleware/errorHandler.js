// Middleware de manejo de errores
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Ha ocurrido un error", error: err.message });
};
