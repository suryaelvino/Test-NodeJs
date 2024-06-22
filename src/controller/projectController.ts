import { Request, Response } from 'express';
import Project from '../model/projectModel';
import code from 'http-status-codes';

export const createProject = async (req: Request, res: Response) => {
    const { name, description } = req.body;
    // Validasi request body
    if (!name || !description) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required fields: name, description' });
    }
    try {
        const project = await Project.create({ name, description });
        return res.status(code.CREATED).json({ message: 'Success create new project', data: project });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create project', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};


export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const projects = await Project.find();
        if (projects.length === 0) {
            return res.status(code.NOT_FOUND).json({ message: 'No projects found', data: null });
        }
        return res.status(code.OK).json({ message: 'Success get all projects', data: projects });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch all projects', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    // Validasi parameter id
    if (!id) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required parameter: id' });
    }
    try {
        const project = await Project.findById(id);
        if (!project) {
            return res.status(code.NOT_FOUND).json({ message: `Project ${id} not found`, data: null });
        }
        return res.status(code.OK).json({message:`Success get detail project ${id}`, data : project });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch project', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    // Validasi parameter id dan request body
    if (!id) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required parameter: id' });
    }
    if (!name || !description) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required fields: name, description' });
    }
    try {
        const updatedProject = await Project.findByIdAndUpdate(id, { name, description }, { new: true });
        if (!updatedProject) {
            return res.status(code.NOT_FOUND).json({ message: `Project ${id} not found` });
        }
        return res.status(code.OK).json({ message: `Success update with project ${id}`, data : updatedProject });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update project', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    // Validasi parameter id
    if (!id) {
        return res.status(code.BAD_REQUEST).json({ message: 'Missing required parameter: id' });
    }
    try {
        const deletedProject = await Project.findByIdAndDelete(id);
        if (!deletedProject) {
            return res.status(code.NOT_FOUND).json({ message: `Project ${id} not found`, data : null });
        }
        return res.status(code.OK).json({ message: `Project ${id} was deleted`, data : null });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete project', error: error.message });
        } else {
            return res.status(code.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
        }
    }
};

