// server.js (Express.js API)
const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post(
  "/process-image",
  (req, res, next) => {
    console.log("multer middleware about to run");
    upload.single("image")(req, res, (err) => {
      console.log("multer middleware ran");
      if (err) {
        console.error("multer error:", err);
        return res.status(500).json({ error: "File upload error" });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    const imagePath = req.file.path;
    const cppExecutable = "./cpp_program.exe";

    if (!fs.existsSync(cppExecutable)) {
      return res.status(500).json({ error: "C++ program not found." });
    }

    const cppProcess = spawn(cppExecutable, [imagePath]);
    let cppOutput = "";
    let cppError = "";

    cppProcess.stdout.on("data", (data) => {
      cppOutput += data.toString();
    });

    cppProcess.stderr.on("data", (data) => {
      cppError += data.toString();
    });

    cppProcess.on("close", (code) => {
      console.log(`C++ process exited with code ${code}`);
      if (code === 0) {
        console.log("C++ output:", cppOutput.trim());
        res.json({ result: cppOutput.trim() });
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      } else {
        console.error("C++ error:", cppError.trim());
        res.status(500).json({ error: cppError.trim() });
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }
    });
  }
);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
