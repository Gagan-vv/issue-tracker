import mongoose from "mongoose";
import Activity from "./activityModel.js";

const issueSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        labels: {
            type: [String],
            default: [],
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Project",
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        isFixed: {
            type: Boolean,
            default: false,
        },
        activity: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

const Issue = mongoose.model("Issue", issueSchema);
export default Issue;
