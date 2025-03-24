require('dotenv').config();
const mongoose = require('mongoose');

const { IgApiClient } = require('instagram-private-api');
const { loadSessionFromDB } = require("../utils/sessionManager");

require('../models/usuario')
const User = mongoose.model('User')

exports.loadSessions = async (req, res) => {

  try {
    const userId = req.params.userId;  // O ID do usuário da requisição
    const userSelected = await User.findById(userId);

    if (!userSelected) {
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }

    const sessionsData = [];
    const errors = [];

    const ig = new IgApiClient();
    const instaAccounts = userSelected.instaAccounts;

    if (!instaAccounts || instaAccounts.length === 0) {
      return res.status(200).json({ message: 'Nenhuma conta adicionada!' });
    }

    for (let account of instaAccounts) {

      console.log("Carregando sessão para:", account.username);

      try {

        const session = await loadSessionFromDB(userId, account.username, ig);
        await session.account.currentUser();

        if (session) {

          sessionsData.push({ username: account.username, sessionId: account.username });
        } 
        else {

          errors.push({ username: account.username, error: "Sessão não encontrada ou erro ao carregar" });
        }
      }
      catch (loginError) {

        /* Se der erro trocar para mensagem esperada no frontend */
        console.error(`Erro ao tentar carregar a sessão com a conta:`, loginError.message);
        errors.push({ username: account.username, error: loginError.message });
      }
    }

    return res.status(200).json({

      message: 'Sessões carregadas.',
      sessions: sessionsData,
      errors: errors.length > 0 ? errors : undefined
    });
  }
  catch (error) {

    return res.status(400).json({

      message: `Erro ao carregar as sessões: ${error.message}`,
    });
  }
};

exports.singleAccountReloginFromExecTeste = async (req, res) => {

    const { user, accountUsername } = req.body;
    const userId = user._id;
  
    const userSelected = await User.findById(userId);
  
    if (!userSelected) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
  
    const instaAccount = userSelected.instaAccounts.find(account => account.username === accountUsername);
  
    const ig = new IgApiClient();
    const sessionData = [];
  
    try {
  
      console.log("Realizando relogin para a conta: ", instaAccount.username);
  
      await ig.state.generateDevice(userSelected.username);
      await ig.simulate.preLoginFlow();
      await ig.account.login(instaAccount.username, instaAccount.password);
  
      await ig.account.currentUser();
  
      const newSessionData = await ig.state.serialize();
      delete newSessionData.constants;
  
      const existingSession = userSelected.sessions.find(sess => sess.username === instaAccount.username);
  
      if (existingSession) {
  
        existingSession.session = JSON.stringify(newSessionData);
        console.log(`Sessão para o usuário ${instaAccount.username} atualizada com sucesso.`);
      }
      else {
  
        userSelected.sessions.push({ session: JSON.stringify(newSessionData), username: instaAccount.username });
        console.log(`Nova sessão adicionada para o usuário ${instaAccount.username}`);
      }
  
      await userSelected.save();
  
      // Salva o array de sessões para a resposta
      sessionData.push({ username: instaAccount.username, sessionId: instaAccount.username });
  
      return res.status(200).json({
        message: `A login da conta ${instaAccount.username}, foi realizado com sucesso!`,
        sessionData: sessionData
      });
    }
    catch (loginError) {
  
      if (loginError.message.includes("challenge_required")) {
  
        console.error(`Erro ao tentar logar com a conta ${accountUsername}:`, loginError.message);
        const errorItem = { username: accountUsername, error: loginError.message };
  
        return res.status(400).json({
          message: `Erro ao efetuar ação: ${loginError.message}`,
          error: errorItem
        });
      }
      else {
  
        console.error(`Erro ao tentar logar com a conta ${accountUsername}:`, loginError.message);
        const errorItem = { username: accountUsername, error: loginError.message };
  
        return res.status(400).json({
          message: `Erro ao logar no Instagram: ${loginError.message}`,
          error: errorItem
        });
      }
  
  
    }
}

exports.instaRegisterAccount = async (req, res) => {

  const data = req.body;

  try {
    const userId = data._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    //  Verifica se a conta já existe no array instaAccounts
    const accountExists = user.instaAccounts.some(account => account.username === data.instaUsername);

    if (accountExists) {
      return res.status(400).json({ message: 'Já existe uma conta com este username.' });
    }

    const ig = new IgApiClient();

    try {

      const newAccount = { username: data.instaUsername, password: data.instaPassword };

      await ig.state.generateDevice(user.username);
      await ig.simulate.preLoginFlow();
      await ig.account.login(data.instaUsername, data.instaPassword);
      
      await ig.account.currentUser();
      
      user.instaAccounts.push(newAccount);
      await user.save();

      const sessionData = await ig.state.serialize();
      delete sessionData.constants;

      user.sessions.push({ session: JSON.stringify(sessionData), username: data.instaUsername });
      await user.save();

      return res.status(200).json({ message: 'Conta do Instagram adicionada com sucesso.', user: user, instaUsername: data.instaUsername  });
    }
    catch (error) {

      return res.status(201).json({
        message: 'Autenticação ou Captcha solicitado pelo Instagram, realize o desbloqueio e tente novamente!',
        error: { username: data.instaUsername, error: error.message }
      });
    }
  }
  catch (error) {

    console.error('Erro ao processar a requisição:', error.message);
    return res.status(500).json({ message: 'Erro ao processar a requisição.', error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {

  const userId = req.params.userId;
  const accountUsername = req.params.accountUsername;

  try {

    const user = await User.findOne({ _id: userId }).populate('instaAccounts', 'sessions');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const accountIndex = user.instaAccounts.findIndex(account => account.username === accountUsername);
    const sessionIndex = user.sessions.findIndex(session => session.username === accountUsername);

    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Conta do Instagram não encontrada.' });
    }

    if (sessionIndex === -1) {
      return res.status(404).json({ message: 'Conta do Instagram não encontrada.' });
    }
  
    user.instaAccounts = user.instaAccounts.filter((_, index) => index !== accountIndex);
    user.sessions = user.sessions.filter((_, index) => index !== sessionIndex);

    await user.save();
  
    return res.status(200).json({ message: 'Conta do Instagram deletada com sucesso.' });

  } catch (error) {

    console.error('Erro ao deletar conta do Instagram:', error);
    res.status(500).json({ message: 'Erro ao deletar conta do Instagram:', error: error });
  }
};
