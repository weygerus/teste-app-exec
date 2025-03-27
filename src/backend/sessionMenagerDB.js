const mongoose = require('mongoose');

require('./models/usuario')
const User = mongoose.model('User')

const loadSessionFromWebApiDB = async (userId, username, ig) => {
    try {
        const response = await axios.get('https://gerenc-insta-deld.onrender.com/api/auth/login');

        const data = response.data;
        console.log(response.data);

        if (response.status == 200) {

            return res.status(200).json({

                message: result,
                data: data
            });
        }
        else {

            console.error('Erro ao carregar a sessão da API WEB:');
            return res.status(400).json({ message: 'Erro ao carregar a sessão da API WEB:' });
        }
    } catch (error) {

        console.error("Erro ao carregar a sessão da API WEB:", error.message);
        return null;
    }
};

const loadSessionFromDB = async (userId, username, ig) => {
    try {

        const user = await User.findById(userId);

        if (!user) {
            console.error("Usuário não encontrado no banco de dados");
            return null;
        }

        // Busca a sessão correspondente ao username
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