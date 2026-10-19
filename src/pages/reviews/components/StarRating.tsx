interface StarRatingProps {
  onChange?: (rating: number) => void;
  rating: number;
  size?: "small" | "large";
}

export function StarRating({ onChange, rating, size = "small" }: StarRatingProps) {
  return (
    <div aria-label={`별점 ${rating}점`} className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) =>
        onChange ? (
          <button
            aria-label={`${value}점`}
            className={`${size === "large" ? "size-11 text-3xl" : "size-7 text-lg"} inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-primary`}
            key={value}
            onClick={() => onChange(value)}
            type="button"
          >
            <span aria-hidden="true" className={value <= rating ? "text-[#f2b84b]" : "text-border-strong"}>★</span>
          </button>
        ) : (
          <span aria-hidden="true" className={value <= rating ? "text-[#f2b84b]" : "text-border-strong"} key={value}>★</span>
        ),
      )}
    </div>
  );
}
