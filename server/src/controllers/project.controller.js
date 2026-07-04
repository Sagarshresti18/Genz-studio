const { getProjectsByUser, getProjectById, createProject, updateProject, deleteProject } = require('../queries/project.queries');

async function listProjects(req, res, next) {
  try {
    const projects = await getProjectsByUser(req.user.id);
    res.json({ success: true, projects });
  } catch (err) { next(err); }
}

async function getProject(req, res, next) {
  try {
    const project = await getProjectById(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) { next(err); }
}

async function newProject(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Project name is required' });
    const project = await createProject(req.user.id, name);
    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
}

async function editProject(req, res, next) {
  try {
    const project = await updateProject(req.params.id, req.user.id, req.body);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) { next(err); }
}

async function removeProject(req, res, next) {
  try {
    const deleted = await deleteProject(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
}

module.exports = { listProjects, getProject, newProject, editProject, removeProject };
