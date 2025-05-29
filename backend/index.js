import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import Routes from "./routes/Routes.js";
import "./config/passport.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { spawn } from "child_process";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cookieParser());

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGOURL;

// Function to start python server
function startPythonServer() {
    const pyProcess = spawn('uvicorn', ['services.rag_service.main:app', '--port', '8001', '--reload']);

    pyProcess.stdout.on('data', (data) => {
        console.log(`[Python stdout]: ${data.toString()}`);
    });

    pyProcess.stderr.on('data', (data) => {
        console.error(`[Python stderr]: ${data.toString()}`);
    });

    pyProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });

    return pyProcess;
}

// Python server check
async function waitForPythonReady(url, interval = 1000, maxRetries = 30) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const res = await axios.get(url);
            if (res.status === 200) {
                console.log('Python server is running on port 8001');
                return true;
            }
        } catch (err) {
            // Python server is not ready
        }
        retries++;
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Python server did not start in time.');
}

mongoose.connect(MONGOURL).then(async () => {
    console.log("Connected to MongoDB");

    startPythonServer();

    try {
        await waitForPythonReady('http://localhost:8001/health');
  
        app.listen(PORT, () => {
            console.log(`Node Js Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error(err.message);
        process.exit(1); 
    }

}).catch((err) => {
    console.log(err);
});

app.use("/api/", Routes);
app.use(authRoutes);

export default app;
