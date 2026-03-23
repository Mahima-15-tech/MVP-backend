import { useState } from "react";
import api from "../api/axios";

export default function TicketModal({ ticket, onClose, refresh }) {

    const [status, setStatus] = useState(ticket?.status);;
const [priority,setPriority] = useState(ticket?.priority);
const [reply,setReply] = useState("");

/* ================= UPDATE ================= */

const updateTicket = async()=>{

await api.put(`/support/${ticket._id}`,{
status,
priority
});

refresh();

};

/* ================= REPLY ================= */

const sendReply = async()=>{

if(!reply) return;

await api.post(`/support/${ticket._id}/reply`,{
message:reply
});

setReply("");

refresh();

};

/* ================= SLA ================= */

const getSlaHours = ()=>{

const created = new Date(ticket.createdAt);
const now = new Date();

return Math.floor((now - created) / (1000*60*60));

};


return(

<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">


<div className="bg-white w-full max-w-4xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">


{/* ================= HEADER ================= */}

<div className="px-8 py-6 border-b border-[#e6e6e6] flex justify-between">

<div>

<h2 className="text-2xl font-semibold text-[#002c3e]">

{ticket.subject}

</h2>

<div className="flex items-center gap-3 mt-3">

{/* SLA */}

<span className="px-4 py-1 rounded-full bg-[#f5f5f5] text-[#5a6c7d] text-sm">

SLA {getSlaHours()} hrs

</span>


{/* PRIORITY */}

<span
className={`
px-4
py-1
rounded-full
text-sm
font-semibold
${
priority==="HIGH"
? "bg-red-100 text-red-600"
: priority==="MEDIUM"
? "bg-yellow-100 text-yellow-600"
: "bg-green-100 text-green-600"
}
`}
>

{priority}

</span>


{/* STATUS */}

<span
className={`
px-4
py-1
rounded-full
text-sm
font-semibold
${
status==="OPEN"
? "bg-red-100 text-red-600"
: status==="IN_PROGRESS"
? "bg-yellow-100 text-yellow-600"
: "bg-green-100 text-green-600"
}
`}
>

{status.replace("_"," ")}

</span>

</div>

</div>


<button
onClick={onClose}
className="text-gray-400 hover:text-gray-600 text-xl"
>

✕

</button>

</div>



{/* ================= BODY ================= */}

<div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">


{/* STATUS CONTROLS */}

<div className="flex gap-4">

<select
value={status}
onChange={(e)=>setStatus(e.target.value)}
className="px-4 py-2 rounded-xl border border-[#e6e6e6]"
>

<option>OPEN</option>
<option>IN_PROGRESS</option>
<option>RESOLVED</option>

</select>


<select
value={priority}
onChange={(e)=>setPriority(e.target.value)}
className="px-4 py-2 rounded-xl border border-[#e6e6e6]"
>

<option>LOW</option>
<option>MEDIUM</option>
<option>HIGH</option>

</select>


<button
onClick={updateTicket}
className="bg-[#002c3e] text-white px-6 py-2 rounded-xl"
>

Update Ticket

</button>

</div>



{/* ORIGINAL MESSAGE */}

<div className="bg-[#f5f5f5] border border-[#e6e6e6] rounded-2xl p-5">

<p className="text-[#002c3e] leading-relaxed">

{ticket.description}

</p>

</div>



{/* ================= CHAT THREAD ================= */}

<div className="space-y-4">

{ticket.replies.map((r,i)=>{

const isAdmin = r.sender === "ADMIN";

return(

<div
key={i}
className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
>

<div
className={`
max-w-md
px-4
py-3
rounded-2xl
text-sm
shadow-sm
${
isAdmin
? "bg-[#002c3e] text-white rounded-br-md"
: "bg-[#f5f5f5] text-[#002c3e] rounded-bl-md"
}
`}
>

<div className="text-xs font-semibold opacity-70 mb-1">

{r.sender}

</div>

{r.message}

</div>

</div>

);

})}

</div>

</div>



{/* ================= FOOTER ================= */}

<div className="border-t border-[#e6e6e6] px-8 py-6">


<textarea
value={reply}
onChange={(e)=>setReply(e.target.value)}
placeholder="Write reply..."
className="
w-full
border
border-[#e6e6e6]
rounded-2xl
p-4
outline-none
resize-none
"
rows={3}
/>

<div className="flex justify-end mt-4">

<button
onClick={sendReply}
className="
bg-[#002c3e]
text-white
px-8
py-2
rounded-xl
"
>

Send Reply

</button>

</div>

</div>


</div>

</div>

);

}