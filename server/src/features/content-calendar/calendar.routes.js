const { Router } = require('express');
const { authenticate } = require('../../middleware/auth');
const { listPosts, createPost, updatePost, deletePost } = require('./calendar.controller');

const calendarRouter = Router();
calendarRouter.use(authenticate);
calendarRouter.get('/', listPosts);
calendarRouter.post('/', createPost);
calendarRouter.patch('/:id', updatePost);
calendarRouter.delete('/:id', deletePost);

module.exports = { calendarRouter };
