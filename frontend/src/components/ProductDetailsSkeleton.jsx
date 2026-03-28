import React from "react";

const ProductDetailsSkeleton = () => {
  return (
    <div
      className="border-t-2 pt-10 animate-pulse"
      aria-hidden="true"
    >
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col gap-2 sm:gap-3 sm:w-[18.7%] w-full">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-[24%] sm:w-full aspect-[2/3] bg-gray-200 rounded-sm"
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <div className="aspect-[2/3] w-full bg-gray-200 rounded-sm" />
          </div>
        </div>

        <div className="flex-1">
          <div className="h-8 w-3/4 bg-gray-200 rounded-sm mt-2" />
          <div className="h-10 w-40 bg-gray-200 rounded-sm mt-5" />
          <div className="h-5 w-24 bg-gray-200 rounded-sm mt-3" />
          <div className="space-y-3 mt-5 mb-8 md:w-4/5">
            <div className="h-4 w-full bg-gray-200 rounded-sm" />
            <div className="h-4 w-full bg-gray-200 rounded-sm" />
            <div className="h-4 w-2/3 bg-gray-200 rounded-sm" />
          </div>
          <div className="my-8">
            <div className="h-4 w-24 bg-gray-200 rounded-sm mb-4" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-11 w-14 bg-gray-200 rounded-sm"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="h-12 w-40 bg-gray-200 rounded-sm" />
            <div className="h-12 w-44 bg-gray-200 rounded-sm" />
          </div>
          <hr className="mt-8 sm:w-4/5" />
          <div className="space-y-3 mt-5 sm:w-4/5">
            <div className="h-4 w-2/3 bg-gray-200 rounded-sm" />
            <div className="h-4 w-3/4 bg-gray-200 rounded-sm" />
            <div className="h-4 w-1/2 bg-gray-200 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
