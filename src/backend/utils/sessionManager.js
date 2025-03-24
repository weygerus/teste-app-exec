const mongoose = require('mongoose');

require('../models/usuario')
const User = mongoose.model('User')

const loadSessionFromDB = async (userId, username, ig) => {
    try {
        
        const user = await User.findById(userId);

        if (!user) {
            console.error("Usuário não encontrado no banco de dados");
            return null;
        }

        // Busca a sessão correspondente ao username
        console.log(typeof username, username);
        const session = user.sessions.find(sess => sess.username.includes(username));

        if (!session) {
            console.error(`Sessão não encontrada para o usuário ${username}`);
            return null;
        }

        await ig.state.deserialize(JSON.parse(session.session));

        console.log(`Sessão carregada para o usuário ${username}`);
        return ig;  // Retorna o cliente com a sessão carregada

    } catch (error) {
        
        console.error("Erro ao carregar a sessão do banco:", error.message);
        return null;
    }
};

module.exports = { loadSessionFromDB };