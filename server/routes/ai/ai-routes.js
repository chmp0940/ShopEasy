const express = require("express");
const multer = require("multer");
const {
  chatWithAssistant,
  smartSearch,
  visualSearch,
  autoTagProduct,
  generateDescription,
  summarizeReviews,
  analyzeSentiment,
  getRecommendations,
  getSalesInsights,
} = require("../../controllers/ai/ai-controller");

const router = express.Router();

// Multer config for visual search image uploads (in-memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Feature 1: AI Chatbot
router.post("/chat", chatWithAssistant);

// Feature 2: AI Smart Search
router.post("/search", smartSearch);

// Feature 3: Visual Search
router.post("/visual-search", upload.single("image"), visualSearch);

// Feature 4: Auto-Tag Product
router.post("/auto-tag", autoTagProduct);

// Feature 5: Generate Product Description
router.post("/generate-description", generateDescription);

// Feature 6: Review Summarizer
router.get("/review-summary/:productId", summarizeReviews);

// Feature 7: Sentiment Analysis
router.get("/sentiment/:productId", analyzeSentiment);

// Feature 8: Recommendations
router.get("/recommendations/:productId", getRecommendations);

// Feature 9: Sales Insights
router.get("/sales-insights", getSalesInsights);

module.exports = router;
