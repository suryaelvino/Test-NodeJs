import mongoose from 'mongoose';

const mongoURL: string = 'mongodb://localhost:27017/mydatabase';

export async function connectToMongoDB() {
  try {
    await mongoose.connect(mongoURL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}