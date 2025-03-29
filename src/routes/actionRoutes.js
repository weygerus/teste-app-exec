const express = require('express');
const multer = require('multer');

const {  
    uploadUsersListService,  
    uploadUsersListTxtService,
    uploadListToLikePostsService,  
    uploadListToLikePostsFileService,  
    uploadPostsCommentariesService,  
    uploadLikesToCommentsService,  
    uploadUsersToViewAndLikeStoriesService,
    uploadUsersToViewAndLikeStoriesFileService,  
    createFeedPostService,  
    createStoryPostService,  
    createReelsPostService
    } = require('../controllers/actionController');

const { verifyToken } = require('../middleware/authMiddleware');
const { upload, uploadTxt } = require('../middleware/uploadMiddleware');

const router = express.Router();


router.post('/followUsersService/:userId/:account', uploadUsersListService);
router.post('/uploadUsersListTxtService/:userId/:account', uploadTxt, verifyToken, uploadUsersListTxtService);

//Users\SeuNomeDeUsuario\Desktop

router.post('/createFeedPostService/:userId/:account', upload, verifyToken, createFeedPostService);
router.post('/createStoryPostService/:userId/:account', upload, verifyToken, createStoryPostService);
router.post('/createReelsPostService/:userId/:account', upload, verifyToken, createReelsPostService);


router.post('/uploadListToLikePostsService/:userId/:account', verifyToken, uploadListToLikePostsService);
router.post('/uploadListToLikePostsFileService/:userId/:account', uploadTxt, verifyToken, uploadListToLikePostsFileService);

router.post('/uploadPostsCommentariesService/:userId/:account', uploadTxt, verifyToken, uploadPostsCommentariesService);
router.post('/uploadLikesToCommentsService/:userId/:account', uploadTxt, verifyToken, uploadLikesToCommentsService);

router.post('/uploadUsersToViewAndLikeStoriesService/:userId/:account', verifyToken, uploadUsersToViewAndLikeStoriesService);
router.post('/uploadUsersToViewAndLikeStoriesFileService/:userId/:account', uploadTxt, verifyToken, uploadUsersToViewAndLikeStoriesFileService);

module.exports = router;
