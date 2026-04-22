import mongoose from "mongoose";

// Document model for storing document metadata and version information
const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Document",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    latestVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Version",
      default: null,
    },
    latestContentHash: {
      type: String,
      default: "",
      index: true,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
