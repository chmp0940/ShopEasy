const express = require("express");
const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/admin/productsController");
const { upload } = require("../../helpers/cloudinary");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { adminOnly } = require("../../middlewares/auth-middleware");

const router = express.Router();

// Write routes — admin only (viewers blocked at server level)
router.post("/upload-image", authMiddleware, adminOnly, upload.single("my_file"), handleImageUpload);
router.post("/add", authMiddleware, adminOnly, addProduct);
router.put("/edit/:id", authMiddleware, adminOnly, editProduct);
router.delete("/delete/:id", authMiddleware, adminOnly, deleteProduct);

// Read route — open to both admin and viewer
router.get("/get", fetchAllProducts);

module.exports = router;
