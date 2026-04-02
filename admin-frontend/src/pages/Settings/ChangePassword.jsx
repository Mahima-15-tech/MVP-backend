import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePassword() {
  

const [form,setForm] = useState({
  currentPassword:"",
  newPassword:"",
  confirmPassword:""
});

const [loading,setLoading] = useState(false);
const [history,setHistory] = useState([]);

const [page,setPage] = useState(1);
const itemsPerPage = 5;

// 👁️ SHOW PASSWORD STATE
const [showPassword, setShowPassword] = useState({
  current:false,
  new:false,
  confirm:false
});

useEffect(()=>{
  fetchHistory();
},[]);

// ================= FETCH HISTORY =================
const fetchHistory = async()=>{
  try{
    const res = await api.get("/admin/password-history");
    setHistory(res.data || []);
  }catch(err){
    console.log(err);
  }
};

// ================= VALIDATION =================
const isMismatch =
  form.confirmPassword &&
  form.newPassword !== form.confirmPassword;

// ================= HANDLE SUBMIT =================
const handleSubmit = async()=>{

  if(isMismatch){
    alert("Passwords do not match");
    return;
  }

  try{
    setLoading(true);

    await api.post("/admin/change-password",{
      currentPassword:form.currentPassword,
      newPassword:form.newPassword
    });

    alert("Password updated successfully");

    setForm({
      currentPassword:"",
      newPassword:"",
      confirmPassword:""
    });

    fetchHistory();

  }catch(err){
    alert(err.response?.data?.message || "Error");
  }
  finally{
    setLoading(false);
  }
};

// ================= RESET =================
const resetForm = ()=>{
  setForm({
    currentPassword:"",
    newPassword:"",
    confirmPassword:""
  });
};

// ================= PAGINATION =================
const totalPages = Math.ceil(history.length / itemsPerPage);

const paginatedHistory = history.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage
);

// ================= UI =================
return(

<div className="bg-white rounded-[28px] border border-[#e6e6e6] overflow-hidden">

{/* ================= CHANGE PASSWORD ================= */}

<div className="px-10 py-8">

<h3 className="text-2xl font-semibold text-[#002c3e] mb-6">
Change Password
</h3>

<div className="grid grid-cols-3 gap-6">

{/* CURRENT PASSWORD */}
<div className="relative">
<input
type={showPassword.current ? "text" : "password"}
placeholder="Current Password"
value={form.currentPassword}
onChange={(e)=>setForm({...form,currentPassword:e.target.value})}
className="
w-full
border border-[#d5dbe1]
rounded-full px-6 py-3 pr-12
outline-none
text-[#002c3e]
placeholder:text-[#9aa7b2]
focus:border-[#002c3e]
"
/>

<button
type="button"
onClick={()=>setShowPassword(prev=>({...prev,current:!prev.current}))}
className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f8f93] hover:text-[#002c3e]"
>
{showPassword.current ? <EyeOff size={18}/> : <Eye size={18}/>}
</button>
</div>

{/* NEW PASSWORD */}
<div className="relative">
<input
type={showPassword.new ? "text" : "password"}
placeholder="New Password"
value={form.newPassword}
onChange={(e)=>setForm({...form,newPassword:e.target.value})}
className="
w-full
border border-[#d5dbe1]
rounded-full px-6 py-3 pr-12
outline-none
text-[#002c3e]
placeholder:text-[#9aa7b2]
focus:border-[#002c3e]
"
/>

<button
type="button"
onClick={()=>setShowPassword(prev=>({...prev,new:!prev.new}))}
className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f8f93] hover:text-[#002c3e]"
>
{showPassword.new ? <EyeOff size={18}/> : <Eye size={18}/>}
</button>
</div>

{/* CONFIRM PASSWORD */}
<div className="relative">
<input
type={showPassword.confirm ? "text" : "password"}
placeholder="Confirm New Password"
value={form.confirmPassword}
onChange={(e)=>setForm({...form,confirmPassword:e.target.value})}
className={`
w-full
border rounded-full px-6 py-3 pr-12
outline-none
text-[#002c3e]
placeholder:text-[#9aa7b2]
focus:border-[#002c3e]
${isMismatch ? "border-red-400" : "border-[#d5dbe1]"}
`}
/>

<button
type="button"
onClick={()=>setShowPassword(prev=>({...prev,confirm:!prev.confirm}))}
className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f8f93] hover:text-[#002c3e] transition"
>
{showPassword.confirm ? <EyeOff size={18}/> : <Eye size={18}/>}
</button>

{/* ERROR */}
{isMismatch && (
<p className="text-red-500 text-sm mt-1 ml-2">
Passwords do not match
</p>
)}

</div>

</div>

{/* ================= BUTTONS ================= */}

<div className="flex gap-4 mt-6">

<button
onClick={resetForm}
className="
px-10 py-3
rounded-full
bg-[#b6b9b3]
text-[#f5f5f5]
font-semibold
hover:opacity-90
transition
"
>
Cancel
</button>

<button
onClick={handleSubmit}
disabled={loading || isMismatch}
className="
px-10 py-3
rounded-full
bg-[#002c3e]
text-[#f5f5f5]
font-semibold
hover:opacity-90
transition
disabled:opacity-60
"
>
{loading ? "Updating..." : "Confirm"}
</button>

</div>

</div>

{/* ================= PASSWORD HISTORY ================= */}

<div className="border-t border-[#e6e6e6]">

<div className="px-10 py-6">
<h3 className="text-xl font-semibold text-[#002c3e]">
Password Update History
</h3>
</div>

{history.length === 0 ? (

<div className="px-10 pb-8 text-[#7b8a97]">
No password updates yet
</div>

):( 

paginatedHistory.map((item,i)=>{

const date = new Date(item.changedAt || item.createdAt);

const formattedDate = date.toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

const formattedTime = date.toLocaleTimeString("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true
});

return (
<div
key={i}
className="px-10 py-4 border-t font-semibold tracking-wide border-[#e6e6e6] text-[#5a6c7d]"
>
{formattedDate} | {formattedTime}
</div>
);

})

)}

</div>

{/* ================= PAGINATION ================= */}

{history.length > 0 && (
<div className="flex justify-center items-center gap-6 py-6">

<button
onClick={()=>setPage((p)=>Math.max(p-1,1))}
disabled={page === 1}
className="
border border-[#5a6c7d]
text-[#5a6c7d]
px-6 py-2
rounded-full
disabled:opacity-40
"
>
Back
</button>

<span className="text-[#5a6c7d]">
Page {page} of {totalPages || 1}
</span>

<button
onClick={()=>setPage((p)=>Math.min(p+1,totalPages))}
disabled={page === totalPages}
className="
bg-[#002c3e]
text-white
px-6 py-2
rounded-full
disabled:opacity-40
"
>
Next
</button>

</div>
)}

</div>

);

}