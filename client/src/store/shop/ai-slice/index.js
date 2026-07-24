import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const initialState = {
  // Chatbot
  chatMessages: [],
  chatLoading: false,

  // Smart Search
  smartSearchResults: [],
  smartSearchLoading: false,

  // Visual Search
  visualSearchResults: null,
  visualSearchLoading: false,

  // Auto-Tag
  autoTagResults: null,
  autoTagLoading: false,

  // Description Generator
  generatedDescription: "",
  descriptionLoading: false,

  // Review Summary
  reviewSummary: null,
  reviewSummaryLoading: false,

  // Sentiment
  sentimentData: [],
  sentimentLoading: false,

  // Recommendations
  recommendations: [],
  recommendationsLoading: false,

  // Sales Insights
  salesInsights: null,
  salesInsightsLoading: false,
};

// Feature 1: AI Chat
export const sendChatMessage = createAsyncThunk(
  "ai/sendChatMessage",
  async ({ message, history }) => {
    const result = await axios.post(`${API_URL}/api/ai/chat`, {
      message,
      history,
    });
    return result?.data;
  }
);

// Feature 2: AI Smart Search
export const aiSmartSearch = createAsyncThunk(
  "ai/smartSearch",
  async (query) => {
    const result = await axios.post(`${API_URL}/api/ai/search`, { query });
    return result?.data;
  }
);

// Feature 3: Visual Search
export const aiVisualSearch = createAsyncThunk(
  "ai/visualSearch",
  async (formData) => {
    const result = await axios.post(`${API_URL}/api/ai/visual-search`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return result?.data;
  }
);

// Feature 4: Auto-Tag
export const aiAutoTag = createAsyncThunk(
  "ai/autoTag",
  async (imageUrl) => {
    const result = await axios.post(`${API_URL}/api/ai/auto-tag`, { imageUrl });
    return result?.data;
  }
);

// Feature 5: Generate Description
export const aiGenerateDescription = createAsyncThunk(
  "ai/generateDescription",
  async ({ title, category, brand, price }) => {
    const result = await axios.post(`${API_URL}/api/ai/generate-description`, {
      title,
      category,
      brand,
      price,
    });
    return result?.data;
  }
);

// Feature 6: Review Summary
export const aiGetReviewSummary = createAsyncThunk(
  "ai/getReviewSummary",
  async (productId) => {
    const result = await axios.get(
      `${API_URL}/api/ai/review-summary/${productId}`
    );
    return result?.data;
  }
);

// Feature 7: Sentiment Analysis
export const aiGetSentiment = createAsyncThunk(
  "ai/getSentiment",
  async (productId) => {
    const result = await axios.get(
      `${API_URL}/api/ai/sentiment/${productId}`
    );
    return result?.data;
  }
);

// Feature 8: Recommendations
export const aiGetRecommendations = createAsyncThunk(
  "ai/getRecommendations",
  async (productId) => {
    const result = await axios.get(
      `${API_URL}/api/ai/recommendations/${productId}`
    );
    return result?.data;
  }
);

// Feature 9: Sales Insights
export const aiGetSalesInsights = createAsyncThunk(
  "ai/getSalesInsights",
  async () => {
    const result = await axios.get(`${API_URL}/api/ai/sales-insights`);
    return result?.data;
  }
);

const aiSlice = createSlice({
  name: "shopAI",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.chatMessages.push({
        role: "user",
        content: action.payload,
      });
    },
    clearChat: (state) => {
      state.chatMessages = [];
    },
    clearSmartSearch: (state) => {
      state.smartSearchResults = [];
    },
    clearVisualSearch: (state) => {
      state.visualSearchResults = null;
    },
    clearGeneratedDescription: (state) => {
      state.generatedDescription = "";
    },
    clearReviewSummary: (state) => {
      state.reviewSummary = null;
    },
    clearSentiment: (state) => {
      state.sentimentData = [];
    },
    clearRecommendations: (state) => {
      state.recommendations = [];
    },
    clearAutoTag: (state) => {
      state.autoTagResults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Chat
      .addCase(sendChatMessage.pending, (state) => {
        state.chatLoading = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          role: "assistant",
          content: action.payload.data.message,
          products: action.payload.data.recommendedProducts || [],
        });
      })
      .addCase(sendChatMessage.rejected, (state) => {
        state.chatLoading = false;
        state.chatMessages.push({
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again! 🙏",
          products: [],
        });
      })
      // Smart Search
      .addCase(aiSmartSearch.pending, (state) => {
        state.smartSearchLoading = true;
      })
      .addCase(aiSmartSearch.fulfilled, (state, action) => {
        state.smartSearchLoading = false;
        state.smartSearchResults = action.payload.data;
      })
      .addCase(aiSmartSearch.rejected, (state) => {
        state.smartSearchLoading = false;
        state.smartSearchResults = [];
      })
      // Visual Search
      .addCase(aiVisualSearch.pending, (state) => {
        state.visualSearchLoading = true;
      })
      .addCase(aiVisualSearch.fulfilled, (state, action) => {
        state.visualSearchLoading = false;
        state.visualSearchResults = action.payload.data;
      })
      .addCase(aiVisualSearch.rejected, (state) => {
        state.visualSearchLoading = false;
        state.visualSearchResults = null;
      })
      // Auto-Tag
      .addCase(aiAutoTag.pending, (state) => {
        state.autoTagLoading = true;
      })
      .addCase(aiAutoTag.fulfilled, (state, action) => {
        state.autoTagLoading = false;
        state.autoTagResults = action.payload.data;
      })
      .addCase(aiAutoTag.rejected, (state) => {
        state.autoTagLoading = false;
        state.autoTagResults = null;
      })
      // Description Generator
      .addCase(aiGenerateDescription.pending, (state) => {
        state.descriptionLoading = true;
      })
      .addCase(aiGenerateDescription.fulfilled, (state, action) => {
        state.descriptionLoading = false;
        state.generatedDescription = action.payload.data.description;
      })
      .addCase(aiGenerateDescription.rejected, (state) => {
        state.descriptionLoading = false;
        state.generatedDescription = "";
      })
      // Review Summary
      .addCase(aiGetReviewSummary.pending, (state) => {
        state.reviewSummaryLoading = true;
      })
      .addCase(aiGetReviewSummary.fulfilled, (state, action) => {
        state.reviewSummaryLoading = false;
        state.reviewSummary = action.payload.data;
      })
      .addCase(aiGetReviewSummary.rejected, (state) => {
        state.reviewSummaryLoading = false;
        state.reviewSummary = null;
      })
      // Sentiment
      .addCase(aiGetSentiment.pending, (state) => {
        state.sentimentLoading = true;
      })
      .addCase(aiGetSentiment.fulfilled, (state, action) => {
        state.sentimentLoading = false;
        state.sentimentData = action.payload.data;
      })
      .addCase(aiGetSentiment.rejected, (state) => {
        state.sentimentLoading = false;
        state.sentimentData = [];
      })
      // Recommendations
      .addCase(aiGetRecommendations.pending, (state) => {
        state.recommendationsLoading = true;
      })
      .addCase(aiGetRecommendations.fulfilled, (state, action) => {
        state.recommendationsLoading = false;
        state.recommendations = action.payload.data;
      })
      .addCase(aiGetRecommendations.rejected, (state) => {
        state.recommendationsLoading = false;
        state.recommendations = [];
      })
      // Sales Insights
      .addCase(aiGetSalesInsights.pending, (state) => {
        state.salesInsightsLoading = true;
      })
      .addCase(aiGetSalesInsights.fulfilled, (state, action) => {
        state.salesInsightsLoading = false;
        state.salesInsights = action.payload.data;
      })
      .addCase(aiGetSalesInsights.rejected, (state) => {
        state.salesInsightsLoading = false;
        state.salesInsights = null;
      });
  },
});

export const {
  addUserMessage,
  clearChat,
  clearSmartSearch,
  clearVisualSearch,
  clearGeneratedDescription,
  clearReviewSummary,
  clearSentiment,
  clearRecommendations,
  clearAutoTag,
} = aiSlice.actions;

export default aiSlice.reducer;
