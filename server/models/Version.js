import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    content: {
      type: String, // Tiptap HTML/JSON string
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Version = mongoose.model("Version", versionSchema);
export default Version;
