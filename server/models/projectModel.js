import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
    {
        projectName: {
            type: String,
            required: true,
        },
        projectDescription: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
    },
    { timestamps: true }
);

const ProjectModel = mongoose.model("Project", projectSchema);
export default ProjectModel;
