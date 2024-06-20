import { Request, Response } from 'express';
import Task from '../model/taskModel';
import Project from '../model/projectModel';

export const createTask = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { title, description, startTime, endTime } = req.body;
    // Validasi data yang dibutuhkan
    if (!title || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required fields: title, startTime, endTime' });
    }
    // Konversi startTime dan endTime ke objek Date
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    // Validasi: pastikan startTime lebih awal dari endTime
    if (startTimeDate >= endTimeDate) {
        return res.status(400).json({ message: 'startTime must be earlier than endTime' });
    }
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: `Project with ${projectId} not found` });
        }
        // Validasi: pastikan tidak ada tugas yang saling tumpang tindih dalam waktu
        const existingTasks = await Task.find({ project: projectId });
        for (const existingTask of existingTasks) {
            if (doTasksOverlap(existingTask.startTime, existingTask.endTime, startTimeDate, endTimeDate)) {
                return res.status(400).json({ message: 'Task overlaps with an existing task' });
            }
        }
        const task = new Task({
            title,
            description,
            startTime: startTimeDate,
            endTime: endTimeDate,
            project: project._id,
        });
        await task.save();
        project.tasks.push(task._id);
        await project.save();
        res.status(201).json(task);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to create task', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const getAllTasksByProjectId = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findById(projectId).populate('tasks');
        if (!project) {
            return res.status(404).json({ message: `Project with ${projectId} not found` });
        }
        res.status(200).json(project.tasks);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, startTime, endTime } = req.body;
    if (!id || !title || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required fields: id, title, startTime, endTime' });
    }
    if (startTime >= endTime) {
        return res.status(400).json({ message: 'startTime must be earlier than endTime' });
    }
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            {
                title,
                description,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
            },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(updatedTask);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to update task', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to delete task', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

function doTasksOverlap(startTime1: Date, endTime1: Date, startTime2: Date, endTime2: Date): boolean {
    return startTime1 < endTime2 && startTime2 < endTime1;
}
