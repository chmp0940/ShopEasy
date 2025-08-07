import React from "react";
import { Button } from "../ui/button";
import { StarIcon } from "lucide-react";

function StarRating({ rating, handleRatingChange }) {
  console.log(rating);
  

  return [1, 2, 3, 4, 5].map((star) => (
    <Button
      className={`p-2 rounded-full transition-colors ${
        star <= rating
          ? "text-yellow-500 hover:bg-black"
          : "text-black hover:bg-primary hover:text-primary-foreground"
      }`}
      variant="ghost"
      size="icon"
      key={star}
      onClick={
        handleRatingChange ? () => handleRatingChange(star) : null
      }
    >
      <StarIcon
        className={`w-6 h-6 ${
          star <= rating ? "fill-yellow-500" : "fill-black"
        }`}
      />
    </Button>
  ));
}

export default StarRating;
