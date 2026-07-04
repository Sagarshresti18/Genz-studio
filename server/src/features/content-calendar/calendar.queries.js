const { getDatabasePool } = require('../../config/database');

async function getPostsByUser(userId) {
  const { rows } = await getDatabasePool().query(
    'SELECT * FROM calendar_posts WHERE user_id = $1 ORDER BY scheduled_at ASC', [userId]
  );
  return rows;
}

async function createCalendarPost(userId, { title, platform, scheduledAt, contentId }) {
  const { rows } = await getDatabasePool().query(
    'INSERT INTO calendar_posts (user_id, title, platform, scheduled_at, content_id, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *',
    [userId, title, platform, scheduledAt, contentId, 'scheduled']
  );
  return rows[0];
}

async function updateCalendarPost(postId, userId, fields) {
  const { rows } = await getDatabasePool().query(
    'UPDATE calendar_posts SET title=COALESCE($1,title), scheduled_at=COALESCE($2,scheduled_at), status=COALESCE($3,status) WHERE id=$4 AND user_id=$5 RETURNING *',
    [fields.title, fields.scheduledAt, fields.status, postId, userId]
  );
  return rows[0] || null;
}

async function deleteCalendarPost(postId, userId) {
  const { rowCount } = await getDatabasePool().query(
    'DELETE FROM calendar_posts WHERE id=$1 AND user_id=$2', [postId, userId]
  );
  return rowCount > 0;
}

module.exports = { getPostsByUser, createCalendarPost, updateCalendarPost, deleteCalendarPost };
