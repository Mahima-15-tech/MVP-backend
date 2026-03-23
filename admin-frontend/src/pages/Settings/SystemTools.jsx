import api from "../../api/axios";

export default function SystemTools() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
      
      <h3 className="text-xl font-semibold text-gray-800">
        System Tools
      </h3>

      <div className="flex gap-4">
        <button
          onClick={() => api.post("/admin/test/missed-checkin")}
          className="px-5 py-3 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
        >
          Trigger Missed Check-in
        </button>

        <button
          onClick={() => api.post("/admin/test/sos")}
          className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
        >
          Trigger SOS Alert
        </button>
      </div>
    </div>
  );
}