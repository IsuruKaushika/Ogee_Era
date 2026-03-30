import React from "react";
import Title from "./Title";

const PlaceOrderSkeleton = () => {
  return (
    <div
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-8 min-h-[80vh] px-4"
      aria-hidden="true"
    >
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px] animate-pulse">
        <div className="text-xl sm:text-2xl my-3 animate-none">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-11 w-full bg-gray-100 rounded" />
          <div className="h-11 w-full bg-gray-100 rounded" />
        </div>
        <div className="h-11 w-full bg-gray-100 rounded" />
        <div className="h-11 w-full bg-gray-100 rounded" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-11 w-full bg-gray-100 rounded" />
          <div className="h-11 w-full bg-gray-100 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-11 w-full bg-gray-100 rounded" />
          <div className="h-11 w-full bg-gray-100 rounded" />
        </div>

        <div className="h-11 w-full bg-gray-100 rounded" />

        <div className="hidden md:block">
          <div className="mt-5 animate-none">
            <Title text1={"PAYMENT"} text2={"METHOD"} />
          </div>
          <div className="space-y-3 mt-3">
            <div className="h-12 w-full bg-gray-100 rounded" />
            <div className="h-12 w-full bg-gray-100 rounded" />
          </div>
          <div className="h-12 w-full bg-gray-200 rounded mt-6" />
        </div>
      </div>

      <div className="w-full sm:max-w-[480px] animate-pulse">
        <div className="text-xl sm:text-2xl mt-3 mb-7 animate-none">
          <Title text1={"CART"} text2={"ITEMS"} />
        </div>

        <div className="space-y-4 max-h-[360px]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-start gap-3 border-b border-gray-100 pb-4">
              <div className="h-20 w-16 rounded bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded-sm" />
                <div className="h-4 w-1/2 bg-gray-100 rounded-sm" />
                <div className="h-4 w-1/3 bg-gray-200 rounded-sm" />
              </div>
              <div className="h-4 w-14 bg-gray-200 rounded-sm" />
            </div>
          ))}
        </div>

        <div className="mt-8 border border-gray-100 rounded-sm p-4 space-y-3">
          <div className="h-4 w-full bg-gray-100 rounded-sm" />
          <div className="h-4 w-full bg-gray-100 rounded-sm" />
          <div className="h-4 w-full bg-gray-100 rounded-sm" />
          <div className="h-5 w-1/2 bg-gray-200 rounded-sm" />
        </div>

        <div className="mt-4 md:hidden space-y-3">
          <div className="animate-none">
            <Title text1={"PAYMENT"} text2={"METHOD"} />
          </div>
          <div className="h-12 w-full bg-gray-100 rounded" />
          <div className="h-12 w-full bg-gray-100 rounded" />
          <div className="h-12 w-full bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderSkeleton;
