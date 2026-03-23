import React from "react";
import { ShopContext } from "../context/ShopContext";
import { useContext } from "react";
import { useState } from "react";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import RevealOnScroll from "../components/RevealOnScroll";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [offersOnly, setOffersOnly] = useState(false);

  const offerProductsCount = products.filter(
    (item) => Number(item.discount || 0) > 0,
  ).length;

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category),
      );
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory),
      );
    }

    if (offersOnly) {
      productsCopy = productsCopy.filter(
        (item) => Number(item.discount || 0) > 0,
      );
    }

    setFilterProducts(productsCopy);
  };

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };
  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const sortProduct = () => {
    let fpcopy = filterProducts.slice();
    switch (sortType) {
      case "low-high":
        setFilterProducts(fpcopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpcopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  useEffect(() => {
    setFilterProducts(products);
  }, []);

  useEffect(() => {
    applyFilter();
  }, [category, subCategory, search, showSearch, products, offersOnly]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  useEffect(() => {
    console.log(category);
  }, [category]);

  useEffect(() => {
    console.log(subCategory);
  }, [subCategory]);

  return (
    <div className="flex flex-col md:flex-row gap-1 sm:gap-10 pt-10">
      {/*filter*/}
      <div className="min-w-44 lg:min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 md:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>
        {/*cATEGORY*/}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } md:block  `}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Men"}
                onChange={toggleCategory}
              />
              Men
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Women"}
                onChange={toggleCategory}
              />
              Women
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Kids"}
                onChange={toggleCategory}
              />
              Kids
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Kids"}
                onChange={toggleCategory}
              />
              None
            </p>
          </div>
        </div>
        {/*sub category*/}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } md:block  `}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Saree"}
                onChange={toggleSubCategory}
              />
              Saree
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Tops"}
                onChange={toggleSubCategory}
              />
              Tops
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Dress"}
                onChange={toggleSubCategory}
              />
              Dress
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Lungi&Sarong"}
                onChange={toggleSubCategory}
              />
              Lungi & Sarong
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"HomeAccessories"}
                onChange={toggleSubCategory}
              />
              Home Accessories
            </p>
          </div>
          <div></div>
        </div>

        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } md:block`}
        >
          <p className="mb-3 text-sm font-medium">OFFERS</p>
          <label className="flex items-center gap-2 text-sm font-light text-gray-700 cursor-pointer">
            <input
              className="w-3"
              type="checkbox"
              checked={offersOnly}
              onChange={(e) => setOffersOnly(e.target.checked)}
            />
            Offers Only ({offerProductsCount})
          </label>
        </div>
      </div>
      {/*Right Sidebar*/}
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffersOnly((prev) => !prev)}
              className={`text-sm px-3 py-1.5 border rounded transition-colors ${
                offersOnly
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {offersOnly ? "Showing Offers" : "See All Offers"}
            </button>

            {/*PRODUCT SORT*/}
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="border-2 border-gray-300 text-sm px-2 py-1.5"
            >
              <option value="relavent">Sort by:Relevent</option>
              <option value="low-high">Sort by:Low to High</option>
              <option value="high-low">Sort by:High to Low</option>
            </select>
          </div>
        </div>
        {/*Map Products*/}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.map((item) => (
            <RevealOnScroll
              key={item._id}
              delay={40}
              distance={24}
              duration={650}
              threshold={0.08}
            >
              <ProductItem
                name={item.name}
                id={item._id}
                image={item.image}
                price={item.price}
                stockStatus={item.stockStatus} // Pass stock status to ProductItem
                stock={item.stock} // Pass stock information to ProductItem
                discount={item.discount}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
