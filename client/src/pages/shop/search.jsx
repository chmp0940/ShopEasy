import ShoppingProductTile from "@/components/shop/productile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import {
  aiSmartSearch,
  aiVisualSearch,
  clearSmartSearch,
  clearVisualSearch,
} from "@/store/shop/ai-slice";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ProductDetailsDialog from "./product-details";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { Skeleton } from "@/components/ui/skeleton";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchResults, isLoading } = useSelector((state) => state.shopSearch);
  const {
    smartSearchResults,
    smartSearchLoading,
    visualSearchResults,
    visualSearchLoading,
  } = useSelector((state) => state.shopAI);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { productDetails } = useSelector((state) => state.shopProducts);

  // Search mode: "keyword" | "ai" | "visual"
  const [searchMode, setSearchMode] = useState("keyword");
  const [aiQuery, setAiQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (
      searchMode === "keyword" &&
      keyword &&
      keyword.trim() !== "" &&
      keyword.trim().length > 3
    ) {
      setTimeout(() => {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
      }, 1000);
    } else if (searchMode === "keyword") {
      setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
      dispatch(resetSearchResults());
    }
  }, [keyword]);

  // Cleanup on mode switch
  useEffect(() => {
    if (searchMode === "keyword") {
      dispatch(clearSmartSearch());
      dispatch(clearVisualSearch());
    } else if (searchMode === "ai") {
      dispatch(resetSearchResults());
      dispatch(clearVisualSearch());
    } else if (searchMode === "visual") {
      dispatch(resetSearchResults());
      dispatch(clearSmartSearch());
    }
  }, [searchMode]);

  function handleAISearch() {
    if (!aiQuery.trim() || aiQuery.trim().length < 3) return;
    dispatch(aiSmartSearch(aiQuery));
  }

  function handleAISearchKeyDown(e) {
    if (e.key === "Enter") {
      handleAISearch();
    }
  }

  function handleVisualSearchUpload(file) {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    dispatch(aiVisualSearch(formData));
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVisualSearchUpload(e.dataTransfer.files[0]);
    }
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];
    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this product`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success === true) {
        dispatch(fetchCartItems(user?.id));
      }
    });
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  // Determine which results to show
  const currentResults =
    searchMode === "ai"
      ? smartSearchResults
      : searchMode === "visual"
        ? visualSearchResults?.matchingProducts || []
        : searchResults;
  const currentLoading =
    searchMode === "ai"
      ? smartSearchLoading
      : searchMode === "visual"
        ? visualSearchLoading
        : isLoading;

  const tabStyles = (active, isAI = false) => ({
    padding: "12px 28px",
    borderRadius: "9999px",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    background: active
      ? isAI 
        ? "linear-gradient(to right, #ec4899, #8b5cf6, #3b82f6)"
        : "linear-gradient(135deg, #1f2937, #4b5563)"
      : "rgba(243, 244, 246, 1)",
    color: active ? "white" : "#6b7280",
    boxShadow: active ? (isAI ? "0 4px 20px rgba(139, 92, 246, 0.4)" : "0 4px 15px rgba(0, 0, 0, 0.2)") : "none",
    transform: active ? "scale(1.05) translateY(-2px)" : "scale(1)",
  });

  return (
    <div className="container mx-auto md:px-6 px-4 py-8">
      {/* Search Mode Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "32px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setSearchMode("keyword")}
          style={tabStyles(searchMode === "keyword")}
        >
          🔍 Keyword Search
        </button>
        <button
          onClick={() => setSearchMode("ai")}
          style={tabStyles(searchMode === "ai", true)}
          className={searchMode === "ai" ? "animate-pulse" : ""}
        >
          ✨ AI Smart Search
        </button>
        <button
          onClick={() => setSearchMode("visual")}
          style={tabStyles(searchMode === "visual", true)}
        >
          📷 Visual Search
        </button>
      </div>

      {/* Search Input Based on Mode */}
      <div className="flex justify-center mb-8">
        {searchMode === "keyword" && (
          <div className="w-full flex items-center">
            <Input
              value={keyword}
              name="keyword"
              onChange={(event) => setKeyword(event.target.value)}
              className="py-6"
              placeholder="Search Products ..."
            />
          </div>
        )}

        {searchMode === "ai" && (
          <div className="w-full">
            <div
              style={{
                position: "relative",
                display: "flex",
                gap: "8px",
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <Input
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={handleAISearchKeyDown}
                  className="py-6 pr-12"
                  placeholder='Try: "casual outfit for summer wedding" or "comfortable running shoes"'
                  style={{
                    borderColor: "#a855f7",
                    borderWidth: "2px",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "20px",
                  }}
                >
                  ✨
                </span>
              </div>
              <button
                onClick={handleAISearch}
                disabled={!aiQuery.trim() || smartSearchLoading}
                style={{
                  padding: "0 24px",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    aiQuery.trim() && !smartSearchLoading
                      ? "linear-gradient(135deg, #6366f1, #a855f7)"
                      : "#e5e7eb",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor:
                    aiQuery.trim() && !smartSearchLoading
                      ? "pointer"
                      : "not-allowed",
                  transition: "all 0.3s",
                }}
              >
                {smartSearchLoading ? "Searching..." : "AI Search"}
              </button>
            </div>
            <p
              style={{
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "12px",
                marginTop: "8px",
              }}
            >
              Powered by AI — understands natural language, not just keywords
            </p>
          </div>
        )}

        {searchMode === "visual" && (
          <div className="w-full">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? "#a855f7" : "#d1d5db"}`,
                borderRadius: "16px",
                padding: "40px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                background: dragActive
                  ? "rgba(168, 85, 247, 0.05)"
                  : "#fafafa",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📸</div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Drop an image or click to upload
              </p>
              <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                Upload a photo of clothing and AI will find similar products
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleVisualSearchUpload(e.target.files?.[0])
                }
                style={{ display: "none" }}
              />
            </div>

            {/* AI Description of uploaded image */}
            {visualSearchResults?.imageDescription && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6366f1",
                    marginBottom: "4px",
                  }}
                >
                  ✨ AI Analysis
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#4b5563",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {visualSearchResults.imageDescription}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Badge for AI results */}
      {searchMode === "ai" &&
        smartSearchResults.length > 0 &&
        !smartSearchLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))",
                color: "#6366f1",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              ✨ AI found {smartSearchResults.length} relevant products
            </span>
          </div>
        )}

      {/* Loading */}
      {currentLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* No Results */}
          {!currentResults.length &&
            ((searchMode === "keyword" && keyword.trim().length > 3) ||
              (searchMode === "ai" && aiQuery.trim().length > 0 && !smartSearchLoading) ||
              (searchMode === "visual" && visualSearchResults && !visualSearchLoading)) ? (
            <div className="flex justify-center py-16">
              <h1 className="text-5xl font-extrabold text-gray-500">
                No Results Found!
              </h1>
            </div>
          ) : null}

          {/* Results Grid */}
          {currentResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentResults.map((item) => (
                <ShoppingProductTile
                  key={item._id}
                  product={item}
                  handleAddtoCart={handleAddtoCart}
                  handleGetProductDetails={handleGetProductDetails}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}
export default SearchProducts;
