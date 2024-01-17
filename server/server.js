import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

//user
import User from "./models/userModel.js";

//Routes
import userRoutes from "./routes/userRoutes.js";
import clientUserRoutes from "./routes/clientUserRoutes.js";

const app = express();
const PORT = 8080;
dotenv.config();
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRoutes);
app.use("/client/users", clientUserRoutes);

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("assets"));

app.listen(PORT, (req, res) => {
    console.log("server listening on port", PORT);
});
