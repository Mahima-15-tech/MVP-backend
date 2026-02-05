import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="main-area">
        {/* Mobile header */}
        <div className="mobile-header">
          <button onClick={() => setOpen(true)}>☰</button>
          <h2>Admin Panel</h2>
        </div>

        <div className="content">{children}</div>
      </div>
    </div>
  );
}
