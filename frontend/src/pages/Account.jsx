import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { googleLogout } from "@react-oauth/google";
import Title from "../components/Title";
import AccountSkeleton from "../components/AccountSkeleton";
import { ShopContext } from "../context/ShopContext";

const Account = () => {
  const { token, backendUrl, navigate, setToken, setCartItems, setWishlistItems } =
    useContext(ShopContext);

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.post(backendUrl + "/api/user/me", {}, { headers: { token } });

      if (response.data.success) {
        const user = response.data.user;
        setProfile(user);
        setName(user?.name || "");
      } else {
        toast.error(response.data.message || "Failed to load profile");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const stats = useMemo(() => {
    const wishlistCount = Object.keys(profile?.wishlistData || {}).length;

    let cartCount = 0;
    const cartData = profile?.cartData || {};
    for (const productId in cartData) {
      const sizeMap = cartData[productId] || {};
      for (const size in sizeMap) {
        cartCount += Number(sizeMap[size]) || 0;
      }
    }

    return { wishlistCount, cartCount };
  }, [profile]);

  const handleSave = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        backendUrl + "/api/user/profile/update",
        { name },
        { headers: { token } },
      );

      if (response.data.success) {
        setProfile(response.data.user);
        setName(response.data.user?.name || "");
        toast.success("Profile updated", {
          position: "top-center",
          autoClose: 1600,
        });
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setWishlistItems({});
    navigate("/login");
  };

  if (!token) {
    return (
      <div className="border-t pt-14">
        <div className="text-2xl mb-6">
          <Title text1={"MY"} text2={"ACCOUNT"} />
        </div>
        <div className="border border-gray-200 rounded p-8 text-center">
          <p className="text-gray-700">Please log in to view your account.</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-black text-white px-6 py-3 text-sm mt-6"
          >
            GO TO LOGIN
          </button>
        </div>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="border-t pt-14 pb-10">
        <div className="text-2xl mb-6">
          <Title text1={"MY"} text2={"ACCOUNT"} />
        </div>
        <AccountSkeleton />
      </div>
    );
  }

  return (
    <div className="border-t pt-14 pb-10">
      <div className="text-2xl mb-6">
        <Title text1={"MY"} text2={"ACCOUNT"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 border border-gray-200 rounded p-5 sm:p-6 bg-white">
          <p className="text-lg font-medium">Profile Details</p>

          {loading ? (
            <p className="text-sm text-gray-500 mt-4">Loading profile...</p>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 outline-none focus:border-black"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Email Address</p>
                <p className="border border-gray-200 rounded px-3 py-2 bg-gray-50 text-gray-700">
                  {profile?.email || "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <p className="text-gray-500">Sign in method</p>
                  <p className="mt-1 font-medium text-gray-800 capitalize">
                    {profile?.authProvider || "Email"}
                  </p>
                </div>
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <p className="text-gray-500">Member since</p>
                  <p className="mt-1 font-medium text-gray-800">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-black text-white px-6 py-2 text-sm disabled:opacity-70"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
                <button onClick={handleLogout} className="border border-gray-300 px-6 py-2 text-sm">
                  LOGOUT
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded p-5 sm:p-6 bg-white h-fit">
          <p className="text-lg font-medium">Quick Access</p>

          <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-500">Cart Items</p>
              <p className="text-lg font-semibold mt-1">{stats.cartCount}</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <p className="text-gray-500">Wishlist</p>
              <p className="text-lg font-semibold mt-1">{stats.wishlistCount}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-5">
            <button
              onClick={() => navigate("/orders")}
              className="w-full border border-gray-300 py-2 text-sm"
            >
              VIEW ORDERS
            </button>
            <button
              onClick={() => navigate("/wishlist")}
              className="w-full border border-gray-300 py-2 text-sm"
            >
              VIEW WISHLIST
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="w-full border border-gray-300 py-2 text-sm"
            >
              GO TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
