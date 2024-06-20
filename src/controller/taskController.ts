import { Request, Response } from 'express';
import Task from '../model/taskModel';
import Project from '../model/projectModel';
import code from 'http-status-codes';
import projectModel from '../model/projectModel';

export const createTask = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const { title, description, startTime, endTime } = req.body;
    // Validasi data yang dibutuhkan
    if (!title || !startTime || !endTime) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required fields: title, startTime, endTime' });
    }
    // Konversi startTime dan endTime ke objek Date
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    // Validasi: pastikan startTime lebih awal dari endTime
    if (startTimeDate >= endTimeDate) {
        return res.status(code.UNPROCESSABLE_ENTITY).json({ message: 'startTime must be earlier than endTime' });
    }
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(code.NOT_FOUND).json({ message: `Project with ${projectId} not found` });
        }
        // Validasi: pastikan tidak ada tugas yang saling tumpang tindih dalam waktu
        const existingTasks = await Task.find({ project: projectId });
        for (const existingTask of existingTasks) {
            if (doTasksOverlap(existingTask.startTime, existingTask.endTime, startTimeDate, endTimeDate)) {
                return res.status(code.UNPROCESSABLE_ENTITY).json({ message: 'Task overlaps with an existing task' });
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
        res.status(code.CREATED).json({message: 'Successfully create new task', data : task });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create task', error: error.message });
        } else {
            res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const getAllTasksByProjectId = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    try {
        const project = await Project.findById(projectId).populate('tasks');
        if (!project) {
            return res.status(code.NOT_FOUND).json({ message: `Project with ${projectId} not found`, data : null });
        }
        res.status(code.OK).json({message: `Successfully get all task with project ${projectId}`, data : project.tasks});
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch tasks', error: error.message });
        } else {
            res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const getAllTasksCompletedByProjectId = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    // Validasi parameter projectId
    if (!projectId) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required parameter: projectId' });
    }
    try {
        const tasks = await Task.find({ project: projectId, completed: true });
        return res.status(code.OK).json({ message: `Successfully get all completed tasks with project ${projectId}`, data: tasks });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch completed tasks', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};


export const getAllTasksUncompletedByProjectId = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    // Validasi parameter projectId
    if (!projectId) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required parameter: projectId' });
    }
    try {
        const tasks = await Task.find({ project: projectId, completed: false });
        return res.status(code.OK).json({ message: `Successfully get all uncompleted tasks with project ${projectId}`, data: tasks });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch uncompleted tasks', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, startTime, endTime } = req.body;
    if (!id || !title || !startTime || !endTime) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required fields: id, title, startTime, endTime' });
    }
    if (startTime >= endTime) {
        return res.status(code.UNPROCESSABLE_ENTITY).json({ message: 'startTime must be earlier than endTime' });
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
            return res.status(code.NOT_FOUND).json({ message: 'Task not found' });
        }
        return res.status(code.OK).json({ message: `Successfully update task with ${id}`, data : updatedTask });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update task', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const completedTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    // Validasi parameter taskId
    if (!id) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required parameter id' });
    }
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { completed: true },
            { new: true }
        );
        if (!updatedTask) {
            return res.status(code.NOT_FOUND).json({ message: `Task with id ${id} not found` });
        }
        return res.status(code.OK).json({ message: `Successfully marked task with id ${id} as completed`, data: updatedTask });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to mark task as completed', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(code.BAD_REQUEST).json({ message: `Task ${id} not found` });
        }
        return res.status(code.OK).json({ message: `Task ${id} deleted successfully` });
    } catch (error: unknown) {
        if (error instanceof Error) {
           return res.status(code.INTERNAL_SERVER_ERROR).json({ message: `Failed to delete task with projectId ${id}`, error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

function doTasksOverlap(startTime1: Date, endTime1: Date, startTime2: Date, endTime2: Date): boolean {
    return startTime1 < endTime2 && startTime2 < endTime1;
}
