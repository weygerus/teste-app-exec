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
    const url = await ngrok.connect(6890);
    console.log(`ngrok túnel aberto em: ${url}`);
    return url;
  } catch (err) {
    console.error('Erro ao iniciar o ngrok:', err);
    return undefined;
  }
};

exports.login = async (req, res) => {

  const { username, password } = req.body
  console.log(username, password)

  const user = await User.findOne({username}).populate('instaAccounts');

  if (!user) {

    return res.status(404).json({ message: 'Usuário não encontrado' })
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) return res.status(400).json({ message: 'Senha incorreta!' })

  const acessToken = jwt.sign({ id: user._id, role: user.role }, secret, {

    expiresIn: '7d'
  })

  const connectionUrl = await startNgrok();

  if (connectionUrl == undefined) {

    return res.status(400).json({ message: 'O servidor local não conseguiu se conectar ao APP!' })
  }
  else if (connectionUrl) {

    try {
      const response = await axios.post('http://localhost:3000/api/connection/sendConnectionUrl', {
        connectionUrl: connectionUrl, userId: user._id
      });
      const refreshToken = jwt.sign({ id: user.id }, 'refresh-secret', { expiresIn: '7d' })

      const responseData = {
        _id: user._id,
        username: req.body.username,
        userImage: user.userImage,
        instaAccounts: user.instaAccounts
      }

      console.log(user, responseData);

      sessionUserId = user._id;
      console.log('Resposta do servidor localhost 5500:', response.data);

      return res.status(200).json({
        message: 'Conexão bem-sucedida ao APP',
        user: responseData,
        accessToken: acessToken,
        refreshToken: refreshToken
      });

    } catch (error) {

      console.error('Erro ao se conectar com o servidor localhost 5500:', error);
      return res.status(500).json({ message: 'Erro ao tentar se conectar ao servidor local', error: error.message });
    }
  }
}

exports.getuserId = async () => {

  return sessionUserId;
}