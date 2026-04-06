import { useEffect, useState , useRef } from "react";
import api from "../api/axios";
// import CustomDatePicker from "../components/CustomDatePicker";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function InlineDatePicker({ value, onChange, label }) {

  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const [showMonth, setShowMonth] = useState(false);
  const [showYear, setShowYear] = useState(false);

  const ref = useRef();

  const years = Array.from({ length: 50 }, (_, i) => 2000 + i);
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowMonth(false);
        setShowYear(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>

      {/* INPUT */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center bg-white rounded-full overflow-hidden cursor-pointer hover:shadow-md transition"
      >

        {/* LABEL */}
        <span className="px-4 py-3.5 text-white bg-[#78bcc4] font-semibold text-sm">
          {label}
        </span>

        {/* DATE */}
        <div className="px-4 py-2 flex items-center gap-1 text-[#5a6c7d] text-sm min-w-[140px]">

          {value
            ? new Date(value).toLocaleDateString("en-GB").replaceAll("/", " | ")
            : "DD | MM | YY"
          }

          <CalendarDays size={16} className="text-[#002c3e] ml-auto" />

        </div>

      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute top-[55px] left-0 z-50 bg-white rounded-2xl p-4 w-[280px] shadow-[0_10px_30px_rgba(0,0,0,0.15)]">

          <DatePicker
            selected={tempDate}
            onChange={(date) => setTempDate(date)}
            inline

            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseMonth,
              increaseMonth,
            }) => (

              <div className="flex items-center justify-between mb-3">

                {/* LEFT */}
                <button
                  onClick={decreaseMonth}
                  className="w-8 h-8 rounded-full bg-[#f1f3f4] hover:bg-[#e5e7eb]"
                >
                  ←
                </button>

                {/* CENTER */}
                <div className="flex gap-2 relative">

                  {/* MONTH */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        setShowMonth(!showMonth);
                        setShowYear(false);
                      }}
                      className="bg-[#f5f5f5] px-3 py-1 rounded-full text-sm font-semibold cursor-pointer"
                    >
                      {months[date.getMonth()]}
                    </div>

                    {showMonth && (
                      <div className="absolute top-10 left-0 bg-white shadow-lg rounded-xl max-h-40 overflow-y-auto z-50">
                        {months.map((m, i) => (
                          <div
                            key={m}
                            onClick={() => {
                              changeMonth(i);
                              setShowMonth(false);
                            }}
                            className="px-4 py-2 hover:bg-[#0cb4ab]/10 cursor-pointer"
                          >
                            {m}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* YEAR */}
                  <div className="relative">
                    <div
                      onClick={() => {
                        setShowYear(!showYear);
                        setShowMonth(false);
                      }}
                      className="bg-[#f5f5f5] px-3 py-1 rounded-full text-sm font-semibold cursor-pointer"
                    >
                      {date.getFullYear()}
                    </div>

                    {showYear && (
                      <div className="absolute top-10 left-0 bg-white shadow-lg rounded-xl max-h-40 overflow-y-auto z-50">
                        {years.map((y) => (
                          <div
                            key={y}
                            onClick={() => {
                              changeYear(y);
                              setShowYear(false);
                            }}
                            className={`px-4 py-2 cursor-pointer ${
                              y === date.getFullYear()
                                ? "bg-[#0cb4ab] text-white"
                                : "hover:bg-[#0cb4ab]/10"
                            }`}
                          >
                            {y}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT */}
                <button
                  onClick={increaseMonth}
                  className="w-8 h-8 rounded-full bg-[#f1f3f4] hover:bg-[#e5e7eb]"
                >
                  →
                </button>

              </div>
            )}
          />

          {/* FOOTER */}
          <div className="flex justify-between mt-4">

            <button
              onClick={() => {
                setTempDate(null);
                setOpen(false);
              }}
              className="bg-[#B5B9B2] text-white px-5 py-2 rounded-full text-sm"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onChange(tempDate);
                setOpen(false);
              }}
              className="bg-[#002c3e] text-white px-5 py-2 rounded-full text-sm"
            >
              Confirm
            </button>

          </div>

        </div>
      )}

    </div>
  );
}



export default function AdminRevenue() {

const [data,setData] = useState([]);

const [month,setMonth] = useState("ALL");
const [openMonth,setOpenMonth] = useState(false);

const [from,setFrom] = useState("");
const [to,setTo] = useState("");

const [openExport,setOpenExport] = useState(false);

const [page,setPage] = useState(1);
const perPage = 4;

const totalPages = Math.ceil(data.length / perPage);

const paginatedData = data.slice(
(page-1)*perPage,
page*perPage
);




const titleMonth = () => {

    if(month === "ALL") return "All Time";
    if(month === "THIS_MONTH") return new Date().toLocaleDateString("en-GB",{month:"short",year:"numeric"});
    if(month === "LAST_MONTH"){
    const d = new Date();
    d.setMonth(d.getMonth()-1);
    return d.toLocaleDateString("en-GB",{month:"short",year:"numeric"});
    }
    if(month === "LAST_3") return "Last 3 Months";
    if(month === "YTD") return "Year to Date";
    
    return "Revenue";
    };

const exportCSV = ()=>{

    let csv = "Date,UserID,UserName,Plan,Gross,Net\n";
    
    data.forEach(r=>{
    csv += `${r.date},${r.userId},${r.userName},${r.plan},${r.gross},${r.net}\n`;
    });
    
    const blob = new Blob([csv]);
    
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    
    a.href = url;
    a.download = "revenue.csv";
    
    a.click();
    
    };


    const exportPDF = ()=>{

        const doc = new jsPDF();
        
        const rows = data.map(r=>[
        new Date(r.date).toLocaleDateString(),
        r.userId,
        r.userName,
        r.plan,
        r.gross,
        r.net
        ]);
        
        autoTable(doc,{
        head:[["Date","UserID","UserName","Plan","Gross","Net"]],
        body:rows
        });
        
        doc.save("revenue.pdf");
        
        };

/* ================= DUMMY DATA ================= */

const fetchRevenue = async()=>{
    const res = await api.get("/admin/revenue",{
    params:{
    month,
    from: from ? new Date(from).toISOString().split("T")[0] : "",
    to: to ? new Date(to).toISOString().split("T")[0] : ""
    }
    });
    
    setData(res.data);
    };

    useEffect(()=>{
        fetchRevenue();
        },[month]);


/* ================= TOTAL ================= */

const grossTotal = data.reduce((a,b)=>a+b.gross,0);
const netTotal = data.reduce((a,b)=>a+b.net,0);


/* ================= MONTH OPTIONS ================= */

const months = [
    {label:"All",value:"ALL"},
    {label:"This Month",value:"THIS_MONTH"},
    {label:"Last Month",value:"LAST_MONTH"},
    {label:"Last 3 Months",value:"LAST_3"},
    {label:"Year to Date",value:"YTD"}
    ];


return(

<div className="space-y-10">


{/* ================= FILTER BAR ================= */}
<div className="bg-[#B5B9B2] rounded-4xl px-8  py-5 flex items-center gap-3 flex-wrap">
{/* MONTH */}

<div className="relative">

<button
onClick={()=>setOpenMonth(!openMonth)}
className="
bg-[#002c3e]
text-white
px-10
py-3
rounded-full
inline-flex
items-center
gap-2
tracking-wide
font-semibold
whitespace-nowrap
"
>
{months.find(m=>m.value===month)?.label} ▼
</button>

{openMonth && (

<div className="absolute top-13  bg-[#7f837f] text-white rounded-xl overflow-hidden">

{months.map(m=>(

<div
key={m.value}
onClick={()=>{
setMonth(m.value);
setOpenMonth(false);
}}
className="px-6 py-2 leading-4 hover:bg-[#6f736f] cursor-pointer"
>

{m.label}

</div>

))}

</div>

)}

</div>


{/* EXPORT */}

<div className="relative">

<button
onClick={()=>setOpenExport(!openExport)}
className="bg-[#f5f5f5] rounded-full px-9 py-3 font-semibold text-[#5a6c7d]"
>
Export ▼
</button>

{openExport && (

<div className="absolute top-13 left-4 bg-[#7f837f] shadow-lg rounded-xl overflow-hidden z-50">

<div
onClick={()=>{
exportCSV();
setOpenExport(false);
}}
className="px-8 py-2 hover:bg-gray-800 cursor-pointer"
>
CSV
</div>

<div
onClick={()=>{
exportPDF();
setOpenExport(false);
}}
className="px-8 py-2 hover:bg-gray-800 cursor-pointer"
>
PDF
</div>

</div>

)}

</div>


{/* REFRESH */}

<button
onClick={()=>{
setFrom("");
setTo("");
setMonth("ALL");
fetchRevenue();
}}
className="bg-[#f5f5f5] rounded-full p-3"
>
<img src="/exchange.png" className="w-4 h-4"/>
</button>


<InlineDatePicker
value={from}
onChange={setFrom}
label="From"
/>

<InlineDatePicker
value={to}
onChange={setTo}
label="To"
/>
  


<button
onClick={()=>{
    setMonth("CUSTOM");
    setPage(1);
    
    setTimeout(()=>{
      fetchRevenue();
    },0);
    }}
className="bg-[#002c3e] text-white px-10 font-semibold py-3 rounded-full"
>
Apply
</button>

</div>


{/* ================= STATS ================= */}

<div className="grid grid-cols-3 gap-6">

<Card label="Total Transactions" value={data.length} />

<Card label="Gross Revenue" value={`$${grossTotal.toFixed(2)}`} />

<Card label="Net Revenue" value={`$${netTotal.toFixed(2)}`} />

</div>





{/* ================= TABLE ================= */}

<div className="bg-white rounded-4xl overflow-hidden">

<table className="w-full text-[16px] tracking-wide">
    {data.length === 0 && (
<tr>
<td colSpan="6" className="text-center py-10 text-gray-400">
No revenue data found
</td>
</tr>
)}


<thead className="bg-[#78bcc4] text-white">
    

<tr>


<th className="px-6 py-5 text-left">Date</th>
<th className="px-6 py-5 text-left">User ID</th>
<th className="px-6 py-5 text-left">User Name</th>
<th className="px-6 py-5 text-left">Plan</th>
<th className="px-6 py-5 text-left">Gross</th>
<th className="px-6 py-5 text-left">Net*</th>

</tr>



</thead>

<tbody className="text-[#5a6c7d]">

{paginatedData.map((r,i)=>(

<tr
key={i}
className="border-b border-[#e5e5e5] hover:bg-[#f7f8f3]"
>

<td className="px-6 py-4">

{new Date(r.date).toLocaleDateString("en-GB",{
day:"2-digit",
month:"short",
year:"numeric"
})}

</td>

<td className="px-6 py-4">

{r.userId}

</td>

<td className="px-6 py-4 font-semibold">

{r.userName}

</td>

<td className="px-6 py-4">

{r.plan?.toLowerCase()}

</td>

<td className="px-6 py-4 text-[#78bcc4] font-semibold">

${r.gross.toFixed(2)}

</td>

<td className="px-6 py-4 text-[#78bcc4] font-semibold">

${r.net.toFixed(2)}

</td>

</tr>

))}



</tbody>

</table>



</div>

<div className="flex justify-center items-center gap-6 mt-6">

<button
onClick={()=>setPage(p=>Math.max(p-1,1))}
className="border border-[#5a6c7d] px-6 py-2 rounded-full text-[#5a6c7d]"
>
Back
</button>

<span className="text-[#5a6c7d] font-medium">
Page {page} of {totalPages}
</span>

<button
onClick={()=>setPage(p=>Math.min(p+1,totalPages))}
className="bg-[#002c3e] text-white px-6 py-2 rounded-full"
>
Next
</button>

</div>

{/* ================= REVENUE SUMMARY ================= */}

<div className="flex items-center gap-6">
<h2 className="text-3xl font-semibold text-[#002c3e]">

{titleMonth} Revenue

<p className="text-sm text-[#5a6c7d] font-normal">
<sup className="raletive -top-1">*</sup>Net after 15% app store commission
</p>

</h2>



<span className="bg-[#f5f5f5] px-6 py-2 rounded-full text-[#5a6c7d] text-lg   font-semibold">

Gross <span className="text-[#002c3e] text-3xl ml-1 ">${grossTotal.toFixed(2)}</span> 

</span>

<span className="bg-[#f5f5f5] px-6 py-2 rounded-full text-[#5a6c7d] font-semibold">

Net<sup className="raletive -top-1">*</sup><span className="text-[#002c3e] text-3xl ml-1 "> ${netTotal.toFixed(2)}</span>

</span>

</div>


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

<p className={`text-[48px] font-semibold mt-2 ${error ? "text-[#ee6a59]" : "text-[#002c3e]"}`}>

{value}

</p>

</div>

);

}