import React from "react";

const ProductGridSkeleton = ({
  count = 5,
  gridClassName = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6",
}) => {
  return (
    <div className={gridClassName} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[2/3] w-full bg-gray-200 rounded-sm" />
          <div className="pt-3 space-y-2">
            <div className="h-4 w-4/5 bg-gray-200 rounded-sm" />
            <div className="h-4 w-2/5 bg-gray-200 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
