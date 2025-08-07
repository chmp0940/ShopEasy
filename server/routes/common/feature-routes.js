const express = require("express");
const { addFeatureImage,getFeaturesImages } = require("../../controllers/common/feature-controller");

const router = express.Router();

router.post("/add", addFeatureImage);
router.get("/get", getFeaturesImages);

module.exports = router;
