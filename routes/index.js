const { Router } = require('express');
const router = Router();
const postController = require('../controllers/postController');

/* CREATE a POST */
router.post('/', postController.postCreate);
/* UPDATE POST */
router.put('/:postId', postController.updatePost);
/* GET Post detailt */
router.get('/:postId', postController.getPostDetail);
/* DELETE Post */
router.delete('/:postId', postController.deletePost);
/* GET Post List */
router.get('/', postController.getPostList);

module.exports = router;
