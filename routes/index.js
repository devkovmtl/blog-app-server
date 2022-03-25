const { Router } = require('express');
const router = Router();
const postController = require('../controllers/postController');

/* CREATE a POST */
router.post('/', postController.postCreate);
/* GET Post detailt */
router.get('/:postId', postController.getPostDetail);
/* GET Post List */
router.get('/', postController.getPostList);

module.exports = router;
