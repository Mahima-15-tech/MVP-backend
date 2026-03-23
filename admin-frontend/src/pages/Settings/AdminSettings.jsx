import ProfileSection from "./ProfileSection";
import ChangePassword from "./ChangePassword";
import AdminManagement from "./AdminManagement";
import SystemTools from "./SystemTools";
import { isSuperAdmin } from "../../utils/role";

export default function Settings() {
  
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Settings
          </h1>
          <p className="text-gray-500 mt-2">
            Manage profile, security and system access
          </p>
        </div>

        <ProfileSection />

        <ChangePassword />

        {isSuperAdmin() && <AdminManagement />}

        {isSuperAdmin() && <SystemTools />}

      </div>
    </div>
  );
}