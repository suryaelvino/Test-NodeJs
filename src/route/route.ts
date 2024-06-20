import express from 'express';
import * as project from '../controller/projectController';
import * as task from '../controller/taskController';

const router = express.Router();

router.post('/projects', project.createProject);
router.get('/projects', project.getAllProjects);
router.get('/projects/:id', project.getProjectById);
router.put('/projects/:id', project.updateProject);
router.delete('/projects/:id', project.deleteProject);

router.post('/projects/:projectId/tasks', task.createTask);
router.get('/projects/:projectId/tasks', task.getAllTasksByProjectId);
router.get('/projects/:projectId/completedtasks', task.getAllTasksCompletedByProjectId);
router.get('/projects/:projectId/uncompletedtasks', task.getAllTasksUncompletedByProjectId);
router.put('/tasks/:id', task.updateTask);
router.put('/completedtasks/:id', task.completedTask);
router.delete('/tasks/:id', task.deleteTask);

export default router;
