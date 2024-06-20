import express, {  Request, Response } from "express";
import mongoose from 'mongoose';

const app = express();
const port = 3000;

const mongoURL: string = 'mongodb://localhost:27017/mydatabase';

async function connectToMongoDB() {
  try {
    await mongoose.connect(mongoURL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToMongoDB();

app.get("/", (req: Request, res: Response) => {
    console.log("test");
    res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});