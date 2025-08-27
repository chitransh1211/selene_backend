import mongoose from "mongoose";

const appConfigSchema = new mongoose.Schema(
  {
    miniNavContent: {
      linkTo: {
        type: String,
        required: true,
        trim: true
      },
      text: {
        type: String,
        required: true,
        trim: true
      }
    },
    logo: {
      type: String,
      required: true
    },
    gridLayout: {
      type: Number,
      default: 3, // You can change this default
      min: 1
    },
    banner: {
      linkTo: {
        type: String,
        required: true,
        trim: true
      },
      image: [{
        type: String,
        required: true,
        trim: true
      }]
    }
  },
  { timestamps: true }
);

export const AppConfig = mongoose.model("AppConfig", appConfigSchema);
