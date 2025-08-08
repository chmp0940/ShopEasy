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

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden flex-1 flex flex-col mt-4 min-h-0">
            <div className="bg-gradient-to-r from-yellow-100 to-blue-100 p-4 border-b border-white/50 flex-shrink-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                Customer Reviews ({reviews?.length || 0})
              </h2>
            </div>

            {/* Scrollable Reviews Section */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-6 space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((reviewItem, index) => (
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
                            <h3 className="font-bold text-gray-800">
                              {reviewItem?.userName}
                            </h3>
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
                  ))
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
    </Dialog>
  );
}

export default ProductDetailsDialog;
