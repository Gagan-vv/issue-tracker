import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import ProjectModel from "../models/projectModel.js";
import generateToken from "../utils/generateToken.js";
import Issue from "../models/issueModel.js";
import Project from "../models/projectModel.js";
import Activity from "../models/activityModel.js";

import mongoose from "mongoose";

// Sign up a user
//Rout - POST /api/users

const signUpUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    //see if user already exist
    const userEmailExist = await User.findOne({ email: email });

    if (userEmailExist) {
        req.statusCode = 400;
        throw new Error(
            `User already exist with provided email ${email} is provided email`
        );
    }

    const usernameExist = await User.findOne({ username: username });

    if (usernameExist) {
        res.status(400);
        throw new Error(
            `choose different username ${username} is already taken`
        );
    }

    const user = await User.create({
        username,
        email,
        password,
        role,
    });

    if (user) {
        res.status(200).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } else {
        res.status(400);
        throw new Error("Cannot create user");
    }
});

//login / auth user
//Route - POST /api/users/login

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Here you can check the user's password and authenticate the user
        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

//get List of all users
//Route GET /api/users

const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    res.json(users);
});

//get user by id
//Route GET /api/users/:id

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//update a user
//Route PUT /api/users/:id

const updateUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        const updatedUser = await user.save();
        res.json({
            _id: generateToken(updatedUser.id),
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//delete a user
//Route DELETE /api/users/:id

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        await user.remove();
        res.json({
            message: "User deleted succesfully",
        });
    } else {
        res.status(404);
        throw new Error("User not deleted");
    }
});

const createProject = asyncHandler(async (req, res) => {
    const { name, description, userId } = req.body;

    try {
        const project = new ProjectModel({
            projectName: name,
            projectDescription: description,
            user: userId,
        });
        await project.save();

        res.json({
            projectData: {
                _id: project._id.valueOf(),
                projectName: project.projectName,
                projectDescription: project.projectDescription,
                user: project.user,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

const createIssue = async (req, res) => {
    const { projectId } = req.params;
    const { subject, description, labels, author } = req.body;

    var id = mongoose.Types.ObjectId(author);

    try {
        // check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const issue = new Issue({
            subject,
            description,
            labels,
            project: projectId,
            author: id,
        });

        await issue.save();
        res.status(201).json({ message: "Issue created successfully", issue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const createActivity = async (req, res) => {
    const { projectId, issueId } = req.params;
    const { action, user } = req.body;

    try {
        // check if project and issue exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const issue = await Issue.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        const activity = new Activity({
            action,
            project: projectId,
            issue: issueId,
            user: user,
        });

        issue.activity.push(activity);

        await activity.save();
        await issue.save();
        res.status(201).json({
            message: "Activity created successfully",
            activity,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getActivitiesForIssue = async (req, res) => {
    const issueId = req.params.id;

    console.log(issueId);

    // Find the issue and populate the "project" and "createdBy" fields
    const issue = await Issue.findById(issueId)
        .populate("project", "projectName")
        .populate("author", "username");

    if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
    }

    // Find all activities related to the issue and populate the "user" field
    const activities = await Activity.find({ issue: issueId })
        .populate("user", "username")
        .sort({ createdAt: "desc" });

    res.json({ issue, activities });
};

const getIssueById = async (req, res) => {
    const issueId = req.params.id;

    // Find the issue and populate the "project" and "createdBy" fields
    const issue = await Issue.findById(issueId)
        .populate("project", "projectName")
        .populate("author", "username");

    if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
    }

    res.json({ issue });
};

const updateIsFixedIssue = async (req, res) => {
    const issueId = req.params.id;
    const { isFixed } = req.body;

    try {
        const issue = await Issue.findByIdAndUpdate(
            issueId,
            { isFixed },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }

        res.json({ success: true, issue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

function timeSince(timestamp) {
    let time = Date.parse(timestamp);
    let now = Date.now();
    let secondsPast = (now - time) / 1000;
    let suffix = "ago";

    let intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
    };

    for (let i in intervals) {
        let interval = intervals[i];
        if (secondsPast >= interval) {
            let count = Math.floor(secondsPast / interval);
            return `${count} ${i} ${count > 1 ? "s" : ""} ${suffix}`;
        }
    }
}

const searchIssues = async (req, res) => {
    try {
        const { subject, description, author, labels } = req.body;
        const { projectId } = req.params;

        let authorObj = null;
        if (author) {
            authorObj = await User.findOne({
                $or: [
                    { username: new RegExp(author, "i") },
                    { email: new RegExp(author, "i") },
                ],
            });
        }

        const searchQuery = {};
        if (subject) searchQuery.subject = new RegExp(subject, "i");
        if (description) searchQuery.description = new RegExp(description, "i");
        if (author) searchQuery.author = authorObj._id;
        if (labels) searchQuery.labels = { $all: labels };

        const issues = await Issue.find({ project: projectId, ...searchQuery });

        res.status(200).json({
            issues,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export {
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
};
