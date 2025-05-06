import { useState } from "react";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const sizeMap = {
  sm: "w-3 h-3",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({
  rating,
  max = 5,
  onChange,
  readOnly = false,
  size = "md",
  showValue = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setIsHovering(true);
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setIsHovering(false);
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    onChange(index);
  };

  const displayRating = isHovering ? hoverRating : rating;
  const starSize = sizeMap[size];

  const renderStar = (index: number) => {
    const starValue = index + 0.5; // Star value (half)
    const starValue2 = index + 1; // Star value (full)

    if (displayRating >= starValue2) {
      // Full star
      return (
        <Star 
          key={`star-${index}`}
          className={`${starSize} text-yellow-400 star`}
          fill="currentColor"
        />
      );
    } else if (displayRating >= starValue) {
      // Half star
      return (
        <StarHalf 
          key={`star-${index}`}
          className={`${starSize} text-yellow-400 star`}
          fill="currentColor"
        />
      );
    } else {
      // Empty star
      return (
        <Star 
          key={`star-${index}`}
          className={`${starSize} text-gray-300 star-empty`}
        />
      );
    }
  };

  // Generate an array of star indices (0-based)
  const stars = Array.from({ length: max }, (_, i) => i);

  return (
    <div className="flex items-center space-x-1">
      <div 
        className="star-rating flex"
        onMouseLeave={handleMouseLeave}
      >
        {stars.map((index) => (
          <div
            key={index}
            onMouseEnter={() => handleMouseEnter(index + 1)}
            onClick={() => handleClick(index + 1)}
            className={readOnly ? "" : "cursor-pointer"}
          >
            {renderStar(index)}
          </div>
        ))}
      </div>
      {showValue && (
        <span className="ml-1 text-sm text-gray-600">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export function HalfStarRating({
  rating,
  max = 5,
  onChange,
  readOnly = false,
  size = "md",
  showValue = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = (rating: number) => {
    if (readOnly) return;
    setIsHovering(true);
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setIsHovering(false);
    setHoverRating(0);
  };

  const handleClick = (rating: number) => {
    if (readOnly || !onChange) return;
    onChange(rating);
  };

  const displayRating = isHovering ? hoverRating : rating;
  const starSize = sizeMap[size];

  // Generate array of possible ratings (0.5, 1, 1.5, ..., 5)
  const possibleRatings = Array.from(
    { length: max * 2 },
    (_, i) => (i + 1) * 0.5
  );

  return (
    <div className="flex items-center space-x-1">
      <div 
        className="star-rating flex"
        onMouseLeave={handleMouseLeave}
      >
        {possibleRatings.map((val, idx) => {
          const isHalf = val % 1 !== 0;
          const starIndex = Math.floor(val) - 1;
          const isActive = displayRating >= val;
          
          // For half stars, we only show the left half of the area
          const width = isHalf ? "w-3" : "w-6";
          
          return (
            <div
              key={val}
              className={`h-6 ${width} relative overflow-hidden cursor-pointer`}
              onMouseEnter={() => handleMouseEnter(val)}
              onClick={() => handleClick(val)}
            >
              {isHalf ? (
                <div className="absolute left-0 top-0">
                  <StarHalf 
                    className={`${starSize} ${isActive ? "text-yellow-400" : "text-gray-300"}`}
                    fill={isActive ? "currentColor" : "none"}
                  />
                </div>
              ) : (
                <Star 
                  className={`${starSize} ${isActive ? "text-yellow-400" : "text-gray-300"}`}
                  fill={isActive ? "currentColor" : "none"}
                />
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-1 text-sm text-gray-600">
          {displayRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
