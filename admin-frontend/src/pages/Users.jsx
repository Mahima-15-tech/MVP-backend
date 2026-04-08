import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { TbRefresh } from "react-icons/tb";
import CustomDatePicker from "../components/CustomDatePicker";
import EmptyState from "../components/EmptyState";

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
const [highlight, setHighlight] = useState(false);
const [activeFilter, setActiveFilter] = useState(null);

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

const scrollToUsersTable = () => {
  const el = document.getElementById("users-table");

  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });

    // highlight on
    setHighlight(true);

    // remove highlight after 2 sec
    setTimeout(() => {
      setHighlight(false);
    }, 2000);
  }
};


const handleCardClick = (type) => {
  const el = document.getElementById("users-table");

  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  setActiveFilter(type);

  // remove highlight after 3 sec
  setTimeout(() => {
    setActiveFilter(null);
  }, 3000);
};


const formatPlan = (plan) => {
  if (!plan) return "-";

  return plan
    .toLowerCase()                // monthly
    .split(" ")                   // ["no","plan"]
    .map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    )                             // ["No","Plan"]
    .join(" ");                   // "No Plan"
};


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

  const formatName = (name) => {
    if (!name) return "Unnamed";
  
    const parts = name.trim().split(" ");
  
    if (parts.length === 1) return parts[0];
  
    return parts[0] + "..."; // space hata diya clean look ke liye
  };

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
className="bg-white w-12 h-10  rounded-full flex items-center justify-center"
>
<img 
  src="/refreshicon.svg" 
  alt="refresh" 
  className="w-10 h-10"
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
<StatCard title="Total Users" value={stats.totalUsers || 0} onClick={() => handleCardClick("ALL")} />

<StatCard title="Trial Users" value={stats.trialUsers || 0} onClick={() => handleCardClick("TRIAL")} />

<StatCard title="Active Subscribers" value={stats.activeSubscribers || 0} onClick={() => handleCardClick("ACTIVE")} />

<StatCard title="Expired / Cancelled" value={stats.expiredCancelled || 0} red onClick={() => handleCardClick("EXPIRED")} />
</div>


{/* STATS ROW 2 */}

<div className="grid grid-cols-4 gap-6">

<StatCard title="Banned Users" value={stats.bannedUsers || 0} red onClick={() => handleCardClick("BANNED")} />
<StatCard title="Pending Verification" value={stats.pendingVerification || 0}/>
<StatCard title="No Contacts Added" value={stats.noContacts || 0}/>
<StatCard title="Credits Low (<2)" value={stats.lowCredits || 0} onClick={() => handleCardClick("LOW_CREDITS")} />

</div>


{/* ANALYTICS */}

<div className="grid grid-cols-2 gap-6">

<RegionCard regions={regions}/>
<CountriesCard countries={countries}/>

</div>


{/* USERS TABLE */}

<div 
  id="users-table"
  className={`bg-white rounded-4xl w-[1090px] -ml-5 overflow-hidden border border-[#e6e6e6] transition-all duration-500 ${
    highlight ? "ring-4 ring-[#78bcc4]" : ""
  }`}
>

  <table className="w-full text-[14px] font-light table-fixed">

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


{users.length === 0 ? (

<tr>
  <td colSpan="10">
    <EmptyState
      title="No users found"
      subtitle="Try adjusting filters or search"
    />
  </td>
</tr>

) :

users.map((user)=>(
        <tr
          key={user._id}
          className={`
  border-b border-[#e6e6e6] transition

  ${
    activeFilter === "TRIAL" && user.plan === "TRIAL"
      ? "bg-[#e6f7ff]"
      : activeFilter === "ACTIVE" && user.status === "ACTIVE"
      ? "bg-[#e6f7ff]"
      : activeFilter === "BANNED" && user.status !== "ACTIVE"
      ? "bg-[#ffecec]"
      : activeFilter === "LOW_CREDITS" && user.alertCredits < 2
      ? "bg-[#fff7e6]"
      : activeFilter && "opacity-40"
  }

  hover:bg-[#f7f8f3]
`}
        >

<td className="px-3 py-4 font-medium whitespace-nowrap">
  {user.userId}
</td>

<td
  onClick={()=>navigate(`/users/${user._id}`)}
  className="px-6 py-4 font-semibold cursor-pointer whitespace-nowrap"
>
  {formatName(user.name)}
</td>

          <td className="px-6 py-4">
            {formatDate(user.joined)}
          </td>

          <td className="px-6 py-4">
          {formatPlan(user.plan)}
          </td>

          <td className="px-6 py-4">
            {user.renewal ? formatDate(user.renewal) : "-"}
          </td>

          <td className="px-6 py-4">
            {user.alertCredits ?? 0}
          </td>

          <td className="px-6 py-4 break-words">
            {user.checkinTimes?.join(" | ") || "-"}
          </td>

          <td className="px-6 py-4">
            {user.alertsSent ?? 0}
          </td>

          <td className="px-6 py-4 font-semibold break-words">
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
                ? "text-[#78bcc4]"
                : "text-[#ee6a59]"
            }`}
          >
            {user.status==="ACTIVE" ? "Active" : "Banned"}
          </td>

        </tr>
      ))}

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

<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

  <div className="bg-white rounded-[28px] w-[380px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.15)]">

    {/* TITLE */}
    <h2 className="text-xl font-semibold text-[#002c3e] text-center mb-3">
      {confirmUser.status==="ACTIVE"
        ? "Ban User"
        : "Unban User"}
    </h2>

    {/* SUBTEXT */}
    <p className="text-[#5a6c7d] text-center mb-8 text-sm leading-relaxed">
  {confirmUser.status === "ACTIVE" ? (
    <>
      Are you sure you want to ban this user?
      <br />
      They will lose access immediately.
    </>
  ) : (
    "This user will regain access to the platform."
  )}
</p>

    {/* ACTION BUTTONS */}
    <div className="flex gap-4 justify-center">

      {/* CANCEL */}
      <button
        onClick={()=>setConfirmUser(null)}
        className="
        px-8 py-3
        rounded-full
        bg-[#b6b9b3]
        text-white
        font-semibold
        hover:opacity-90
        transition
        "
      >
        Cancel
      </button>

      {/* CONFIRM */}
      <button
        onClick={()=>toggleBan(confirmUser)}
        className={`
        px-8 py-3
        rounded-full
        font-semibold
        text-white
        transition
        ${
          confirmUser.status==="ACTIVE"
          ? "bg-[#ee6a59] hover:opacity-90"
          : "bg-[#002c3e] hover:opacity-90"
        }
        `}
      >
        {confirmUser.status==="ACTIVE" ? "Ban User" : "Unban"}
      </button>

    </div>

  </div>

</div>

)}

</div>

)

}


/* ---------- COMPONENTS ---------- */

function StatCard({ title, value, red, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#f5f5f5] rounded-3xl p-6 cursor-pointer 
      transition-all duration-200 hover:scale-[1.03] hover:shadow-md"
    >
      <p className="text-[16px] font-semibold text-[#5a6c7d]">
        {title}
      </p>

      <p className={`text-[48px] font-semibold tracking-wide ${
        red ? "text-[#ee6a59]" : "text-[#002c3e]"
      }`}>
        {value}
      </p>
    </div>
  );
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
 