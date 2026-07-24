const Product = require("../../models/Product");
const Order = require("../../models/Order");
const ProductReview = require("../../models/Review");
const {
  generateText,
  generateChat,
  analyzeImage,
  getCached,
  setCache,
} = require("../../helpers/gemini-service");

// ═══════════════════════════════════════════════════════════
// Feature 1: AI Shopping Assistant (Chatbot)
// ═══════════════════════════════════════════════════════════
const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Fetch max 15 products to give AI context without exceeding token limits
    const products = await Product.find({}).limit(15).lean();
    const productCatalog = products
      .map(
        (p) =>
          `- ID:${p._id} | "${p.title.substring(0, 30)}" | ${p.category} | $${p.salePrice > 0 ? p.salePrice : p.price}`
      )
      .join("\n");

    const systemPrompt = `You are ShopEasy AI, a friendly and helpful shopping assistant for an e-commerce fashion store. 
You help customers find products, answer questions about items, and provide fashion advice.

CURRENT PRODUCT CATALOG:
${productCatalog}

RULES:
1. Be conversational, friendly, and helpful. Use emojis occasionally.
2. When recommending products, mention their actual names and prices from the catalog.
3. If a user asks about products not in the catalog, politely say you don't carry those but suggest similar items you do have.
4. When you recommend specific products, include their IDs in this format at the END of your message on a new line: [PRODUCTS: id1, id2, id3]
5. Keep responses concise (2-4 sentences for simple queries, up to 6 for detailed recommendations).
6. If asked about shipping, returns, etc., say the customer should check the account section or contact support.
7. Never make up product details — only use what's in the catalog.`;

    const aiResponse = await generateChat(systemPrompt, history, message);

    // Extract product IDs if AI recommended any
    const productIdMatch = aiResponse.match(/\[PRODUCTS:\s*([^\]]+)\]/);
    let recommendedProducts = [];
    let cleanResponse = aiResponse;

    if (productIdMatch) {
      cleanResponse = aiResponse.replace(/\[PRODUCTS:[^\]]+\]/, "").trim();
      const ids = productIdMatch[1].split(",").map((id) => id.trim());
      recommendedProducts = products.filter((p) =>
        ids.includes(p._id.toString())
      );
    }

    res.status(200).json({
      success: true,
      data: {
        message: cleanResponse,
        recommendedProducts,
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: "AI assistant is temporarily unavailable",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Feature 2: AI Smart Search
// ═══════════════════════════════════════════════════════════
const smartSearch = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Limit to 20 products to prevent token exhaustion
    const products = await Product.find({}).limit(20).lean();

    const productList = products
      .map(
        (p, i) =>
          `${i}. ID:${p._id} | "${p.title}" | ${p.category} | $${p.salePrice > 0 ? p.salePrice : p.price} | "${p.description.substring(0, 50)}..."`
      )
      .join("\n");

    const systemPrompt = `You are a product search engine for a fashion e-commerce store. Given a natural language search query, rank products by relevance.

PRODUCT CATALOG:
${productList}

RULES:
1. Return ONLY a JSON array of product indices (0-based) sorted by relevance to the query.
2. Return at most 12 products.
3. Consider semantic meaning, not just keywords. For example "something for a party" should match elegant/formal clothing.
4. If nothing matches well, return an empty array [].
5. Return ONLY the JSON array, nothing else. Example: [2, 5, 0, 8]`;

    const aiResponse = await generateText(systemPrompt, query);

    // Parse the AI response to get indices
    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
    let indices = [];
    try {
      indices = JSON.parse(cleanedResponse);
    } catch {
      // Fallback: try to extract numbers
      indices = cleanedResponse.match(/\d+/g)?.map(Number) || [];
    }

    // Map indices to actual products
    const results = indices
      .filter((i) => i >= 0 && i < products.length)
      .map((i) => products[i]);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Smart search error:", error);
    res.status(500).json({
      success: false,
      message: "AI search is temporarily unavailable",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Feature 3: Visual Search (Image Search)
// ═══════════════════════════════════════════════════════════
const visualSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    // Step 1: Ask Gemini to describe the image
    const description = await analyzeImage(
      imageBase64,
      mimeType,
      "Describe this clothing/fashion item in detail. Include: type of item (shirt, shoes, etc.), color, style (casual, formal, sporty), gender target (men, women, kids), and any brand if visible. Keep it to 2-3 sentences."
    );

    // Step 2: Use the description to search max 20 products
    const products = await Product.find({}).limit(20).lean();
    const productList = products
      .map(
        (p, i) =>
          `${i}. "${p.title}" | ${p.category} | "${p.description.substring(0, 50)}..."`
      )
      .join("\n");

    const searchPrompt = `Based on this image description: "${description}"

Find the most similar products from this catalog:
${productList}

Return ONLY a JSON array of product indices (0-based) sorted by similarity. Max 8 results. Example: [2, 5, 0]
If nothing matches, return [].`;

    const aiResponse = await generateText(
      "You are a visual product matcher. Return only JSON arrays.",
      searchPrompt
    );

    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
    let indices = [];
    try {
      indices = JSON.parse(cleanedResponse);
    } catch {
      indices = cleanedResponse.match(/\d+/g)?.map(Number) || [];
    }

    const results = indices
      .filter((i) => i >= 0 && i < products.length)
      .map((i) => products[i]);

    res.status(200).json({
      success: true,
      data: {
        imageDescription: description,
        matchingProducts: results,
      },
    });
  } catch (error) {
    console.error("Visual search error:", error);
    res.status(500).json({
      success: false,
      message: "Visual search is temporarily unavailable",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Feature 4: Smart Auto-Tagging
// ═══════════════════════════════════════════════════════════
const autoTagProduct = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    // Fetch the image and convert to base64 using built-in https
    const https = require("https");
    const http = require("http");
    const imageBuffer = await new Promise((resolve, reject) => {
      const client = imageUrl.startsWith("https") ? https : http;
      client.get(imageUrl, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      }).on("error", reject);
    });
    const imageBase64 = imageBuffer.toString("base64");
    const mimeType = "image/jpeg";

    const prompt = `Analyze this product image for an e-commerce fashion store. Return a JSON object with these exact fields:
{
  "category": one of ["men", "women", "kids", "accessories", "footwear"],
  "suggestedBrand": one of ["nike", "adidas", "puma", "levi", "zara", "h&m"] or "unknown",
  "description": "A compelling 2-3 sentence product description for e-commerce",
  "suggestedTitle": "A catchy product title"
}
Return ONLY the JSON object, nothing else.`;

    const aiResponse = await analyzeImage(imageBase64, mimeType, prompt);

    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
    let tags = {};
    try {
      tags = JSON.parse(cleanedResponse);
    } catch {
      tags = { error: "Could not parse AI response", raw: cleanedResponse };
    }

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Auto-tag error:", error);
    res.status(500).json({
      success: false,
      message: "Auto-tagging is temporarily unavailable",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Feature 5: AI Product Description Generator
// ═══════════════════════════════════════════════════════════
const generateDescription = async (req, res) => {
  try {
    const { title, category, brand, price } = req.body;

    if (!title || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: "Title, category, and brand are required",
      });
    }

    const prompt = `Write a compelling, SEO-friendly product description for an e-commerce store.

Product Details:
- Title: ${title}
- Category: ${category}
- Brand: ${brand}
- Price: $${price || "N/A"}

RULES:
1. Write exactly 2-3 sentences.
2. Be engaging and persuasive — make the customer want to buy it.
3. Mention key features, materials, or occasions where applicable.
4. Do NOT use markdown formatting, bullet points, or special characters.
5. Return ONLY the description text, nothing else.`;

    const description = await generateText(
      "You are an expert e-commerce copywriter who writes compelling product descriptions.",
      prompt
    );

    res.status(200).json({
      success: true,
      data: { description: description.trim() },
    });
  } catch (error) {
    console.error("Generate description error:", error);
    res.status(500).json({
      success: false,
      message: "Description generation is temporarily unavailable",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Feature 6: AI Review Summarizer
// ═══════════════════════════════════════════════════════════
const summarizeReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check cache first
    const cacheKey = `review-summary-${productId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    const reviews = await ProductReview.find({ productId }).lean();

    if (!reviews || reviews.length < 3) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "Not enough reviews to summarize (need at least 3)",
      });
    }

    const reviewTexts = reviews
      .map(
        (r) => `- ${r.userName} (${r.reviewValue}/5): "${r.reviewMessage}"`
      )
      .join("\n");

    const prompt = `Summarize these customer reviews in 2-3 concise sentences. Highlight the main positives, any negatives, and common themes. Be balanced and honest.

Reviews:
${reviewTexts}

Return ONLY the summary text, no formatting or labels.`;

    const summary = await generateText(
      "You are a helpful review analyst who creates concise, balanced summaries.",
      prompt
    );

    const result = { summary: summary.trim(), reviewCount: reviews.length };
    setCache(cacheKey, result);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Review summary error:", error);
    res.status(500).json({
      success: false,
      message: "Review summarization is temporarily unavailable",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Feature 7: Sentiment Analysis
// ═══════════════════════════════════════════════════════════
const analyzeSentiment = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check cache first
    const cacheKey = `sentiment-${productId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    const reviews = await ProductReview.find({ productId }).lean();

    if (!reviews || reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const reviewTexts = reviews
      .map((r, i) => `${i}. "${r.reviewMessage}" (${r.reviewValue}/5 stars)`)
      .join("\n");

    const prompt = `Classify each review's sentiment as "positive", "neutral", or "negative".

Reviews:
${reviewTexts}

Return ONLY a JSON array of objects with index and sentiment, like:
[{"index": 0, "sentiment": "positive"}, {"index": 1, "sentiment": "negative"}]`;

    const aiResponse = await generateText(
      "You are a sentiment analysis engine. Return only JSON.",
      prompt
    );

    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
    let sentiments = [];
    try {
      sentiments = JSON.parse(cleanedResponse);
    } catch {
      // Fallback: mark all by star rating
      sentiments = reviews.map((r, i) => ({
        index: i,
        sentiment:
          r.reviewValue >= 4
            ? "positive"
            : r.reviewValue >= 3
              ? "neutral"
              : "negative",
      }));
    }

    // Map sentiments to review IDs
    const result = sentiments.map((s) => ({
      reviewId: reviews[s.index]?._id?.toString(),
      sentiment: s.sentiment,
    }));

    setCache(cacheKey, result);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Sentiment error:", error);
    res.status(500).json({
      success: false,
      message: "Sentiment analysis is temporarily unavailable",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Feature 8: AI Product Recommendations
// ═══════════════════════════════════════════════════════════
const getRecommendations = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check cache first
    const cacheKey = `recommendations-${productId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    const currentProduct = await Product.findById(productId).lean();
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Limit to 15 products to save tokens
    const otherProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(15).lean();

    if (otherProducts.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const productList = otherProducts
      .map(
        (p, i) =>
          `${i}. "${p.title}" | ${p.category} | "${p.description.substring(0, 50)}..."`
      )
      .join("\n");

    const prompt = `Current product: "${currentProduct.title}" | ${currentProduct.category} | ${currentProduct.brand} | $${currentProduct.salePrice > 0 ? currentProduct.salePrice : currentProduct.price} | "${currentProduct.description}"

Find the 4 most similar/complementary products from this list:
${productList}

Return ONLY a JSON array of indices (0-based). Example: [2, 5, 0, 8]`;

    const aiResponse = await generateText(
      "You are a product recommendation engine. Return only JSON arrays.",
      prompt
    );

    const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
    let indices = [];
    try {
      indices = JSON.parse(cleanedResponse);
    } catch {
      indices = cleanedResponse.match(/\d+/g)?.map(Number) || [];
    }

    const recommendations = indices
      .filter((i) => i >= 0 && i < otherProducts.length)
      .slice(0, 4)
      .map((i) => otherProducts[i]);

    setCache(cacheKey, recommendations);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Recommendations are temporarily unavailable",
    });
  }
};

// ═══════════════════════════════════════════════════════════
// Feature 9: AI Sales Insights
// ═══════════════════════════════════════════════════════════
const getSalesInsights = async (req, res) => {
  try {
    // Check cache (insights don't change every second)
    const cacheKey = "sales-insights";
    const cached = getCached(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    const orders = await Order.find({}).lean();
    const products = await Product.find({}).lean();

    // Calculate raw stats
    const totalOrders = orders.length;
    const confirmedOrders = orders.filter(
      (o) => o.orderStatus === "confirmed"
    );
    const totalRevenue = confirmedOrders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0
    );
    const avgOrderValue =
      confirmedOrders.length > 0 ? totalRevenue / confirmedOrders.length : 0;

    // Category breakdown
    const categoryCount = {};
    const brandCount = {};
    const productSales = {};

    confirmedOrders.forEach((order) => {
      (order.cartItems || []).forEach((item) => {
        const product = products.find(
          (p) => p._id.toString() === item.productId
        );
        if (product) {
          categoryCount[product.category] =
            (categoryCount[product.category] || 0) + item.quantity;
          brandCount[product.brand] =
            (brandCount[product.brand] || 0) + item.quantity;
          productSales[product.title] =
            (productSales[product.title] || 0) + item.quantity;
        }
      });
    });

    // Top products
    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));

    // Low stock alerts
    const lowStockProducts = products
      .filter((p) => p.totalStock <= 5)
      .map((p) => ({ title: p.title, stock: p.totalStock }));

    const stats = {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      confirmedOrders: confirmedOrders.length,
      totalProducts: products.length,
      categoryBreakdown: categoryCount,
      brandBreakdown: brandCount,
      topProducts,
      lowStockProducts,
    };

    // Get AI insights only if there are orders
    let aiInsights = "No order data available yet to generate insights.";
    if (totalOrders > 0) {
      const dataForAI = `
Sales Data Summary:
- Total Orders: ${totalOrders}
- Confirmed Orders: ${confirmedOrders.length}
- Total Revenue: $${stats.totalRevenue}
- Average Order Value: $${stats.avgOrderValue}
- Total Products in Store: ${products.length}
- Category Sales: ${JSON.stringify(categoryCount)}
- Brand Sales: ${JSON.stringify(brandCount)}
- Top Products: ${topProducts.map((p) => `${p.name} (${p.sales} sold)`).join(", ")}
- Low Stock Items: ${lowStockProducts.length > 0 ? lowStockProducts.map((p) => `${p.title} (${p.stock} left)`).join(", ") : "None"}`;

      const prompt = `Analyze this e-commerce sales data and provide exactly 5 actionable business insights. 

${dataForAI}

RULES:
1. Each insight should be 1-2 sentences.
2. Include specific numbers from the data.
3. Suggest concrete actions (restock, promote, discount, etc.).
4. Number each insight 1-5.
5. No markdown formatting — just plain numbered text.`;

      aiInsights = await generateText(
        "You are an expert e-commerce business analyst providing actionable insights from sales data.",
        prompt
      );
    }

    const result = {
      stats,
      aiInsights: aiInsights.trim(),
    };

    setCache(cacheKey, result);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Sales insights error:", error);
    res.status(500).json({
      success: false,
      message: "Sales insights are temporarily unavailable",
    });
  }
};

module.exports = {
  chatWithAssistant,
  smartSearch,
  visualSearch,
  autoTagProduct,
  generateDescription,
  summarizeReviews,
  analyzeSentiment,
  getRecommendations,
  getSalesInsights,
};
