const express = require('express');

const { login } = require('../controllers/authController');

const router = express.Router();

router.get('/connectionTest', async (req, res)  => { return res.status(200)})
router.post('/login', login );

module.exports = router;
