import express from "express";
import Document from "../models/Document.js";
import Version from "../models/Version.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes here are protected by the auth middleware
router.use(authMiddleware);

// GET /api/documents
// Get all documents for the logged in user
router.get("/", async (req, res) => {
  try {
    // req.user.id comes from the decoded JWT in the authMiddleware
    const documents = await Document.find({ owner: req.user.id }).sort({ updatedAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// POST /api/documents
// Create a new document
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    // Create the document
    const document = new Document({
      title: title || "Untitled Document",
      owner: req.user.id,
      currentVersion: 1,
    });
    
    await document.save();

    // Create the initial Version 1 (empty content)
    const initialVersion = new Version({
      documentId: document._id,
      versionNumber: 1,
      content: "<p></p>", // Empty paragraph for tiptap
      createdBy: req.user.id,
    });
    
    await initialVersion.save();

    res.json({ document, initialVersion });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// GET /api/documents/:id
// Get a specific document
router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Make sure the user owns this document
    if (document.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Fetch the content for the current version
    const currentVersion = await Version.findOne({
      documentId: document._id,
      versionNumber: document.currentVersion,
    });

    res.json({ document, content: currentVersion ? currentVersion.content : "" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(500).send("Server Error");
  }
});

// PUT /api/documents/:id
// Update document title
router.put("/:id", async (req, res) => {
  try {
    const { title } = req.body;
    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    document.title = title || "Untitled Document";
    await document.save();

    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(500).send("Server Error");
  }
});

// DELETE /api/documents/:id
// Delete a document and all its versions
router.delete("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Delete the document itself
    await Document.findByIdAndDelete(req.params.id);
    
    // Also delete all versions associated with this document
    await Version.deleteMany({ documentId: req.params.id });

    res.json({ message: "Document removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(500).send("Server Error");
  }
});

export default router;
