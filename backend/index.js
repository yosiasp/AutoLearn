import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import Routes from "./routes/Routes.js";
import "./config/passport.js";
import cookieParser from "cookie-parser";
import cors from "cors";

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

mongoose.connect(MONGOURL).then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});

app.use("/api/", Routes);
app.use(authRoutes);

export default app;

