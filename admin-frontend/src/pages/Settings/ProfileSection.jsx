import { useEffect,useState,useRef } from "react";
import api from "../../api/axios";
import { Pencil,Camera } from "lucide-react";

export default function ProfileSection(){

const [profile,setProfile] = useState(null);
const [form,setForm] = useState({});
const [edit,setEdit] = useState(false);

const fileRef = useRef();

useEffect(()=>{
api.get("/admin/me").then(res=>{
setProfile(res.data);
setForm(res.data);
});
},[]);

if(!profile) return null;

/* ================= SAVE ================= */

const handleSave = async ()=>{
const res = await api.put("/admin/me",form);
setProfile(res.data);
setEdit(false);
};

/* ================= IMAGE ================= */

const handleImage = (e)=>{
const file = e.target.files[0];

const reader = new FileReader();

reader.onloadend = ()=>{
setForm({...form,profileImage:reader.result});
};

reader.readAsDataURL(file);
};

return(
<div>
<div className="bg-white rounded-4xl border border-[#e6e6e6] overflow-hidden">

{/* HEADER */}
<div className="px-10 py-6 border-b border-[#e6e6e6]">
<h2 className="text-3xl font-semibold text-[#002c3e]">
{form.name}
</h2>
</div>

{/* BODY */}
<div className="flex">

{/* LEFT */}
<div className="w-[75%] px-10 py-4">

<div className="grid grid-cols-3 gap-y-5">

{/* PHONE */}
<Field label="Phone" edit={edit}>
<input value={form.phone||""}
onChange={e=>setForm({...form,phone:e.target.value})}
className=" text-[#002c3e] text-xl font-semibold w-42 bg-transparent"
/>
<span className="text-[#002c3e] text-2xl font-semibold">
  {profile.phone}
</span>
</Field>

{/* GENDER */}
<Field label="Gender" edit={edit}>
<input value={form.gender||""}
onChange={e=>setForm({...form,gender:e.target.value})}
className=" text-[#002c3e] text-xl font-semibold w-42 bg-transparent"
/>
<span className="text-[#002c3e] text-2xl font-semibold">{profile.gender||"Male"}</span>
</Field>

{/* LOCATION */}
<Field label="Location" edit={edit}>
<input value={form.location||""}
onChange={e=>setForm({...form,location:e.target.value})}
className=" text-[#002c3e] text-xl font-semibold w-42 bg-transparent"
/>
<span className="text-[#002c3e] text-2xl font-semibold">{profile.location||"Singapore"}</span>
</Field>

<div className="col-span-3 -ml-10 w-[111%] border-t border-[#e6e6e6]"></div>

{/* EMAIL */}
<Field label="Email" edit={edit}>
<input
value={form.email || ""}
onChange={e=>setForm({...form,email:e.target.value})}
className=" text-[#002c3e] text-xl font-semibold w-42 bg-transparent"
/>

<span className="text-[#002c3e] text-xl  font-semibold">
{profile.email}
</span>
</Field>

{/* AGE */}
<Field label="Age" edit={edit}>
<input value={form.age||""}
onChange={e=>setForm({...form,age:e.target.value})}
className=" text-[#002c3e] text-xl font-semibold w-42 bg-transparent"
/>
<span className="text-[#002c3e] text-2xl font-semibold">{profile.age||50}</span>
</Field>

{/* DESIGNATION */}
<Field label="Designation" edit={edit}>
<input value={form.designation||""}
onChange={e=>setForm({...form,designation:e.target.value})}
className=" text-[#002c3e] text-xl font-semibold w-42 bg-transparent"
/>
<span className="text-[#002c3e] text-2xl font-semibold">{profile.designation || "—"}</span>
</Field>

</div>

</div>

{/* DIVIDER */}
<div className="w-[1px] bg-[#e6e6e6]"></div>

{/* IMAGE */}
<div className="flex-1 flex justify-center items-center py-8">

<div className="relative">

<div className="w-32 h-32 rounded-full border-4 border-[#78bcc4] overflow-hidden">
<img
src={form.profileImage || "https://i.pravatar.cc/200"}
className="w-full h-full object-cover"
/>
</div>

<button
onClick={()=>fileRef.current.click()}
className="absolute bottom-0 right-0 bg-[#002c3e] p-2 rounded-full text-white"
>
<Camera size={16}/>
</button>

<input
type="file"
ref={fileRef}
hidden
onChange={handleImage}
/>

</div>

</div>

</div>



</div>


{/* BUTTONS */}
<div className="flex items-center gap-4  pb-8 pt-8">

{/* EDIT */}
<button
onClick={()=>setEdit(true)}
className="w-12 h-12 rounded-full bg-[#002c3e] flex items-center justify-center text-white"
>
<Pencil size={18}/>
</button>

{/* CANCEL */}
<button
onClick={()=>{
setEdit(false);
setForm(profile);
}}
disabled={!edit}
className={`px-10 py-3 rounded-full font-semibold ${
edit
? "bg-[#b6b9b3] text-white"
: "bg-[#b6b9b3] text-white opacity-50 cursor-not-allowed"
}`}
>
Cancel
</button>

{/* SAVE */}
<button
onClick={handleSave}
disabled={!edit}
className={`px-10 py-3 rounded-full font-semibold ${
edit
? "bg-[#002c3e] text-white"
: "bg-[#b6b9b3] text-white opacity-50 cursor-not-allowed"
}`}
>
Confirm
</button>

</div>

</div>


);


}



/* ================= FIELD COMPONENT ================= */

function Field({ label, edit, children }) {

    const items = Array.isArray(children) ? children : [children];
    
    const input = items[0];
    const display = items[1];
    
    return (
    <div>
      <p className="text-[#5a6c7d] text-lg font-semibold">{label}</p>
    
      {edit
        ? input
        : <div className="text-[#002c3e] text-2xl font-semibold mt-1">
            {display}
          </div>
      }
    
    </div>
    );
    }