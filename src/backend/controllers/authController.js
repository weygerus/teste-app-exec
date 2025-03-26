const mongoose = require('mongoose');
const ngrok = require('ngrok');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = '12345'
const axios = require('axios');

const { IgApiClient } = require('instagram-private-api');
require('dotenv').config();

require('../models/usuario')
const User = mongoose.model('User')

let sessionUserId = "";
const startNgrok = async () => {
  try {
    const url = await ngrok.connect(7890);
    console.log(`ngrok túnel aberto em: ${url}`);
    return url;
  } catch (err) {
    console.error('Erro ao iniciar o ngrok:', err);
    return undefined;
  }
}


async function sendConnectionUrlToWebApi(connectionURL, userID, data) {

  try {

    const response = await axios.post('https://gerenc-insta-deld.onrender.com/api/connection/sendConnectionUrl', {
      connectionUrl: connectionURL, userId: userID
    });

    if (response.status == 200) {

      const message = 'Conexão bem-sucedida ao APP';
      return message;
    }
    else {

      const message = 'Erro ao se conectar ao APP';
      return message;
    }


  } catch (error) {

    console.error('Erro ao enviar a url de conexão:', error);
    return res.status(400).json({ message: 'Erro ao enviar a url de conexão:', error: error.message });
  }
}

exports.login = async (req, res) => {

  console.log("ok");
  const { username, password } = req.body

  console.log("ok", username, password);

  try {

    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username, password
    });

    const data = response.data;
    console.log(response)

    
    if (response.status == 200) {
      
      console.log("okkk", username, password);

      const userId = data.user._id;
      const connectionUrl = await startNgrok();
      console.log("connectionUrl:", connectionUrl,userId)

        const result = await sendConnectionUrlToWebApi(connectionUrl, userId, data);
        console.log("result:", result)

        if (result === 'Conexão bem-sucedida ao APP') {

          return res.status(200).json({

            message: result,
            loginData: data
          });
        }
        else {

          console.error('Erro ao enviar a url de conexão:', error);
          return res.status(400).json({ message: 'Erro ao enviar a url de conexão:', error: error.message });
        }

    }
    else {
      
      console.error('Erro no login:');
      return res.status(400).json({ message: 'Erro no login!' });
    }
  }
  catch (error) {

    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro no login!' });
  }
}

exports.getuserId = async () => {

  return sessionUserId;
}