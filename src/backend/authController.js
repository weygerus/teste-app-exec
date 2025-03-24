
module.exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === '1234') {
        return res.json({
            message: 'Login bem-sucedido',
            accessToken: 'fake-token-123',
            refreshToken: 'fake-refresh-456',
            user: { id: 1, username }
        });
    }

    return res.status(401).json({ message: 'Credenciais inválidas' });
};

module.exports.testeexec = async (req, res) => {

    const data = req.body;
    console.log("DATA: ", data);
};