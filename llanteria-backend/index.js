require('dotenv').config();

const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

//Sin estas variables la API no puede funcionar de forma segura
for (const variable of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[variable]) {
    console.error(`Falta la variable de entorno ${variable}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

//Conectar la base de datos
conectarDB();

//Si CORS_ORIGIN está definido, solo esos dominios pueden consumir la API
const origenesPermitidos = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origen => origen.trim())
  : true;

app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());

app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/clientes', require('./routes/clientesRoutes'));
app.use('/api/ventas', require('./routes/ventasRoutes'));

app.get('/', (req, res) => res.send('API funcionando'));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
