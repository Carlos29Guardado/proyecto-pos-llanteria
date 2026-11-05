//Traduce los errores de Mongoose a códigos HTTP adecuados
exports.manejarError = (res, error, mensaje) => {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({ mensaje: 'Datos inválidos', detalle: error.message });
    }
    if (error.code === 11000) {
        const campo = Object.keys(error.keyValue || {})[0] || 'campo';
        return res.status(409).json({ mensaje: `Ya existe un registro con ese ${campo}` });
    }
    console.error(mensaje, error);
    return res.status(500).json({ mensaje });
};

//Devuelve solo los campos permitidos del body para evitar asignación masiva
exports.filtrarCampos = (body, campos) => {
    const resultado = {};
    for (const campo of campos) {
        if (body[campo] !== undefined) {
            resultado[campo] = body[campo];
        }
    }
    return resultado;
};
