import express from 'express';
import * as projectController from '../controller/projectController';
import * as taskController from '../controller/taskController';

const router = express.Router();

router.post('/projects', projectController.createProject);
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

router.post('/projects/:projectId/tasks', taskController.createTask);
router.get('/projects/:projectId/tasks', taskController.getAllTasksByProjectId);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

export default router;
