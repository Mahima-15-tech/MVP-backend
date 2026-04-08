import { useEffect, useState } from "react";
import api from "../api/axios";
import { Eye } from "lucide-react";
import TicketModal from "../components/TicketModal";
import EmptyState from "../components/EmptyState";

export default function SupportTickets() {

const [tickets,setTickets] = useState([]);
const [filter,setFilter] = useState("ALL");
const [search,setSearch] = useState("");
const [selected,setSelected] = useState(null);
const [page,setPage] = useState(1);
const itemsPerPage = 8;


useEffect(()=>{
fetchTickets();
},[]);

const fetchTickets = async()=>{
try{

const res = await api.get("/support");

setTickets(res.data);

}catch(err){
console.error(err);
}
};

const getEmptyMessage = () => {
  if (filter === "OPEN") return "No open requests";
  if (filter === "IN_PROGRESS") return "No issues in progress";
  if (filter === "RESOLVED") return "No resolved issues";
  return "No records found";
};

/* ================= FILTER ================= */

const filtered = tickets.filter(t=>{

const matchStatus =
filter === "ALL" || t.status === filter;

const matchSearch =
t.subject.toLowerCase().includes(search.toLowerCase()) ||
t.email.toLowerCase().includes(search.toLowerCase());

return matchStatus && matchSearch;

});

const totalPages = Math.ceil(filtered.length / itemsPerPage);

const paginatedData = filtered.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
);

useEffect(()=>{
  setPage(1);
},[filter,search]);

/* ================= STATS ================= */

const open = tickets.filter(t=>t.status==="OPEN").length;
const progress = tickets.filter(t=>t.status==="IN_PROGRESS").length;
const resolved = tickets.filter(t=>t.status==="RESOLVED").length;


return(

<div className="space-y-10">


{/* ================= FILTER BAR ================= */}

<div
className="
bg-[#B5B9B2]
rounded-4xl
px-6
py-5
flex
items-center
gap-4

"
>

{/* SEARCH */}

<input
type="text"
placeholder="Search Requests..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="
bg-white
rounded-full
px-6
py-3
w-[260px]
outline-none
text-[#5a6c7d]
"
/>


{/* STATUS PILLS */}

{[
{label:"All",value:"ALL"},
{label:"Open",value:"OPEN"},
{label:"In Progress",value:"IN_PROGRESS"},
{label:"Resolved",value:"RESOLVED"}
].map(s=>(

<button
key={s.value}
onClick={()=>setFilter(s.value)}
className={`
px-14
py-3
rounded-full
font-semibold

${filter===s.value
? "bg-[#002c3e] text-white"
: "bg-white text-[#5a6c7d]"
}
`}
>

{s.label}

</button>

))}

</div>



{/* ================= STATS ================= */}

<div className="grid grid-cols-3 gap-6">

<div onClick={()=>setFilter("OPEN")} className="cursor-pointer">
  <Card label="Open Requests" value={open} error active={filter==="OPEN"} />
</div>

<div onClick={()=>setFilter("IN_PROGRESS")} className="cursor-pointer">
  <Card label="In Progress" value={progress} error active={filter==="IN_PROGRESS"} />
</div>

<div onClick={()=>setFilter("RESOLVED")} className="cursor-pointer">
  <Card label="Resolved" value={resolved} active={filter==="RESOLVED"} />
</div>

</div>



{/* ================= TABLE ================= */}
<div className="bg-white rounded-4xl overflow-hidden border border-[#e6e6e6]">

  <table className="w-full text-[16px]">

    {/* ✅ HEADER ALWAYS VISIBLE */}
    <thead className="bg-[#78bcc4] text-white">
      <tr>
        <th className="px-6 py-5 text-left first:rounded-tl-4xl">User ID</th>
        <th className="px-3 py-5 text-left">User Name</th>
        <th className="px-6 py-5 text-left">Email</th>
        <th className="px-6 py-5 text-left">Subject</th>
        <th className="px-6 py-5 text-left">Status</th>
        <th className="px-6 py-5 text-left">Date</th>
        <th className="px-6 py-5 text-left last:rounded-tr-4xl">View</th>
      </tr>
    </thead>

    <tbody className="text-[#5a6c7d]">

      {/* ✅ EMPTY STATE INSIDE TABLE */}
      {filtered.length === 0 ? (

        <tr>
          <td colSpan="7" className="py-20 text-center">

            <div className="flex flex-col items-center gap-2">

              <p className="text-lg font-semibold text-[#5a6c7d]">
                {getEmptyMessage()}
              </p>

              <p className="text-sm text-[#a0a0a0]">
                Try adjusting filters or search
              </p>

            </div>

          </td>
        </tr>

      ) : (

        paginatedData.map((t,i)=>(

          <tr
            key={i}
            className="border-b border-[#e5e5e5] hover:bg-[#f7f8f3] transition"
          >

            <td className="px-4 py-4">{t.userId?.phone || "-"}</td>

            <td className="px-6 py-4 font-semibold">
              {t.userId?.name || "User"}
            </td>

            <td className="px-6 py-4">{t.email}</td>

            <td className="px-6 py-4">{t.subject}</td>

            <td className={`px-6 py-4 font-semibold
              ${t.status==="OPEN"
                ? "text-[#ee6a59]"
                : t.status==="IN_PROGRESS"
                ? "text-[#f59e0b]"
                : "text-[#78bcc4]"
              }`}>
              {t.status.toLowerCase().replace("_"," ").replace(/^\w/, c => c.toUpperCase())}
            </td>

            <td className="px-6 py-4">
              {new Date(t.createdAt).toLocaleDateString()}
            </td>

            <td className="px-6 py-4">
              <button
                onClick={()=>setSelected(t)}
                className="text-[#78bcc4]"
              >
                <Eye size={18}/>
              </button>
            </td>

          </tr>

        ))

      )}

    </tbody>

  </table>

</div>



{/* ================= PAGINATION ================= */}

{totalPages > 1 && (
<div className="flex justify-center items-center gap-6">

<button
onClick={()=>setPage(p => Math.max(p-1,1))}
disabled={page === 1}
className="border-[#5a6c7d] border-2 text-[#5a6c7d] font-semibold px-6 py-2 rounded-full disabled:opacity-40"
>
Back
</button>

<span className="text-[#5a6c7d]">
Page {page} of {totalPages}
</span>

<button
onClick={()=>setPage(p => Math.min(p+1,totalPages))}
disabled={page === totalPages}
className="bg-[#002c3e] text-white px-6 py-2 rounded-full disabled:opacity-40"
>
Next
</button>

<p className="text-center text-sm text-[#9aa7b2] mt-2">
Showing {paginatedData.length} of {filtered.length} results
</p>

</div>
)}

{selected && (
    <TicketModal
      ticket={selected}
      onClose={() => setSelected(null)}
      refresh={fetchTickets}
    />
  )}





</div>

);
}



/* ================= CARD ================= */

function Card({label,value,error}){

return(

<div className="bg-[#f5f5f5] rounded-4xl px-8 py-6">

<p className="text-[#5a6c7d] text-lg font-semibold">

{label}

</p>

<p className={`text-[48px] font-semibold mt- ${error ? "text-[#ee6a59]" : "text-[#002c3e]"}`}>

{value}

</p>

</div>

);

}

