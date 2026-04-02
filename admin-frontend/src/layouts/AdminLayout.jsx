import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ScrollToTop from "../components/ScrollToTop";


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

{/* 🔹 BACKGROUND + TOP BORDER */}
<div 
  className="
  
  absolute inset-0 
  bg-[#d8dbd6]
  rounded-tl-[90px]
  -mt-3
  ml-4
  shadow-[inset_0_10px_0px_rgba(198,203,195,0.8)]
  z-0
  pointer-events-none
"
/>

{/* 🔹 SCROLL CONTENT */}
<ScrollToTop />

<div id="main-scroll"
  className="
  absolute
  inset-0
  ml-10
  pt-10
  px-10
  pb-10
  overflow-y-auto
  z-10
"
>
  {children}
</div>

</div>

      </div>

    </div>
  );
}