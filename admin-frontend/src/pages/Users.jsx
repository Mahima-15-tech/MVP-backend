import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { TbRefresh } from "react-icons/tb";
import CustomDatePicker from "../components/CustomDatePicker";

export default function Users() {

const [users,setUsers]=useState([])
const [page,setPage]=useState(1)
const [loading,setLoading]=useState(true)
const [search,setSearch]=useState("")
const [fromDate,setFromDate]=useState("")
const [toDate,setToDate]=useState("")
const [stats,setStats]=useState({})
const [regions,setRegions]=useState({})
const [countries,setCountries]=useState([])
const [totalPages,setTotalPages]=useState(1)
const [rowsPerPage,setRowsPerPage]=useState(10)
const [searchInput,setSearchInput] = useState("")

const [confirmUser,setConfirmUser]=useState(null)

const [openExport, setOpenExport] = useState(false);
const exportRef = useRef();

useEffect(() => {
  const handleClickOutside = (e) => {
    if (exportRef.current && !exportRef.current.contains(e.target)) {
      setOpenExport(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);



const navigate=useNavigate()
useEffect(()=>{
  fetchUsers()
  },[page,rowsPerPage,search])

useEffect(()=>{

  const delay = setTimeout(()=>{
  setSearch(searchInput)
  },500)
  
  return ()=> clearTimeout(delay)
  
  },[searchInput])

const fetchUsers=async()=>{

try{

setLoading(true)

const res=await api.get("/admin/users/dashboard-ultra",{
params:{
page,
limit:rowsPerPage,
search,
from:fromDate,
to:toDate
}
})

setUsers(res.data.users.data)
setTotalPages(res.data.users.pages)

setStats(res.data.stats)
setRegions(res.data.regions)
setCountries(res.data.countries)

}
catch(err){
console.error(err)
}
finally{
setLoading(false)
}

}

const toggleBan = async (user) => {

try{

if(user.status==="ACTIVE"){

await api.patch(`/admin/users/${user._id}/ban`,{
reason:"Admin action"
})

}else{

await api.patch(`/admin/users/${user._id}/unban`)

}

fetchUsers()

setConfirmUser(null)

}catch(err){

console.error(err)

}

}

const formatDate=(date)=>{
if(!date) return "-"
const d=new Date(date)
const day=String(d.getDate()).padStart(2,"0")
const month=String(d.getMonth()+1).padStart(2,"0")
const year=String(d.getFullYear()).slice(-2)
return `${day}/${month}/${year}`
}

if(loading){
return(
<div className="space-y-4">
{Array.from({length:6}).map((_,i)=>(
<div key={i} className="h-16 bg-gray-200 animate-pulse rounded-xl"/>
))}
</div>
)
}

const handleExport = async (type) => {

  try{
  
  const url =
  type === "csv"
  ? "/admin/users/export-csv"
  : "/admin/users/export-full"
  
  const res = await api.get(
  url,
  {
  params:{
  from:fromDate,
  to:toDate
  },
  responseType:"blob"
  }
  )
  
  const blob = new Blob([res.data])
  const link = document.createElement("a")
  
  link.href = window.URL.createObjectURL(blob)
  link.download = `users.${type}`
  
  document.body.appendChild(link)
  link.click()
  
  }catch(err){
  
  console.error(err)
  
  }
  
  }

return(

<div className="space-y-8">

{/* TOOLBAR */}

<div className="bg-[#B5B9B2] rounded-4xl px-4 py-4 flex items-center gap-3">

<input
type="text"
placeholder="Search Users..."
value={searchInput}
onChange={(e)=>setSearchInput(e.target.value)}
className="bg-white rounded-full px-6 py-3 w-[340px] outline-none text-[#002c3e]"
/>

<button
onClick={fetchUsers}
className="bg-white w-17 h-10  rounded-full flex items-center justify-center"
>
<img 
  src="/exchange.png" 
  alt="refresh" 
  className="w-6 h-6"
/>
</button>

<CustomDatePicker
  value={fromDate}
  onChange={(date) => setFromDate(date)}
  placeholder="From"
/>

<CustomDatePicker
  value={toDate}
  onChange={(date) => setToDate(date)}
  placeholder="To"
/>

<button
onClick={()=>{
setPage(1)
fetchUsers()
}}
className="bg-[#002c3e] text-white px-6 py-3 rounded-full"
>
Apply
</button>

<div className="relative" ref={exportRef}>

  {/* BUTTON */}
  <button
    onClick={() => setOpenExport(!openExport)}
    className="bg-[#002c3e] text-white px-6 py-3 rounded-full flex items-center gap-2"
  >
    Export

    {/* arrow */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-4 h-4 transition ${openExport ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10l5 5 5-5" />
    </svg>
  </button>

  {/* DROPDOWN */}
  {openExport && (
    <div className="absolute right-0 mt-2 w-28 bg-[#7f817d] rounded-xl shadow-lg p-2 z-50">

    {/* CSV */}
    <div
      onClick={() => {
        handleExport("csv");
        setOpenExport(false);
      }}
      className="px-3 py-1.5 rounded-md cursor-pointer text-[#f5f5f5] hover:bg-[#4c4e4a] transition"
    >
      CSV
    </div>
  
    {/* PDF */}
    <div
      onClick={() => {
        handleExport("pdf");
        setOpenExport(false);
      }}
      className="px-3 py-1.5 rounded-md cursor-pointer text-[#f5f5f5] hover:bg-[#4c4e4a] transition"
    >
      PDF
    </div>
  
  </div>
  )}

</div>

</div>


{/* STATS ROW 1 */}

<div className="grid grid-cols-4 gap-6">

<StatCard title="Total Users" value={stats.totalUsers || 0}/>
<StatCard title="Trial Users" value={stats.trialUsers || 0}/>
<StatCard title="Active Subscribers" value={stats.activeSubscribers || 0}/>
<StatCard title="Expired / Cancelled" value={stats.expiredCancelled || 0} red/>

</div>


{/* STATS ROW 2 */}

<div className="grid grid-cols-4 gap-6">

<StatCard title="Banned Users" value={stats.bannedUsers || 0} red/>
<StatCard title="Pending Verification" value={stats.pendingVerification || 0}/>
<StatCard title="No Contacts Added" value={stats.noContacts || 0}/>
<StatCard title="Credits Low (<2)" value={stats.lowCredits || 0}/>

</div>


{/* ANALYTICS */}

<div className="grid grid-cols-2 gap-6">

<RegionCard regions={regions}/>
<CountriesCard countries={countries}/>

</div>


{/* USERS TABLE */}

<div className="bg-white rounded-4xl w-[1090px] overflow-x-auto tracking-wide">

<table className="w-full text-[14px] font-light">

<thead className="bg-[#78bcc4] text-white">

<tr>

<th className="px-6 py-6 text-left">User ID</th>
<th className="px-6 py-4 text-left">User Name</th>
<th className="px-6 py-4 text-left">Joined</th>
<th className="px-6 py-4 text-left">Plans</th>
<th className="px-6 py-4 text-left">Renewal</th>
<th className="px-6 py-4 text-left">Alert Credits</th>
<th className="px-6 py-4 text-left">Check-ins</th>
<th className="px-6 py-4 text-left">Alerts Sent</th>
<th className="px-6 py-4 text-left">Alerts Type</th>
<th className="px-6 py-4 text-left">Status</th>

</tr>

</thead>

<tbody className="text-[#5a6c7d]">

{users.map((user)=>{

return(

<tr
key={user._id}
className="border-b border-[#dcdcdc] hover:bg-[#f7f8f3]"
>

<td className="px-6 py-4 font-medium">
{user.userId}
</td>

<td
onClick={()=>navigate(`/users/${user._id}`)}
className="px-6 py-4 font-semibold cursor-pointer"
>
{user.name || "Unnamed"}
</td>

<td className="px-6 py-4">
{formatDate(user.joined)}
</td>

<td className="px-6 py-4">
{user.plan==="NO PLAN" ? "No Plan" : user.plan}
</td>

<td className="px-6 py-4">
{user.renewal ? formatDate(user.renewal) : "-"}
</td>

<td className="px-6 py-4">
{user.alertCredits ?? 0}
</td>

<td className="px-6 py-4">
{user.checkinTimes?.join(" | ") || "-"}
</td>

<td className="px-6 py-4">
{user.alertsSent ?? 0}
</td>

<td className="px-6 py-4 font-semibold max-w-[140px] truncate">
<span
className={`${
user.lastAlertType==="SOS" || user.lastAlertType==="MISSED_CHECKIN"
? "text-[#ee6a59]"
: ""
}`}
>
{user.lastAlertType === "MISSED_CHECKIN"
? "Missed"
: user.lastAlertType || "-"}
</span>
</td>

<td
onClick={()=>setConfirmUser(user)}
className={`px-6 py-4 font-semibold cursor-pointer ${
user.status==="ACTIVE"
?"text-[#78bcc4]"
:"text-[#ee6a59]"
}`}
>
{user.status==="ACTIVE"?"Active":"Banned"}
</td>

</tr>

)

})}

</tbody>

</table>




</div>

{/* PAGINATION */}

<div className="flex items-center justify-center gap-6 mt-10">

<button
disabled={page===1}
onClick={()=>setPage(page-1)}
className="px-6 py-2 rounded-full border text-[#5a6c7d] border-[#5a6c7d] disabled:opacity-40"
>
Back
</button>

<span className="text-[#5a6c7d] font-medium">
Page {page} of {totalPages}
</span>

<button
disabled={page===totalPages}
onClick={()=>setPage(page+1)}
className="px-6 py-2 rounded-full bg-[#002c3e] text-white disabled:opacity-40"
>
Next
</button>

</div>


{/* BAN MODAL */}

{confirmUser && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white p-6 rounded-xl w-[320px]">

<p className="text-center font-semibold mb-4">
{confirmUser.status==="ACTIVE"
? "Ban this user?"
: "Unban this user?"}
</p>

<div className="flex justify-between">

<button
onClick={()=>setConfirmUser(null)}
className="px-4 py-2 bg-gray-200 rounded"
>
Cancel
</button>

<button
onClick={()=>toggleBan(confirmUser)}
className="px-4 py-2 bg-red-500 text-white rounded"
>
Confirm
</button>

</div>

</div>

</div>

)}

</div>

)

}


/* ---------- COMPONENTS ---------- */

function StatCard({title,value,red}){

return(

<div className="bg-[#f5f5f5] rounded-3xl p-6">

<p className="text-[16px] font-semibold text-[#5a6c7d]">
{title}
</p>

<p className={`text-5xl font-semibold mt-2 tracking-wide ${red?"text-[#ee6a59]":"text-[#002c3e]"}`}>
{value}
</p>

</div>

)

}

function RegionCard({regions}){

  return(
  
  <div className="bg-[#f5f5f5] rounded-3xl p-8 relative">
  
  {/* HEADER */}
  <h3 className="font-semibold text-2xl text-[#002c3e] mb-5 ">
    Users by Region
  </h3>
  
  {/* 👉 ICON aligned with numbers column */}
  <img 
    src="/Globe Icon.svg"
    alt="icon"
    className="absolute right-2 top-3 w-18 h-18 opacity-70"
  />
  
  <RegionRow label="APAC" value={regions.APAC || 0} color="#fc867d"/>
  <RegionRow label="EMEA" value={regions.EMEA || 0} color="#f5c475"/>
  <RegionRow label="LATAM" value={regions.LATAM || 0} color="#b5d43c"/>
  <RegionRow label="Other" value={regions.OTHER || 0} color="#0cb4ab"/>
  
  </div>
  
  )
  }
function RegionRow({label,value,color}){

return(

<div className="mb-3">

<div className="flex justify-between text-md mb-1">

<span className="text-[#5a6c7d] font-semibold">{label}</span>
<span className="text-[#5a6c7d] font-semibold">{value}</span>

</div>

<div className="h-3 bg-[#dcdcdc] rounded-full">

<div
style={{width:`${value/2}%`,background:color}}
className="h-3 rounded-full"
/>

</div>

</div>

)

}

const colors = ["#fc867d", "#f5c475", "#b5d43c", "#0cb4ab"];

function CountriesCard({countries}){

  return(
  
  <div className="bg-[#f5f5f5] rounded-3xl p-8 relative">
  
  <h3 className="font-semibold text-2xl text-[#002c3e] mb-5">
    Top Countries
  </h3>
  
  <img 
    src="/Locator Pin Icon.svg"
    alt="icon"
    className="absolute right-1 top-3 w-18 h-18 opacity-70"
  />
  
  {countries.map((c,i)=>(
  <CountryRow
    key={i}
    country={c._id}
    value={c.users}
    color={colors[i % colors.length]}   // ✅ dynamic color
  />
))}
  
  </div>
  
  )
  }



  function CountryRow({country,value,color}){

    return(
    
    <div className="mb-3">
    
    <div className="flex justify-between text-md mb-1">
    
    <span className="text-[#5a6c7d] font-semibold">{country}</span>
    <span className="text-[#5a6c7d] font-semibold">{value}</span>
    
    </div>
    
    <div className="h-3 bg-[#dcdcdc] rounded-full">
    
    <div
    style={{width:`${value}%`,background:color}}   // ✅ dynamic
    className="h-3 rounded-full"
    />
    
    </div>
    
    </div>
    
    )
    }