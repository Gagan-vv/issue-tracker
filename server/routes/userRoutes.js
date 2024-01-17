import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
    signUpUser,
    loginUser,
    getUsers,
    getUserById,
    updateUserById,
    deleteUser,
    createProject,
    createIssue,
    createActivity,
    getActivitiesForIssue,
    getIssueById,
    updateIsFixedIssue,
    searchIssues,
} from "../controllers/userControllers.js";

const router = express.Router();

router.route("/").get(protect, getUsers);

router.route("/signup").post(signUpUser);

router.route("/login").post(loginUser);

router.route("/project").post(createProject);

router.route("/project/:projectId/issues").post(createIssue);

router
    .route("/project/:projectId/issues/:issueId/createActivity")
    .post(createActivity);

router.route("/issues/:id/activities").get(getActivitiesForIssue);

router.route("/issues/:id/fixed").put(updateIsFixedIssue);

router.route("/issues/:id").get(getIssueById);

router.route("/projects/:projectId/searchIssues").post(searchIssues);

router
    .route("/:id")
    .get(protect, getUserById)
    .put(protect, updateUserById)
    .delete(protect, deleteUser);

export default router;
