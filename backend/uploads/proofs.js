const fs = require("fs");
const path = require("path");

// Full upload folder path
const uploadPath = path.join(__dirname, "proofs");

// Create folder automatically if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("✅ uploads/proofs folder created");
} else {
  console.log("✅ uploads/proofs already exists");
}

module.exports = uploadPath;