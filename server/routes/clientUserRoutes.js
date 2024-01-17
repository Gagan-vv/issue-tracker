import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    signUpUser,
    loginUser,
    openDashboard,
    openCreateProject,
    openProject,
    openCreateIssueForProject,
    getUsers,
    getUserById,
    updateUserById,
    deleteUser,
    getIssuesForProject,
} from "../controllers/clientUserController.js";

const router = express.Router();

router.route("/").get(protect, getUsers);

router.route("/signup").get(signUpUser);

router.route("/login").get(loginUser);

router.route("/dashboard/:id").get(openDashboard);

router.route("/createProject/:id").get(openCreateProject);

router.route("/project/:id").get(openProject);

router.route("/project/:id/issues").get(getIssuesForProject);

router.route("/project/:id/createIssue").get(openCreateIssueForProject);

router
    .route("/:id")
    .get(protect, getUserById)
    .put(protect, updateUserById)
    .delete(protect, deleteUser);

export default router;
