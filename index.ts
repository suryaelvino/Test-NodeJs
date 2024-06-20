import express, { Request, Response } from "express";
import { connectToMongoDB } from "./src/database/mongodb";
import router from "./src/route/route";
import cors from "cors";
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectToMongoDB();

app.use(router);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
