const jwt = require('jsonwebtoken');

//Verifica que la petición traiga un JWT válido en el header Authorization
exports.verificarToken = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [tipo, token] = header.split(' ');

    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ mensaje: 'Acceso denegado, se requiere iniciar sesión' });
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
    }
};

//Solo deja pasar a los usuarios con rol ADMIN (usar después de verificarToken)
exports.soloAdmin = (req, res, next) => {
    if (req.usuario?.rol !== 'ADMIN') {
        return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' });
    }
    next();
};
