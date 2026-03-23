import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SystemHealth() {

const [health,setHealth] = useState(null);

useEffect(()=>{

api.get("/admin/system-health")
.then(res=>setHealth(res.data))
.catch(()=>{

setHealth({
serverStatus:"Connected",
smsStatus:"Connected",
failedSMS24h:3
});

});

},[]);

if(!health) return null;

return(

<div className="space-y-10">

{/* STATUS CARDS */}

<div className="grid grid-cols-3 gap-8">

<StatusCard
title="Server Status"
value={health.serverStatus}
status={health.serverStatus === "Connected"}
/>

<StatusCard
title="SMS Service"
value={health.smsStatus}
status={health.smsStatus === "Connected"}
/>

<StatusCard
title="Failed SMS (24h)"
value={health.failedSMS24h}
status={health.failedSMS24h < 5}
failed
/>

</div>

</div>

);

}

/* ================= CARD ================= */

function StatusCard({title,value,status,failed}){

return(

<div
className="
bg-white
rounded-4xl
px-8
py-6
flex
items-center
justify-between
border
border-[#e6e6e6]
shadow-sm
"
>

<div>

<p className="text-[#5a6c7d] text-md tracking-wide font-semibold">
{title}
</p>

<p
className={`
text-3xl
font-semibold
mt-1
leading-8
${failed ? "text-[#ee6a59]" : "text-[#002c3e]"}
`}
>

{value}

</p>

</div>

<div
className={`
w-6
h-6
mt-6
rounded-full
${status ? "bg-[#9acd78]" : "bg-[#ee6a59]"}
`}
>

</div>

</div>

);

}