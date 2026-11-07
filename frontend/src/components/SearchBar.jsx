import { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { ShopContext } from "../context/ShopContext";

// Opened from the search icon in the header. Typing filters the Collection page.
const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch, navigate } = useContext(ShopContext);
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    if (showSearch) ref.current?.focus();
  }, [showSearch]);

  if (!showSearch) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!location.pathname.startsWith("/collection")) navigate("/collection");
  };

  return (
    <div className="bg-sand/60 border-b border-stone/60">
      <form onSubmit={submit} className="container-x flex items-center gap-3 h-14">
        <FiSearch className="w-4 h-4 text-taupe" />
        <input
          ref={ref}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          type="search"
          placeholder="Search dresses, sarongs, tops..."
          aria-label="Search products"
        />
        <button type="button" aria-label="Close search" onClick={() => { setSearch(""); setShowSearch(false); }}>
          <FiX className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
