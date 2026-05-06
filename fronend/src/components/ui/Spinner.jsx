export default function Spinner() {
  return (
    <div
      className="group relative inline-flex items-center justify-center rounded-3xl border border-stone-200 p-4 text-stone-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300 active:translate-y-0 active:shadow-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
      tabIndex={0}
      style={{ fontSize: "16px" }}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-3xl border border-stone-200"
        style={{ width: "12em", height: "12em" }}
      >
        <div
          className="absolute rounded-full border border-stone-200 group-hover:border-stone-300"
          style={{ width: "9.5em", height: "9.5em" }}
        />
        <div
          className="absolute rounded-full border border-dashed border-stone-200 group-hover:border-stone-300"
          style={{ width: "6.75em", height: "6.75em" }}
        />

        {/* Corner dots */}
        <div className="absolute rounded-full bg-stone-300" style={{ left: "1em", top: "1em", width: "0.35em", height: "0.35em" }} />
        <div className="absolute rounded-full bg-stone-300" style={{ right: "1em", top: "1em", width: "0.35em", height: "0.35em" }} />
        <div className="absolute rounded-full bg-stone-300" style={{ left: "1em", bottom: "1em", width: "0.35em", height: "0.35em" }} />
        <div className="absolute rounded-full bg-stone-300" style={{ right: "1em", bottom: "1em", width: "0.35em", height: "0.35em" }} />

        {/* Lines */}
        <div className="absolute bg-stone-200" style={{ width: "0.0625em", height: "7em" }} />
        <div className="absolute bg-stone-200" style={{ width: "7em", height: "0.0625em" }} />

        {/* Main rotating arm */}
        <div
          className="absolute animate-spin"
          style={{ width: "9.5em", height: "9.5em", animationDuration: "2.8s" }}
        >
          <div
            className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full bg-stone-900 group-hover:scale-105"
            style={{ width: "1.25em", height: "2.5em" }}
          >
            <div
              className="mx-auto bg-amber-300"
              style={{ marginTop: "0.75em", width: "0.0625em", height: "1em" }}
            />
          </div>
        </div>

        {/* Secondary rotating dots */}
        <div className="absolute rotate-45" style={{ width: "6.75em", height: "6.75em" }}>
          <div
            className="relative h-full w-full animate-spin"
            style={{ animationDuration: "4.25s", animationDirection: "reverse" }}
          >
            <div
              className="absolute left-0 top-1/2 bg-rose-500 group-hover:bg-rose-600 rounded-full"
              style={{ width: "0.75em", height: "0.75em", transform: "translateY(-50%)" }}
            />
            <div
              className="absolute right-0 top-1/2 bg-stone-300 group-hover:bg-stone-400 rounded-full"
              style={{ width: "0.5em", height: "0.5em", transform: "translateY(-50%)" }}
            />
          </div>
        </div>

        {/* Center */}
        <div
          className="relative flex items-center justify-center rounded-full border border-stone-200 bg-stone-100 shadow-inner group-hover:border-stone-300"
          style={{ width: "4.5em", height: "4.5em" }}
        >
          <div className="absolute bg-stone-300" style={{ width: "2.5em", height: "0.0625em" }} />
          <div className="absolute bg-stone-300" style={{ width: "0.0625em", height: "2.5em" }} />
          <div className="rounded-full bg-stone-900" style={{ width: "1.2em", height: "1.2em" }} />
          <div
            className="absolute rounded-full bg-rose-500"
            style={{ right: "1em", bottom: "0.8em", width: "0.35em", height: "0.35em" }}
          />
        </div>

        {/* Text */}
        <div className="absolute bottom-4 text-xs font-medium uppercase tracking-widest text-stone-400 group-hover:text-stone-500">
          Loading
        </div>

        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}