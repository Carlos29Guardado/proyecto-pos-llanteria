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

app.get('/', (req, res) => res.send('API funcionando'));

app.listen(PORT, ()=>{
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  
})