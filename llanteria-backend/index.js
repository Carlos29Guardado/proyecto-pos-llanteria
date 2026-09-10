require('dotenv').config();

const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

const app =  express();
const PORT = process.env.PORT;

//Conectar la base de datos
conectarDB();

app.use(cors());
app.use(express.json());

app.use('/api/productos', require('./routes/productosRoutes'));
app.use('/api/usuarios', require('./routes/usuariosRoutes'));
app.use('/api/clientes', require('./routes/clientesRoutes'));
app.use('/api/ventas', require('./routes/ventasRoutes'));

app.get('/', (req, res) => res.send('API funcionando'));

app.listen(PORT, ()=>{
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  
})