import React from "react";

const AccountSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" aria-hidden="true">
      <div className="lg:col-span-2 border border-gray-200 rounded p-5 sm:p-6 bg-white animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded-sm" />

        <div className="mt-5 space-y-4">
          <div>
            <div className="h-4 w-24 bg-gray-200 rounded-sm mb-2" />
            <div className="h-10 w-full bg-gray-100 rounded" />
          </div>

          <div>
            <div className="h-4 w-28 bg-gray-200 rounded-sm mb-2" />
            <div className="h-10 w-full bg-gray-100 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded-sm" />
              <div className="h-4 w-20 bg-gray-200 rounded-sm" />
            </div>
            <div className="border border-gray-200 rounded p-3 bg-gray-50 space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded-sm" />
              <div className="h-4 w-20 bg-gray-200 rounded-sm" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <div className="h-10 w-36 bg-gray-200 rounded-sm" />
            <div className="h-10 w-28 bg-gray-100 rounded-sm" />
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded p-5 sm:p-6 bg-white h-fit animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded-sm" />

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <div className="h-3 w-16 bg-gray-200 rounded-sm" />
            <div className="h-6 w-10 bg-gray-200 rounded-sm" />
          </div>
          <div className="border border-gray-200 rounded p-3 space-y-2">
            <div className="h-3 w-16 bg-gray-200 rounded-sm" />
            <div className="h-6 w-10 bg-gray-200 rounded-sm" />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-5">
          <div className="h-10 w-full bg-gray-100 rounded-sm" />
          <div className="h-10 w-full bg-gray-100 rounded-sm" />
          <div className="h-10 w-full bg-gray-100 rounded-sm" />
        </div>
      </div>
    </div>
  );
};

export default AccountSkeleton;
