const express = require("express");
const { addFeatureImage, getFeaturesImages } = require("../../controllers/common/feature-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { adminOnly } = require("../../middlewares/auth-middleware");

const router = express.Router();

// Write route — admin only (viewers blocked at server level)
router.post("/add", authMiddleware, adminOnly, addFeatureImage);

// Read route — open to all
router.get("/get", getFeaturesImages);

module.exports = router;
