export default function EmptyState({
    title = "No data found",
    subtitle = "Try adjusting filters or search"
  }) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
  
        <p className="text-lg font-semibold text-[#5a6c7d]">
          {title}
        </p>
  
        <p className="text-sm text-[#a0a0a0] mt-1">
          {subtitle}
        </p>
  
      </div>
    );
  }