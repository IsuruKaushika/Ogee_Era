import React from "react";
import Title from "./Title";

const CartSkeleton = () => {
  return (
    <div className="border-t pt-14" aria-hidden="true">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border-b border-gray-200 pb-4 animate-pulse">
            <div className="md:hidden">
              <div className="flex items-start gap-3">
                <div className="h-24 w-20 bg-gray-200 rounded-sm" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded-sm" />
                  <div className="h-16 w-full bg-gray-100 rounded-sm" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded-sm" />
                </div>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-[minmax(0,4fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(120px,1fr)_48px] items-center gap-4">
              <div className="flex items-start gap-6">
                <div className="h-24 w-20 bg-gray-200 rounded-sm" />
                <div className="space-y-3">
                  <div className="h-5 w-64 bg-gray-200 rounded-sm" />
                  <div className="h-8 w-16 bg-gray-200 rounded-sm" />
                </div>
              </div>
              <div className="h-5 w-16 mx-auto bg-gray-200 rounded-sm" />
              <div className="h-9 w-28 mx-auto bg-gray-200 rounded-full" />
              <div className="h-5 w-16 mx-auto bg-gray-200 rounded-sm" />
              <div className="h-4 w-4 mx-auto bg-gray-200 rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end my-20 animate-pulse">
        <div className="w-full sm:w-[450px]">
          <div className="h-7 w-36 bg-gray-200 rounded-sm mb-4" />
          <div className="space-y-3 border border-gray-100 rounded-sm p-4">
            <div className="h-4 w-full bg-gray-100 rounded-sm" />
            <div className="h-4 w-full bg-gray-100 rounded-sm" />
            <div className="h-4 w-full bg-gray-100 rounded-sm" />
            <div className="h-5 w-1/2 bg-gray-200 rounded-sm" />
          </div>
          <div className="h-11 w-52 ml-auto mt-8 bg-gray-200 rounded-sm" />
        </div>
      </div>
    </div>
  );
};

export default CartSkeleton;
