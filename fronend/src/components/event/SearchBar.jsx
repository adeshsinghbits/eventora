import React, { useState, useEffect } from "react";
import { FaMagnifyingGlass as MagnifyingGlassIcon, FaFilter  as  FunnelIcon } from "react-icons/fa6";
import { useDebounce } from "../../hooks/useDebounce";

const SearchBar = ({ onSearch, showMobileFilters, onToggleFilters }) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events by title, description, or tags..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>
      <button
        onClick={onToggleFilters}
        className="lg:hidden px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
        aria-label="Toggle filters"
      >
        <FunnelIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchBar;