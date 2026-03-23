import { Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { pageTitles } from "../config/pageTitles";

export default function Topbar() {

  const location = useLocation();
  const path = location.pathname;

  let page = pageTitles[path];

  /* dynamic routes handle */

  if (!page) {
    if (path.startsWith("/users/")) {
      page = {
        title: "User Details",
        subtitle: "View and Manage User Information"
      };
    }
  }

  if (!page) {
    page = {
      title: "Admin Dashboard",
      subtitle: "Real-time system overview"
    };
  }

  return (

    <div className="flex justify-between items-center px-10 py-12 mt-10">

      {/* TITLE */}
      <div className="ml-8 mt-2">

        <h2 className="text-4xl font-semibold text-[#002c3e] tracking-wide">
          {page.title}
        </h2>

        <p className="text-md font-medium tracking-wide mt-0.5 text-[#5a6c7d]">
          {page.subtitle}
        </p>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        <div className="w-12 h-6 bg-[#d1d5db] rounded-full flex items-center px-1">
          <div className="w-5 h-5 bg-[#f5f5f5] rounded-full flex items-center justify-center">
            <Sun size={12} color="#f5b13e" />
          </div>
        </div>

        <div className="w-10 h-10 bg-[#002c3e] text-white rounded-full flex items-center justify-center font-semibold text-lg shadow-sm hover:scale-105 transition-all duration-300">
  A
</div>

      </div>

    </div>
  );
}