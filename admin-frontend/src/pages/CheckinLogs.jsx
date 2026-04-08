import { useEffect, useState } from "react";
import api from "../api/axios";
import EmptyState from "../components/EmptyState";

export default function SmsTracker(){

const [data,setData] = useState([]);
const [loading,setLoading] = useState(true);

const [search,setSearch] = useState("");
const [consent,setConsent] = useState("ALL");
const [status,setStatus] = useState("ALL");

const [page,setPage] = useState(1);

/* ================= FETCH ================= */

useEffect(()=>{
fetchData();
},[consent,status,page]);

const fetchData = async()=>{

try{

setLoading(true);

const res = await api.get("/admin/sms-tracker",{
params:{
search,
consent,
status,
page
}
});

setData(res.data);

}
catch(err){
console.error(err);
}
finally{
setLoading(false);
}

};


/* ================= SUMMARY ================= */

const total = data.length;
const sent = data.filter(d=>d.status==="SENT").length;
const pending = data.filter(d=>d.status==="PENDING").length;
const failed = data.filter(d=>d.status==="FAILED").length;


/* ================= DROPDOWN ================= */

const [open,setOpen] = useState(false);

const consentOptions = [
"All",
"Opted In",
"Opted Out",
"Pending"
];


return(

<div className="space-y-10">

{/* ================= FILTER BAR ================= */}

<div
className="
bg-[#B5B9B2]
rounded-4xl
px-4
py-5
flex
items-center
gap-2

"
>

{/* SEARCH */}

<input
type="text"
placeholder="Search Recipient..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
onBlur={fetchData}
className="
bg-white
rounded-full
px-6
py-3
w-[260px]
outline-none
text-[#002c3e]
"
/>


{/* CONSENT DROPDOWN */}

<div className="relative">

<button
onClick={()=>setOpen(!open)}
className="
bg-[#002c3e]
text-white
px-6
py-2
rounded-full
flex
items-center
gap-2

"
>
Consent  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10l5 5 5-5" />
  </svg>
</button>

{open && (

<div
className="
absolute
top-13
left-0
bg-[#7f837f]
text-white
rounded-4xl
overflow-hidden
shadow-lg
py-2
"
>

{consentOptions.map(opt=>(

<div
key={opt}
onClick={()=>{

setConsent(opt);
setOpen(false);

}}
className="
px-5
py-2
cursor-pointer
hover:bg-[#6f736f]

"
>

{opt.replace("_"," ")}

</div>

))}

</div>

)}

</div>


{/* STATUS FILTER */}

{["Sent","Pending","Failed","Delivered"].map(s=>(

<button
key={s}
onClick={()=>setStatus(s)}
className={`
px-12
py-3
rounded-full
font-semibold
tracking-wide
${status===s
? "bg-[#002c3e] text-white"
: "bg-white text-[#5a6c7d]"
}
`}
>

{s}

</button>

))}

</div>


{/* ================= SUMMARY ================= */}

<div className="grid grid-cols-4 gap-6">

<Card label="Users Triggered" value={total}/>

<Card label="SMS Sent" value={sent}/>

<Card label="SMS Pending" value={pending}/>

<Card label="SMS Failed" value={failed} error/>

</div>



{/* ================= TABLE ================= */}

<div className="bg-white rounded-4xl overflow-hidden">

{loading ?(

<div className="p-10 text-center text-gray-400">
Loading...
</div>

):(

<table className="w-full text-[17px] ">

<thead className="bg-[#78bcc4] text-white tracking-wide">

<tr>

<th className="px-6 py-5 text-left">Recipient</th>

<th className="px-6 py-5 text-left">Phone</th>

<th className="px-6 py-5 text-left">Consent</th>

<th className="px-6 py-5 text-left leading-5">Alerts Type</th>

<th className="px-4 py-5 text-left leading-5">Alert Sent At</th>

<th className="px-6 py-5 text-left">Status</th>

<th className="px-6 py-5 text-left">Attempts</th>

<th className="px-6 py-5 text-left">Failure Reason</th>

</tr>

</thead>


<tbody className="text-[#5a6c7d]">

{data.length === 0 ? (
  <tr>
    <td colSpan="8">
      <EmptyState
        title="No SMS records found"
        subtitle="Try adjusting filters or search"
      />
    </td>
  </tr>
) :  data.map((row,i)=>(

<tr
key={i}
className="
border-b
border-[#e5e5e5]
hover:bg-[#f7f8f3]
"
>

<td className="px-6 py-4 font-semibold">
{row.name}
</td>

<td className="px-6 py-4">
{row.phone}
</td>

<td className="px-6 py-4">
{row.consent}
</td>

<td
className={`
px-6 py-4 font-semibold
${row.alertType==="MISSED" || row.alertType==="SOS"
? "text-[#ee6a59]"
: ""
}
`}
>
{row.alertType}
</td>

<td className="px-6 py-4">
{new Date(row.createdAt).toLocaleString()}
</td>

<td
className={`
px-6 py-4 font-semibold
${row.status==="SENT"
? "text-[#78bcc4]"
: "text-[#ee6a59]"
}
`}
>
{row.status}
</td>

<td className="px-6 py-4">
{row.retryCount} | 5
</td>

<td className="px-6 py-4">
{row.failureReason || "-"}
</td>

</tr>

))}

</tbody>

</table>

)}

</div>



{/* ================= PAGINATION ================= */}

<div className="flex justify-center items-center gap-6">

<button
onClick={()=>setPage(p=>Math.max(p-1,1))}
className="
border-[#5a6c7d]
border-2
text-[#5a6c7d]
font-semibold
px-6
py-2
rounded-full
"
>
Back
</button>

<span className="text-[#5a6c7d]">
Page {page}
</span>

<button
onClick={()=>setPage(p=>p+1)}
className="
bg-[#002c3e]
text-white
px-6
py-2
rounded-full
"
>
Next
</button>

</div>

</div>

);
}



/* ================= CARD ================= */

function Card({label,value,error}){

return(

<div className="bg-[#f5f5f5] rounded-4xl px-8 py-6">

<p className="text-[#5a6c7d] text-lg tracking-wide font-semibold">
{label}
</p>

<p className={`text-[48px] font-semibold mt-2 ${error ? "text-[#ee6a59]" : "text-[#002c3e]"}`}>
{value}
</p>

</div>

);

}