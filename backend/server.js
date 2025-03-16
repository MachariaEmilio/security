// // server.js (Express.js Backend)
// const express = require("express");
// const { spawn } = require("child_process");
// const fs = require("fs");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const xmljs = require("xml-js");
// const path = require("path");

// const app = express();
// const port = 3001;

// app.use(cors());
// app.use(bodyParser.text({ type: "application/xml", limit: "10mb" }));

// app.post("/process-image", (req, res) => {
//   try {
//     const xml = req.body;
//     const js = xmljs.xml2js(xml, { compact: true });
//     const base64Image = js.image._text;
//     const imageFormat = js.image._attributes.format;

//     const imageBuffer = Buffer.from(base64Image, "base64");
//     const filename = `uploaded.${imageFormat.split("/")[1]}`;
//     const updatesFolderPath = path.join(__dirname, "updates");

//     if (!fs.existsSync(updatesFolderPath)) {
//       fs.mkdirSync(updatesFolderPath);
//     }

//     const imagePath = path.join(updatesFolderPath, filename);
//     console.log("Generated filename:", filename);
//     console.log("Image Format: ", imageFormat);
//     console.log("image format split: ", imageFormat.split("/"));
//     fs.writeFile(imagePath, imageBuffer, (err) => {
//       if (err) {
//         console.error("Error writing file:", err);
//         fs.writeFile(imagePath, imageBuffer, (err) => {
//           if (err) {
//             console.error("Error writing file:", err);
//             console.error("Image path:", imagePath);
//             console.error("Filename:", filename);
//             return res.status(500).json({ error: "File system error" });
//           }
//           // ...
//         });
//         return res.status(500).json({ error: "File system error" });
//       }

//       const cppExecutable = "./cpp_program.exe";

//       if (!fs.existsSync(cppExecutable)) {
//         return res.status(500).json({ error: "C++ program not found." });
//       }

//       const cppProcess = spawn(cppExecutable, [imagePath]);
//       let cppOutput = "";
//       let cppError = "";

//       cppProcess.stdout.on("data", (data) => {
//         cppOutput += data.toString();
//       });

//       cppProcess.stderr.on("data", (data) => {
//         cppError += data.toString();
//       });

//       cppProcess.on("close", (code) => {
//         console.log(`C++ process exited with code ${code}`);
//         console.log("C++ output:", cppOutput.trim());
//         console.log("C++ error:", cppError.trim());

//         if (code === 0) {
//           const response = { result: cppOutput.trim() };
//           console.log("Sending JSON:", response);
//           res.json(response);
//           fs.unlink(imagePath, (unlinkErr) => {
//             if (unlinkErr) {
//               console.error("Error deleting file:", unlinkErr);
//             }
//           });
//         } else {
//           const response = { error: cppError.trim() };
//           console.log("Sending JSON:", response);
//           res.status(500).json(response);
//           fs.unlink(imagePath, (unlinkErr) => {
//             if (unlinkErr) {
//               console.error("Error deleting file:", unlinkErr);
//             }
//           });
//         }
//       });
//     });
//   } catch (error) {
//     console.error("XML processing error:", error);
//     res.status(400).json({ error: "Invalid XML data." });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });


// server.js (Express.js Backend)
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.text({ type: "application/xml", limit: "10mb" }));

app.post("/process-image", (req, res) => {
  try {
    const xml = req.body; // The XML string as received

    const filename = `uploaded_${Date.now()}.xml`; // Generate a unique filename
    const updatesFolderPath = path.join(__dirname, "updates");

    if (!fs.existsSync(updatesFolderPath)) {
      fs.mkdirSync(updatesFolderPath);
    }

    const filePath = path.join(updatesFolderPath, filename);

    fs.writeFile(filePath, xml, (err) => {
      if (err) {
        console.error("Error writing XML file:", err);
        return res.status(500).json({ error: "File system error" });
      }

      console.log(`XML file saved to: ${filePath}`);

      // Optional: Send a response back to the client
      res.json({ message: "XML file saved successfully." });
    });
  } catch (error) {
    console.error("Error processing XML:", error);
    res.status(500).json({ error: "Error processing XML." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});