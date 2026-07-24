import StarRating from "@/components/common/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { setProductDetails } from "@/store/shop/products-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import {
  aiGetReviewSummary,
  aiGetSentiment,
  aiGetRecommendations,
  clearReviewSummary,
  clearSentiment,
  clearRecommendations,
} from "@/store/shop/ai-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { StarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const { reviews } = useSelector((state) => state.shopReview);
  const {
    reviewSummary,
    reviewSummaryLoading,
    sentimentData,
    sentimentLoading,
    recommendations,
    recommendationsLoading,
  } = useSelector((state) => state.shopAI);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  function handleAddToCart(getCurrentProductId, getTotalStock) {
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

    console.log(getCurrentProductId);

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

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch, user?.id]);

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    dispatch(clearReviewSummary());
    dispatch(clearSentiment());
    dispatch(clearRecommendations());
  }

  function handleRatingChange(getRating) {
    setRating(getRating);
  }
  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data?.payload.success) {
        setRating(0);
        setReviewMsg("");

        dispatch(getReviews(productDetails?._id));
      }
    });
  }

  useEffect(() => {
    if (productDetails != null) {
      dispatch(getReviews(productDetails?._id));
    }
  }, [productDetails, dispatch]);

  function getSentimentForReview(reviewId) {
    const found = sentimentData.find((s) => s.reviewId === reviewId);
    return found?.sentiment || null;
  }

  const sentimentConfig = {
    positive: { emoji: "😊", color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Positive" },
    neutral: { emoji: "😐", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Neutral" },
    negative: { emoji: "😞", color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Negative" },
  };

  function handleRecommendedProductClick(productId) {
    dispatch(clearReviewSummary());
    dispatch(clearSentiment());
    dispatch(clearRecommendations());
    dispatch(fetchProductDetails(productId));
  }

  console.log(reviews);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:p-8 max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] max-h-[95vh] bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 border-none shadow-2xl">
        <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="aspect-square w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
        </div>
        <div className="flex flex-col h-full max-h-[90vh]">
          <div className="space-y-4 flex-shrink-0">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
              {productDetails?.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed bg-white/50 p-4 rounded-xl border border-white/20">
              {productDetails?.description}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/50 flex-shrink-0 mt-2">
            <div className="flex items-center justify-between mb-2">
              <p
                className={`${
                  productDetails?.salePrice > 0
                    ? "line-through text-gray-400"
                    : "text-gray-800"
                } text-lg font-bold`}
              >
                ${productDetails?.price}
              </p>
              {productDetails?.salePrice > 0 ? (
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ${productDetails?.salePrice}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-1 mb-6">
              <div className="flex items-center gap-1">
                <StarRating rating={averageReview} />
              </div>
              <span className="text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full text-sm">
                ({averageReview.toFixed(1)})
              </span>
            </div>

            {productDetails?.totalStock === 0 ? (
              <Button className="w-full bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white font-semibold py-3 rounded-xl">
                Out Of Stock
              </Button>
            ) : (
              <Button
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
                className="w-full mt-4  bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </Button>
            )}
          </div>

          {/* ═══════ AI Insights Button ═══════ */}
          {!reviewSummary && !reviewSummaryLoading && !recommendations.length && !recommendationsLoading && (
            <div className="px-2 mt-4">
              <Button
                onClick={() => {
                  dispatch(aiGetReviewSummary(productDetails._id));
                  dispatch(aiGetSentiment(productDetails._id));
                  dispatch(aiGetRecommendations(productDetails._id));
                }}
                className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
              >
                <span className="text-xl animate-pulse">✨</span> Load AI Insights & Recommendations
              </Button>
            </div>
          )}

          {/* ═══════ AI Recommendations Section ═══════ */}
          {(recommendationsLoading || (recommendations && recommendations.length > 0)) && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.05))",
                borderRadius: "16px",
                border: "1px solid rgba(139, 92, 246, 0.15)",
                flexShrink: 0,
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#6366f1",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                ✨ You Might Also Like
              </h3>
              {recommendationsLoading ? (
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "12px",
                        background: "#e5e7eb",
                        animation: "pulse 1.5s ease-in-out infinite",
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                  {recommendations.map((rec) => (
                    <div
                      key={rec._id}
                      onClick={() => handleRecommendedProductClick(rec._id)}
                      style={{
                        minWidth: "80px",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                      <img
                        src={rec.image}
                        alt={rec.title}
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "12px",
                          objectFit: "cover",
                          border: "2px solid white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                      />
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#4b5563",
                          marginTop: "4px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "80px",
                          fontWeight: 500,
                        }}
                      >
                        {rec.title}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#6366f1",
                          margin: 0,
                        }}
                      >
                        ${rec.salePrice > 0 ? rec.salePrice : rec.price}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden flex-1 flex flex-col mt-4 min-h-0">
            <div className="bg-gradient-to-r from-yellow-100 to-blue-100 p-4 border-b border-white/50 flex-shrink-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Customer Reviews ({reviews?.length || 0})
              </h2>
            </div>

            {/* ═══════ AI Review Summary ═══════ */}
            {(reviewSummaryLoading || reviewSummary) && (
              <div
                style={{
                  margin: "12px 12px 0",
                  padding: "12px 16px",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>✨</span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#6366f1",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    AI Review Summary
                  </span>
                </div>
                {reviewSummaryLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "4px", width: "100%" }} />
                    <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "4px", width: "80%" }} />
                  </div>
                ) : reviewSummary?.summary ? (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#4b5563",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {reviewSummary.summary}
                  </p>
                ) : null}
              </div>
            )}

            {/* Scrollable Reviews Section */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-6 space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((reviewItem, index) => {
                    const sentiment = getSentimentForReview(reviewItem._id);
                    const sentimentInfo = sentiment ? sentimentConfig[sentiment] : null;

                    return (
                      <div
                        key={index}
                        className="bg-white/60 p-4 rounded-xl border border-white/30 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex gap-4">
                          <Avatar className="w-12 h-12 border-2 border-pink-200 shadow-md">
                            <AvatarFallback className="bg-gradient-to-br from-pink-400 to-orange-400 text-white font-bold">
                              {reviewItem?.userName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800">
                                  {reviewItem?.userName}
                                </h3>
                                {/* Sentiment Badge */}
                                {sentimentInfo && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "3px",
                                      padding: "2px 8px",
                                      borderRadius: "12px",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      color: sentimentInfo.color,
                                      background: sentimentInfo.bg,
                                    }}
                                  >
                                    {sentimentInfo.emoji} {sentimentInfo.label}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <StarRating rating={reviewItem.reviewValue} />
                              </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                              {reviewItem?.reviewMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">💭</div>
                    <h3 className="text-lg font-medium text-gray-600">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-500">
                      Be the first to review this product!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Write a Review - Always Visible at Bottom */}
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 border-t border-pink-100 flex-shrink-0">
              <Label className="text-lg font-semibold text-gray-800 mb-4 block">
                Write a Review
              </Label>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Rating:
                  </span>
                  <StarRating
                    rating={rating}
                    handleRatingChange={handleRatingChange}
                  />
                </div>
                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(event) => setReviewMsg(event.target.value)}
                  placeholder="Share your thoughts about this product..."
                  className="bg-white/80 border-pink-200 focus:border-pink-400 rounded-xl p-3"
                />
                <Button
                  onClick={handleAddReview}
                  disabled={reviewMsg.trim() === "" || rating === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </Dialog>
  );
}

export default ProductDetailsDialog;
