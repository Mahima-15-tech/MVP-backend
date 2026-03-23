import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#f7f8f3] overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Right Side */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <Topbar />

        {/* Curved Dashboard Container */}
        <div className="flex-1 relative -mt-2">
        <div
  className="
  absolute inset-0
  bg-[#d8dbd6]
  rounded-tl-[90px]
  -mt-4
  ml-6
  pt-10
  px-10
  pb-10
  overflow-y-auto
  shadow-[inset_0_8px_0px_rgba(198,203,195,0.6),inset_6px_0_10px_rgba(198,203,195,0.6)]
"
>
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}