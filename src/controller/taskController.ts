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
        // Cari proyek berdasarkan ID yang diberikan
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(code.NOT_FOUND).json({ message: `Project with ${projectId} not found` });
        }
        // Validasi: pastikan tidak ada tugas yang saling tumpang tindih dalam waktu
        const overlappingTasks = [];
        const existingTasks = await Task.find({ projectId: projectId });
        for (const existingTask of existingTasks) {
            if (doTasksOverlap(existingTask.startTime, existingTask.endTime, startTimeDate, endTimeDate)) {
                overlappingTasks.push({
                    id: existingTask._id,
                    title: existingTask.title,
                    description: existingTask.description,
                    startTime: existingTask.startTime,
                    endTime: existingTask.endTime,
                });
            }
        }
        if (overlappingTasks.length > 0) {
            return res.status(code.UNPROCESSABLE_ENTITY).json({
                message: 'Task overlaps with existing tasks',
                data: overlappingTasks,
            });
        }
        // Buat objek task baru
        const task = new Task({
            title,
            description,
            startTime: startTimeDate,
            endTime: endTimeDate,
            projectId: project._id,
        });
        // Simpan task baru ke dalam database
        await task.save();
        // Tambahkan task ke dalam array tasks pada objek project
        project.tasks.push(task._id);
        await project.save();
        // Kirim respons sukses dengan data task yang telah dibuat
        res.status(code.CREATED).json({ message: 'Successfully create new task', data: task });
    } catch (error: unknown) {
        // Tangani kesalahan yang terjadi selama proses
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
        if (project.tasks.length === 0) {
            return res.status(code.NOT_FOUND).json({ message: `No tasks found for project ${projectId}`, data : null });
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
        if (tasks.length === 0) {
            return res.status(code.NOT_FOUND).json({ message: `No completed tasks found for project ${projectId}` });
        }
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
        if (tasks.length === 0) {
            return res.status(code.NOT_FOUND).json({ message: `No uncompleted tasks found for project ${projectId}` });
        }
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
    // Validasi data yang dibutuhkan
    if (!id || !title || !startTime || !endTime) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required fields: id, title, startTime, endTime' });
    }
    // Konversi startTime dan endTime ke objek Date
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    // Validasi: pastikan startTime lebih awal dari endTime
    if (startTimeDate >= endTimeDate) {
        return res.status(code.UNPROCESSABLE_ENTITY).json({ message: 'startTime must be earlier than endTime' });
    }
    try {
        // Cari task yang akan diperbarui berdasarkan ID yang diberikan
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(code.NOT_FOUND).json({ message: 'Task not found' });
        }
        // Cari semua task lain dalam proyek yang sama
        const otherTasks = await Task.find({ _id: { $ne: id }, projectId: existingTask.projectId });
        // Array untuk menyimpan informasi task yang tumpang tindih
        const overlappingTasks: any[] = [];
        // Validasi: periksa tumpang tindih waktu dengan task lain
        for (const task of otherTasks) {
            if (doTasksOverlap(task.startTime, task.endTime, startTimeDate, endTimeDate)) {
                overlappingTasks.push({
                    id: task._id,
                    title: task.title,
                    description: task.description,
                    startTime: task.startTime,
                    endTime: task.endTime,
                });
            }
        }
        // Jika terdapat tumpang tindih, kirimkan respons dengan daftar task yang bertabrakan
        if (overlappingTasks.length > 0) {
            return res.status(code.UNPROCESSABLE_ENTITY).json({
                message: 'Task overlaps with existing tasks',
                data : overlappingTasks,
            });
        }
        // Lakukan pembaruan task
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            {
                title,
                description,
                startTime: startTimeDate,
                endTime: endTimeDate,
            },
            { new: true }
        );
        // Kirim respons sukses dengan data task yang telah diperbarui
        return res.status(code.OK).json({ message: `Successfully update task with ${id}`, data: updatedTask });
    } catch (error: unknown) {
        // Tangani kesalahan yang terjadi selama proses
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
