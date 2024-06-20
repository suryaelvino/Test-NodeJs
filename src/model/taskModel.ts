import mongoose, { Schema, Document, Types } from 'mongoose';

// Perluas interface Task untuk menyertakan project
export interface Task extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  project: Types.ObjectId;
}

const taskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
});

export default mongoose.model<Task>('Task', taskSchema);
