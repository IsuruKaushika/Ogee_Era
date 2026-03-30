import React from "react";
import Title from "./Title";

const WishlistSkeleton = () => {
  return (
    <div className="border-t pt-14" aria-hidden="true">
      <div className="text-2xl mb-6">
        <Title text1={"MY"} text2={"WISHLIST"} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 gap-y-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[2/3] w-full bg-gray-200 rounded-sm" />
            <div className="pt-3 space-y-2">
              <div className="h-4 w-4/5 bg-gray-200 rounded-sm" />
              <div className="h-4 w-2/5 bg-gray-200 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistSkeleton;
