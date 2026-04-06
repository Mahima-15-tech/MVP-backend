import { useState } from "react";
import api from "../api/axios";

export default function TicketModal({ ticket, onClose, refresh }) {

  const [status, setStatus] = useState(ticket?.status);
  const [priority, setPriority] = useState(ticket?.priority);
  const [reply, setReply] = useState("");

  const updateTicket = async () => {
    await api.put(`/support/${ticket._id}`, { status, priority });
    refresh();
  };

  const sendReply = async () => {
    if (!reply) return;
    await api.post(`/support/${ticket._id}/reply`, { message: reply });
    setReply("");
    refresh();
  };

  const getSlaHours = () => {
    const created = new Date(ticket.createdAt);
    const now = new Date();
    return Math.floor((now - created) / (1000 * 60 * 60));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-6">

      <div className="bg-white w-full max-w-4xl rounded-[30px] shadow-[0_30px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh]">

        {/* ================= HEADER ================= */}
        <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-start bg-white">

          <div>
            <h2 className="text-2xl font-semibold text-[#002c3e]">
              {ticket.subject}
            </h2>

            <div className="flex gap-3 mt-3">

              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                SLA {getSlaHours()} hrs
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${priority==="HIGH"
                  ? "bg-red-100 text-red-600"
                  : priority==="MEDIUM"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-600"
                }`}>
                {priority}
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${status==="OPEN"
                  ? "bg-red-100 text-red-600"
                  : status==="IN_PROGRESS"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-600"
                }`}>
                {status.replace("_"," ")}
              </span>

            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-lg"
          >
            ✕
          </button>

        </div>

        {/* ================= BODY ================= */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-[#fafafa]">

          {/* CONTROLS */}
          <div className="
flex gap-3 
bg-[#beced2] 
p-3 
rounded-2xl 
shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)]
w-fit
">

<div className="relative">

<select
  value={status}
  onChange={(e)=>setStatus(e.target.value)}
  className="
  appearance-none
  px-5 py-2.5
  rounded-full
  bg-white/90
  backdrop-blur-md
  text-[#002c3e]
  text-sm font-semibold
  shadow-[0_2px_6px_rgba(0,0,0,0.1)]
  border border-white/40
  focus:border-[#002c3e]
  focus:ring-2 focus:ring-[#002c3e]/10
  cursor-pointer
  pr-10
  transition
  hover:shadow-md
  "
>
  <option>OPEN</option>
  <option>IN_PROGRESS</option>
  <option>RESOLVED</option>
</select>

{/* CUSTOM ARROW */}
<span className="
absolute right-4 top-1/2 -translate-y-1/2
text-[#5a6c7d] text-xs pointer-events-none
">
  ▼
</span>

</div>

<select
  value={priority}
  onChange={(e)=>setPriority(e.target.value)}
  className="
  appearance-none
  px-5 py-2
  rounded-full
  bg-white
  text-[#002c3e]
  text-sm font-semibold
  shadow-sm
  border border-transparent
  focus:border-[#002c3e]
  focus:ring-2 focus:ring-[#002c3e]/10
  cursor-pointer
  pr-10
  "
>
  <option>LOW</option>
  <option>MEDIUM</option>
  <option>HIGH</option>
</select>

            <button
              onClick={updateTicket}
              className="bg-[#002c3e] text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90"
            >
              Update Ticket
            </button>

          </div>

          {/* ORIGINAL MESSAGE */}
          <div className="bg-white border rounded-2xl px-6 py-5 shadow-sm">
            <p className="text-[#002c3e] text-[15px] leading-relaxed font-medium">
              {ticket.description}
            </p>
          </div>

          {/* CHAT */}
          <div className="space-y-4">

            {ticket.replies.map((r,i)=>{
              const isAdmin = r.sender === "ADMIN";

              return(
                <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>

                  <div className={`
                    max-w-md px-5 py-3 rounded-2xl text-sm shadow-sm
                    ${isAdmin
                      ? "bg-[#002c3e] text-white"
                      : "bg-white border text-[#002c3e]"
                    }
                  `}>

                    <p className="text-[11px] font-semibold opacity-60 mb-1">
                      {r.sender}
                    </p>

                    <p className="leading-relaxed">
                      {r.message}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

        {/* ================= FOOTER ================= */}
        <div className="border-t bg-white px-8 py-6">

          <textarea
            value={reply}
            onChange={(e)=>setReply(e.target.value)}
            placeholder="Write reply..."
            rows={3}
            className="w-full border rounded-2xl px-5 py-4 outline-none resize-none focus:ring-2 focus:ring-[#002c3e]/20 text-[#002c3e] placeholder-gray-400"
          />

          <div className="flex justify-end mt-4">

            <button
              onClick={sendReply}
              className="bg-[#002c3e] text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 shadow"
            >
              Send Reply
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}