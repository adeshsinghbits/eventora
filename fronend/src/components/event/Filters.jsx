import { useState, useEffect, useCallback } from "react";
import {
  LuSearch as Search,
  LuX as X,
  LuSlidersHorizontal as SlidersHorizontal,
  LuChevronDown as ChevronDown
} from "react-icons/lu";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "music", label: "🎵 Music" },
  { value: "tech", label: "💻 Tech" },
  { value: "sports", label: "⚽ Sports" },
  { value: "education", label: "📚 Education" },
  { value: "food", label: "🍔 Food & Drink" },
  { value: "business", label: "💼 Business" },
  { value: "festival", label: "🎪 Festival" },
  { value: "meetup", label: "🤝 Meetup" },
  { value: "other", label: "✨ Other" },
];

const SORT_OPTIONS = [
  { value: "startDate", label: "Date (Soonest)" },
  { value: "newest", label: "Newest First" },
  { value: "popularity", label: "Most Popular" },
  { value: "price", label: "Price (Low → High)" },
];

const DEFAULT_FILTERS = {
  search: "",
  category: "all",
  isFree: "",
  minPrice: "",
  maxPrice: "",
  startDate: "",
  endDate: "",
  sortBy: "startDate",
};

// ── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Filters Component ─────────────────────────────────────────────────────────
const Filters = ({ onChange, resultCount, loading }) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [open, setOpen] = useState(false); // mobile drawer
  const [priceExpanded, setPriceExpanded] = useState(false);
  const [dateExpanded, setDateExpanded] = useState(false);

  const debouncedSearch = useDebounce(filters.search);

  // Notify parent whenever debounced search or any other filter changes
  useEffect(() => {
    const active = { ...filters, search: debouncedSearch };
    // Strip empty strings before sending up
    const clean = Object.fromEntries(
      Object.entries(active).filter(([, v]) => v !== "" && v !== "all")
    );
    onChange(clean);
  }, [debouncedSearch, filters.category, filters.isFree, filters.minPrice,
      filters.maxPrice, filters.startDate, filters.endDate, filters.sortBy]);

  const set = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.isFree !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.startDate !== "" ||
    filters.endDate !== "" ||
    filters.search !== "";

  const panelContent = (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Events, venues, cities…"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => set("search", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Category
        </label>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set("category", value)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filters.category === value
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Free / Paid */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Admission
        </label>
        <div className="flex gap-2">
          {[
            { value: "", label: "Any" },
            { value: "true", label: "Free" },
            { value: "false", label: "Paid" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => set("isFree", value)}
              className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                filters.isFree === value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-gray-200 text-gray-700 hover:border-indigo-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      {filters.isFree !== "true" && (
        <div>
          <button
            onClick={() => setPriceExpanded((p) => !p)}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
          >
            Price Range
            <ChevronDown className={`w-4 h-4 transition-transform ${priceExpanded ? "rotate-180" : ""}`} />
          </button>
          {priceExpanded && (
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => set("minPrice", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => set("maxPrice", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Date Range */}
      <div>
        <button
          onClick={() => setDateExpanded((p) => !p)}
          className="flex items-center justify-between w-full text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
        >
          Date Range
          <ChevronDown className={`w-4 h-4 transition-transform ${dateExpanded ? "rotate-180" : ""}`} />
        </button>
        {dateExpanded && (
          <div className="flex flex-col gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate}
              onChange={(e) => set("endDate", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => set("sortBy", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={reset}
          className="w-full py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Mobile toggle ── */}
      <div className="lg:hidden flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-indigo-300 transition-colors shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>
        {resultCount !== undefined && (
          <span className="text-sm text-gray-500">
            {loading ? "Loading…" : `${resultCount.toLocaleString()} events`}
          </span>
        )}
      </div>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-80 max-w-full  h-full  overflow-y-auto scrollbar-custom p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {panelContent}
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Show {resultCount ?? ""} Events
            </button>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block w-56 xl:w-64 shrink-0 ">
        <div className="sticky top-24 bg-slate-600 border  scrollbar-custom border-gray-100 rounded-2xl p-5 shadow-sm overflow-y-auto max-h-[calc(100vh-7rem)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Filters</h2>
            {resultCount !== undefined && (
              <span className="text-xs text-gray-400">
                {loading ? "…" : resultCount.toLocaleString()} results
              </span>
            )}
          </div>
          {panelContent}
        </div>
      </aside>
    </>
  );
};

export default Filters;