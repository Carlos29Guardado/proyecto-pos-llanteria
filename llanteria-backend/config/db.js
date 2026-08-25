const mongoose = require('mongoose');

const conectarDB = async () =>{
    try {
        const MONGO_URI = process.env.MONGO_URI;
        await mongoose.connect(MONGO_URI);
        console.log('Conectado correctamente a MongoDB');
        
    } catch (error) {
        console.error('Error al conectar la base de datos', error);
        process.exit(1);
    }
}
module.exports = conectarDB;