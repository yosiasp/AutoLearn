import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Routes from "./routes/Routes.js";
import cors from "cors";

dotenv.config();

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGOURL = process.env.MONGOURL;

mongoose.connect(MONGOURL).then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});

app.use("/api/", Routes);

export default app;

