import { mongoose, Schema } from "mongoose";
const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        
        image: {
            type: String
        },
        

    },
    { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);