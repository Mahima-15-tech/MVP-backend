import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Siren,
  Clock,
  MessageSquare,
  MessageCircle,
  Settings,
  LogOut,
  ChevronDown,

} from "lucide-react";


import { useState } from "react";

export default function Sidebar() {
  const [openSettings,setOpenSettings] = useState(false);
  const [showLogout,setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token"); // ya jo tum use kar rhi ho
    window.location.href = "/";
  };
  return (
<div className="w-64 h-screen bg-[#f7f8f3] flex flex-col">

    {/* LOGO */}
    <div className="ml-6">
    <div className="flex justify-center mt-11.5 h-[120px]">
  <img 
    src="/logo2.png"   // ✅ correct path
    alt="logo"
    className="h-full w-full object-contain"
  />
</div>
    </div>

      {/* MENU */}

<nav className="flex-1 px-4 py-22 space-y-2 overflow-y-auto scrollbar-hide scroll-smooth">

        <SidebarItem
          to="/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
        />

        <SidebarItem
          to="/users"
          label="Users"
          icon={Users}
        />

        <SidebarItem
          to="/alerts"
          label="Alerts"
          icon={Siren}
        />

        <SidebarItem
          to="/checkins"
          label="SMS Tracker"
          icon={Clock}
        />

        <SidebarItem
          to="/sms-logs"
          label="Revenue"
          icon={MessageSquare}
        />

        <SidebarItem
          to="/support"
          label="Support"
          icon={MessageCircle}
          badge={2}
        />

<div>

<button
onClick={()=>setOpenSettings(!openSettings)}
className="
flex items-center justify-between
px-4 py-3 w-full rounded-full
text-[#5a6c7d] hover:bg-gray-100
"
>

<div className="flex items-center gap-3">
  <Settings size={20}/>
  <span className="font-medium">Settings</span>
</div>

{/* RIGHT ARROW */}
<ChevronDown
  size={18}
  className={`transition-transform duration-300 ${
    openSettings ? "rotate-180" : ""
  }`}
/>

</button>


{openSettings && (

<div className="ml-6 mt-2 pl-4 border-l border-[#d5dbe1] space-y-2">

  <NavLink
    to="/settings/profile"
    className={({isActive}) =>
    `block px-4 py-2 rounded-full text-md font-medium
    ${isActive
      ? "bg-[#78bcc4] text-white"
      : "text-[#5a6c7d] hover:bg-gray-100"}`
    }
  >
    Profile
  </NavLink>

  <NavLink
    to="/settings/security"
    className={({isActive}) =>
    `block px-4 py-2 rounded-full text-md font-medium
    ${isActive
      ? "bg-[#78bcc4] text-white"
      : "text-[#5a6c7d] hover:bg-gray-100"}`
    }
  >
    Security
  </NavLink>

  <NavLink
    to="/settings/system-health"
    className={({isActive}) =>
    `block px-4 py-2 rounded-full text-md font-medium 
    ${isActive
      ? "bg-[#78bcc4] text-white"
      : "text-[#5a6c7d] hover:bg-gray-100"}`
    }
  >
    System Status
  </NavLink>

</div>

)}

</div>





      </nav>


{/* SIGN OUT */}

<div className="px-8 pb-6">
<button 
onClick={()=>setShowLogout(true)}
className="flex items-center gap-3 text-[#5a6c7d] hover:text-[#002c3e]"
>
  <LogOut size={20} />
  <span className="font-medium">Sign Out</span>
</button>
</div>
   

      {/* FOOTER */}

      <div className="bg-[#002c3e] text-[#a8b6c2] text-xs px-6 w-72 py-4">

        SOLO © 2026 Social Rebels™  
        Design Admin Panel

      </div>

      {showLogout && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* OVERLAY */}
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      onClick={()=>setShowLogout(false)}
    />

    {/* MODAL */}
    <div className="
      relative z-10
      bg-white
      w-[400px]
      rounded-2xl
      shadow-xl
      p-6
      text-center
    ">

      <h2 className="text-xl font-semibold text-[#002c3e] mb-2">
        Sign Out
      </h2>

      <p className="text-[#5a6c7d] mb-6">
        Are you sure you want to sign out?
      </p>

      <div className="flex justify-center gap-4">

        {/* CANCEL */}
        <button
          onClick={()=>setShowLogout(false)}
          className="
          px-6 py-2 rounded-full
          bg-[#b6b9b3]
          text-white font-medium
          hover:opacity-90
          "
        >
          Cancel
        </button>

        {/* CONFIRM */}
        <button
          onClick={handleLogout}
          className="
          px-6 py-2 rounded-full
          bg-[#002c3e]
          text-white font-medium
          hover:opacity-90
          "
        >
          Yes, Sign Out
        </button>

      </div>

    </div>
  </div>
)}

    </div>
  );
}

function SidebarItem({ to, label, icon: Icon, badge }) {

  return (

    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-4 py-3 rounded-full transition 
        ${
          isActive
            ? "bg-[#002c3e] text-[#f5f5f5]"
            : "text-[#5a6c7d] hover:bg-gray-100"
        }`
      }
    >

      <div className="flex items-center gap-3  ">

        <Icon size={20}  />

        <span className="font-medium">{label}</span>

      </div>

      {badge && (
        <span className="bg-[#ee6a59] text-[#f5f5f5] text-sm font-bold px-2 py-1 rounded-full">
          {badge}
        </span>
      )}




    </NavLink>
  );
}


