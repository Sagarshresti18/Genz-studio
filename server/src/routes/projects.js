const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { listProjects, getProject, newProject, editProject, removeProject } = require('../controllers/project.controller');

const projectRouter = Router();

// All project routes require auth
projectRouter.use(authenticate);

// GET    /api/projects
projectRouter.get('/', listProjects);

// POST   /api/projects
projectRouter.post('/', newProject);

// GET    /api/projects/:id
projectRouter.get('/:id', getProject);

// PATCH  /api/projects/:id
projectRouter.patch('/:id', editProject);

// DELETE /api/projects/:id
projectRouter.delete('/:id', removeProject);

module.exports = { projectRouter };
