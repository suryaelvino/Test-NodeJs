import { Request, Response } from 'express';
import Project from '../model/projectModel';

export const createProject = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    // Validasi request body
    if (!name || !description) {
        return res.status(400).json({ message: 'Missing required fields: name, description' });
    }
    try {
        const project = await Project.create({ name, description });
        res.status(201).json({ message: 'Success create new project', data: project });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to create project', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};


export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find();
        res.status(200).json({ message: 'Success get all projects', data: projects });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to fetch all projects', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    // Validasi parameter id
    if (!id) {
        return res.status(400).json({ message: 'Missing required parameter: id' });
    }
    try {
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: `Project ${id} not found`, data: null });
        }
        res.status(200).json({message:`Success get detail project ${id}`, data : project });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to fetch project', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    // Validasi parameter id dan request body
    if (!id) {
        return res.status(400).json({ message: 'Missing required parameter: id' });
    }
    if (!name || !description) {
        return res.status(400).json({ message: 'Missing required fields: name, description' });
    }
    try {
        const updatedProject = await Project.findByIdAndUpdate(id, { name, description }, { new: true });
        if (!updatedProject) {
            return res.status(404).json({ message: `Project ${id} not found` });
        }
        res.status(200).json({ message: `Success update with project ${id}`, data : updatedProject });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to update project', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    // Validasi parameter id
    if (!id) {
        return res.status(400).json({ message: 'Missing required parameter: id' });
    }
    try {
        const deletedProject = await Project.findByIdAndDelete(id);
        if (!deletedProject) {
            return res.status(404).json({ message: `Project ${id} not found`, data : null });
        }
        res.status(200).json({ message: `Project ${id} was deleted`, data : null });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: 'Failed to delete project', error: error.message });
        } else {
            res.status(500).json({ message: 'An unexpected error occurred' });
        }
    }
};

