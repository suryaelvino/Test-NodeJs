"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getAllTasksByProjectId = exports.createTask = void 0;
const taskModel_1 = __importDefault(require("../model/taskModel"));
const projectModel_1 = __importDefault(require("../model/projectModel"));
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const project = yield projectModel_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        console.log("project :", project);
        // Validasi: pastikan tidak ada tugas yang saling tumpang tindih dalam waktu
        const existingTasks = yield taskModel_1.default.find({ project: projectId });
        console.log("existing task :", existingTasks);
        for (const existingTask of existingTasks) {
            if (doTasksOverlap(existingTask.startTime, existingTask.endTime, startTimeDate, endTimeDate)) {
                return res.status(400).json({ message: 'Task overlaps with an existing task' });
            }
        }
        const task = new taskModel_1.default({
            title,
            description,
            startTime: startTimeDate,
            endTime: endTimeDate,
            project: project._id,
        });
        yield task.save();
        project.tasks.push(task._id);
        yield project.save();
        res.status(201).json(task);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to create task', error: error.message });
        }
        else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});
exports.createTask = createTask;
const getAllTasksByProjectId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const project = yield projectModel_1.default.findById(projectId).populate('tasks');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project.tasks);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
        }
        else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});
exports.getAllTasksByProjectId = getAllTasksByProjectId;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title, description, startTime, endTime } = req.body;
    if (!id || !title || !startTime || !endTime) {
        return res.status(400).json({ message: 'Missing required fields: id, title, startTime, endTime' });
    }
    if (startTime >= endTime) {
        return res.status(400).json({ message: 'startTime must be earlier than endTime' });
    }
    try {
        const updatedTask = yield taskModel_1.default.findByIdAndUpdate(id, {
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        }, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(updatedTask);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to update task', error: error.message });
        }
        else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});
exports.updateTask = updateTask;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedTask = yield taskModel_1.default.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to delete task', error: error.message });
        }
        else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
});
exports.deleteTask = deleteTask;
function doTasksOverlap(startTime1, endTime1, startTime2, endTime2) {
    return startTime1 < endTime2 && startTime2 < endTime1;
}
