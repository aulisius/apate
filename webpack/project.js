const path = require("path");
// ========================================================
// Project Structure
// ========================================================
const basePath = path.resolve(__dirname, "..");
const srcDir = "src";
const distDir = "dist";
const publicDir = "public";

// ------------------------------------
// Utilities
// ------------------------------------
const base = (...args) => path.resolve(basePath, ...args);

module.exports = {
  base,
  src: base.bind(null, srcDir),
  public: base.bind(null, publicDir),
  dist: base.bind(null, distDir)
};
