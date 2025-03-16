// App.jsx (React Frontend)
import React, { useState, useRef } from "react";
import axios from "axios";
import * as xmljs from "xml-js";

function ImageUploader() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file) => {
    setImage(file);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleClearImage = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!image) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result.split(",")[1];
      const xml = xmljs.js2xml(
        {
          image: {
            _attributes: {
              format: image.type,
            },
            _text: base64Image,
          },
        },
        { compact: true, ignoreComment: true, spaces: 4 }
      );

      try {
        const response = await axios.post(
          "http://localhost:3001/process-image",
          xml,
          {
            headers: {
              "Content-Type": "application/xml",
            },
          }
        );
        setResult(response.data.message);
        setError(null);
      } catch (err) {
        if (err.response) {
          setError(
            `Error: ${err.response.status} ${err.response.statusText} - ${
              err.response.data.error || "An error occurred."
            }`
          );
          console.log(err);
        } else if (err.request) {
          setError("Network error: No response from server.");
          console.log(err);
        } else {
          setError("An unexpected error occurred.");
          console.log(err);
        }
        setResult(null);
      }
    };
    reader.readAsDataURL(image);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {preview ? (
        <div>
          <img
            src={preview}
            alt="Uploaded"
            style={{ maxWidth: "500px", maxHeight: "500px" }}
          />
          <div style={{ marginTop: "10px" }}>
            <button onClick={handleClearImage}>Delete Image</button>
            <button onClick={handleBrowseClick}>Change Image</button>
            <button onClick={handleSubmit}>Process Image</button>
          </div>
        </div>
      ) : (
        <div
          style={{
            border: "2px dashed #ccc",
            padding: "50px",
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={handleBrowseClick}
        >
          <p>Drag & Drop an image here or click to browse</p>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        ref={fileInputRef}
      />
      {result && <div style={{ marginTop: "20px" }}>Result: {result}</div>}
      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>Error: {error}</div>
      )}
    </div>
  );
}

export default ImageUploader;
