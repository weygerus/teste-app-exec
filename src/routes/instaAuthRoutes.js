const express = require('express');

const {  singleAccountReloginFromExecTeste, instaRegisterAccount, loadSessions, deleteAccount } = require('../controllers/instaAuthController');

const router = express.Router();

router.get('/loadInstaSessions/:userId', loadSessions);

router.post('/singleAccountReloginFromExecTeste', singleAccountReloginFromExecTeste);
router.post('/addInstaAccount', instaRegisterAccount);

router.delete('/deleteAccount/:userId/:accountUsername', deleteAccount);

module.exports = router;
