const { getPostsByUser, createCalendarPost, updateCalendarPost, deleteCalendarPost } = require('./calendar.queries');

async function listPosts(req, res, next) {
  try { res.json({ success: true, posts: await getPostsByUser(req.user.id) }); }
  catch (err) { next(err); }
}

async function createPost(req, res, next) {
  try {
    const { title, platform, scheduledAt, contentId } = req.body;
    if (!title || !scheduledAt) return res.status(400).json({ success: false, message: 'title and scheduledAt are required' });
    const post = await createCalendarPost(req.user.id, { title, platform, scheduledAt, contentId });
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
}

async function updatePost(req, res, next) {
  try {
    const post = await updateCalendarPost(req.params.id, req.user.id, req.body);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) { next(err); }
}

async function deletePost(req, res, next) {
  try {
    const deleted = await deleteCalendarPost(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
}

module.exports = { listPosts, createPost, updatePost, deletePost };
