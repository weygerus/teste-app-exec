const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')

const axios = require('axios');
const { getuserId  } = require('./controllers/authController');

const app = express();
const PORT = 7890;

require('dotenv').config();

mongoose.connect
("mongodb+srv://gabrileao38:Gaga2001Gaga@cluster0.d0dpg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => {
  
  console.log('Conectado ao MongoDB!')   
})
.catch((err) => {
  
  console.log("Erro de conexão com o banco de dados: " + err)
})

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const instaAuthRoutes = require('./routes/instaAuthRoutes');
app.use('/api/instaAuth', instaAuthRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const actionRoutes = require('./routes/actionRoutes');
app.use('/api/action', actionRoutes);

app.get('/', async (req, res) => {

  console.log("OK")
  return res.status(200).json({

    message: "OK"
  })
});

function startLocalAPI() {
    
    app.listen(PORT, () => {
    
      console.log(`Servidor rodando na porta ${PORT}`);
    });
}

module.exports = { startLocalAPI }