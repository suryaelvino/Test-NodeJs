import mongoose, { Schema, Document } from 'mongoose';
import { Task } from './taskModel';

// Skema untuk proyek
export interface Project extends Document {
  name: string;
  description: string;
  tasks: Array<Task['_id']>;
}

const projectSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }]
});

export default mongoose.model<Project>('Project', projectSchema);
