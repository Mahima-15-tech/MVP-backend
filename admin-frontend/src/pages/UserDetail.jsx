import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import PastContactsModal from "../components/PastContactsModal";


/* =====================================================
   MAIN COMPONENT
===================================================== */

function formatDate(date){

  const d = new Date(date)
  
  const day = d.getDate()
  
  const month = d.toLocaleString("en",{month:"short"})
  
  const year = d.getFullYear()
  
  const time = d.toLocaleString("en",{
  hour:"numeric",
  minute:"2-digit",
  hour12:true
  })
  
  return `${day} ${month} ${year} | ${time}`
  
  }

export default function UserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("User Overview");
  const [showHistory, setShowHistory] = useState(false);
  const [showContactHistory, setShowContactHistory] = useState(false);
  useEffect(() => {
    const el = document.getElementById("main-scroll");
  
    if (el) {
      // 👇 delay add karo (IMPORTANT)
      setTimeout(() => {
        el.scrollTop = 0;
      }, 0);
    }
  
    fetchUser();
  }, [id]); // 👈 id dependency bhi add karo



  const fetchUser = async () => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen  flex items-center justify-center text-lg text-gray-400">
        Loading user...
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-400">
        User not found
      </div>
    );

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="bg-[#f5f5f5] border border-[#e6e6e6] rounded-4xl px-10 py-4">
        <div className="flex justify-between items-center">

<div>
  <h1 className="text-3xl font-semibold text-[#002c3e] tracking-wide">
    {data.basicInfo.name || "Unnamed User"}
  </h1>

  <p className="text-[#5a6c7d] text-md font-semibold mt-1 tracking-wide ">
    User ID : {data.basicInfo.phone}
  </p>
</div>

<div className="flex items-center gap-6">

  <div className="text-left font-semibold tracking-wide text-md text-[#5a6c7d]">
    Alert <br />Credits<br/>Balance
  </div>
  <div className="border-l border-[#5a6c7d] h-15 border-2 rounded-full "></div>
  <div className="text-6xl font-semibold text-[#0cb4ab]">
    {data.currentBalance}
  </div>

</div>

</div>
        </div>

        {/* TABS */}
        <div className="flex flex-wrap gap-5">
          {[
            "User Overview",
            "Subscription",
            // "subscription-history",
            "Contacts",
            "Check-ins",
            "Recent Alerts",
            "Alert Credits",
            "Admin Notes",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-md font-semibold tracking-wide transition ${
                activeTab === tab
                  ? "bg-[#002c3e] text-white"
                  : "bg-[#f1f3f4] text-[#5a6c7d]"
              }`}
            >
              {tab.replace("", " ")}
            </button>
          ))}
        </div>

        {/* CONTENT CARD */}
        <div className="bg-white rounded-[30px] border border-[#e6e6e6] overflow-hidden">
          {activeTab === "User Overview" && <Overview data={data} />}
          {activeTab === "Subscription" &&  <Subscription data={data} showHistory={showHistory} setShowHistory={setShowHistory} />}
          {/* {activeTab === "subscription-history" && (
            <SubscriptionHistory data={data} />
          )} */}
          {activeTab === "Contacts" && <Contacts 
    data={data} 
    showContactHistory={showContactHistory} 
    setShowContactHistory={setShowContactHistory} 
  />}
          {activeTab === "Check-ins" && (
            <Checkin data={data} refresh={fetchUser} />
          )}
          {activeTab === "Recent Alerts" && <RecentAlerts data={data} />}
          {activeTab === "Alert Credits" && (
            <Credits data={data} refresh={fetchUser} />
          )}
          {activeTab === "Admin Notes" && (
            <AdminNotes data={data} refresh={fetchUser} />
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function SectionTitle({ children }) {
  return (
    <h2 className="text-2xl font-semibold tracking-wide text-[#002c3e] px-10 py-6">
      {children}
    </h2>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-md font-semibold tracking-wide text-[#5a6c7d]">
        {label}
      </p>
      <p className="text-xl font-semibold leading-8 tracking-wide text-[#002c3e]">
        {value || "—"}
      </p>
    </div>
  );
}

function ConsentBadge({ status }) {
  const map = {
    YES: "bg-green-100 text-green-700",
    STOP: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[status] || map["Pending"]
      }`}
    >
      {status}
    </span>
  );
}

function PremiumTable({ headers, children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-gray-700 uppercase text-xs">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-6 py-4 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================
   OVERVIEW
===================================================== */

function Overview({ data }) {

  const u = data.basicInfo
  
  function formatDate(date){
  
  const d = new Date(date)
  
  const day = d.getDate()
  const month = d.toLocaleString("en",{month:"short"})
  const year = d.getFullYear()
  
  const time = d.toLocaleString("en",{
  hour:"numeric",
  minute:"2-digit",
  hour12:true
  })
  
  return `${day} ${month} ${year} | ${time}`
  
  }

  function formatLanguage(lang){

    if(lang === "en") return "English"
    if(lang === "zh") return "Chinese"
    
    return "-"
    }
  
    function formatVoice(v){

      if(v === "female_soft") return "Female"
      if(v === "male_soft") return "Male"
      
      return "-"
      }
  
  return(
  
  <div>
  
  <SectionTitle>User Overview</SectionTitle>
  
  <div className="border-t border-[#CFD5DB]">
  
  <div className="grid grid-cols-4 gap-x-12 px-10 py-6 border-b border-[#CFD5DB]">
  <Info label="Phone" value={u.phone}/>
  <Info label="Gender" value={u.gender}/>
  <Info label="Location" value={u.profileLocation}/>
  <Info label="Language" value={formatLanguage(u.language)} />
  
  </div>
  
  <div className="grid grid-cols-4 gap-x-12 px-10 py-6">
  
  <Info label="Email" value={u.email}/>
  <Info label="Age" value={u.age}/>
  <Info label="Account Created" value={<span className="tracking-tight">{formatDate(u.createdAt)}</span>}/>
  <Info label="Voice Reminder" value={formatVoice(u.alertVoice)} />
  
  </div>
  
  </div>
  
  </div>
  
  )
  
  }

/* =====================================================
   SUBSCRIPTION
===================================================== */


  function formatPlan(plan){

    if(plan === "MONTHLY") return "Monthly"
    if(plan === "YEARLY") return "Yearly"
    if(plan === "TRIAL") return "Trial"
    
    return plan
    
    }

    function formatStatus(status){

      if(status === "ACTIVE") return "Active"
      if(status === "EXPIRED") return "Expired"
      if(status === "CANCELLED") return "Cancelled"
      
      return status
      
      }

      function getExpiryDate(date){

        const d = new Date(date)
        
        d.setDate(d.getDate() - 1)
        
        return formatDate(d)
        
        }

function Subscription({ data , showHistory, setShowHistory}) {

  const s = data.subscription;

  if (!s) {
    return (
      <div className="px-10 py-8">
        <p className="text-[#5a6c7d]">No active subscription</p>
      </div>
    );
  }

  return (

    <div>

      {/* TITLE + BUTTON */}

      <div className="flex justify-between items-center px-10 py-6">

        <h2 className="text-2xl font-semibold text-[#002c3e]">
          Subscription Details
        </h2>

        <button
  onClick={() => setShowHistory(true)}
  className="bg-[#002c3e] text-white px-6 py-2 font-semibold tracking-wide rounded-full text-md"
>
  History
</button>

      </div>

      {/* DATA */}

      <div className="border-t border-[#CFD5DB]">

        {/* ROW 1 */}

        <div className="grid grid-cols-3 px-10 py-6 border-b border-[#CFD5DB]">

          <Info
            label="Plan Type"
            value={formatPlan(s.planType)}
          />

          <Info
            label="Start Date"
            value={formatDate(s.startDate)}
          />

          <Info
            label="Next Renewal Date"
            value={formatDate(s.nextRenewalDate)}
          />

        </div>

        {/* ROW 2 */}

        <div className="grid grid-cols-3 px-10 py-6">

          <Info
            label="Auto Renewal"
            value={s.autoRenew ? "Yes" : "No"}
          />

<Info
label="Expiry Date"
value={getExpiryDate(s.nextRenewalDate)}
/>

          <Info
            label="Status"
            value={formatStatus(s.status)}
          />

        </div>

      </div>

      {showHistory && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white w-[600px] max-h-[80vh] overflow-y-auto rounded-3xl p-6 relative">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setShowHistory(false)}
        className="absolute top-4 right-4 text-xl font-bold text-gray-500"
      >
        ✕
      </button>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold text-[#002c3e] mb-4">
        Subscription History
      </h2>

      {/* HISTORY LIST */}
      {data.subscriptionHistory?.length ? (
        <div className="space-y-3">
          {data.subscriptionHistory.map((s) => (
            <div
              key={s._id}
              className="bg-[#f5f5f5] rounded-2xl p-4"
            >
              <p className="font-semibold text-[#002c3e]">
                {s.previousPlan} → {s.newPlan}
              </p>
              <p className="text-sm text-[#5a6c7d] mt-1">
                {new Date(s.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#5a6c7d]">No history found</p>
      )}

    </div>
  </div>
)}

    </div>

    

  );

  
}



/* =====================================================
   SUBSCRIPTION HISTORY
===================================================== */

function SubscriptionHistory({ data }) {
  if (!data.subscriptionHistory?.length)
    return <p>No subscription changes found.</p>;

  return (
    <>
      <SectionTitle>Subscription History</SectionTitle>
      <div className="space-y-4">
        {data.subscriptionHistory.map((s) => (
          <div
            key={s._id}
            className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm"
          >
            <p className="font-semibold text-gray-800">
              {s.previousPlan} → {s.newPlan}
            </p>
            <p className="text-gray-500 mt-1 text-sm">
              {new Date(s.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

/* =====================================================
   CONTACTS
===================================================== */

function Contacts({ data, showContactHistory, setShowContactHistory  }) {

  const contacts = data.contacts || [];

  // minimum 2 rows दिखाने के लिए
  const displayContacts =
    contacts.length >= 2
      ? contacts
      : [...contacts, ...Array(2 - contacts.length).fill(null)];

  return (

    <div>
<div className="flex justify-between items-center px-4 py-2">

<SectionTitle>Trusted Contacts</SectionTitle>

<button
  onClick={() => setShowContactHistory(true)}
  className="bg-[#002c3e] text-white px-6 py-2 rounded-full font-semibold"
>
  History
</button>

</div>

      <div className="border border-[#CFD5DB] overflow-hidden">

        {displayContacts.map((c, index) => (

          <div
            key={index}
            className={`grid grid-cols-5 px-10 py-6 items-center ${
              index !== displayContacts.length - 1
                ? "border-b border-[#CFD5DB]"
                : ""
            }`}
          >

            {/* NUMBER + NAME */}

            <div className="flex items-center gap-2 -ml-1">

              <div className="w-10 h-10 rounded-full bg-[#78bcc4] text-white flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>

              <div>

                <p className="text-md font-semibold text-[#5a6c7d]">
                  Contact
                </p>

                <p className="font-semibold tracking-wide leading-6 text-xl text-[#002c3e]">
                  {c?.name || "No Contact Added"}
                </p>

              </div>

            </div>


            {/* PHONE */}

            <div className="ml-18">

              <p className="text-md font-semibold text-[#5a6c7d]">
                Phone
              </p>

              <p className="font-semibold tracking-wide leading-8 text-lg text-[#002c3e]">
                {c?.phone || "-"}
              </p>

            </div>


            {/* ADDED ON */}

            <div className="ml-18">

              <p className="text-md font-semibold text-[#5a6c7d]">
                Added On
              </p>

              <p className="font-semibold  leading-8 text-lg text-[#002c3e]">
              {c?.createdAt ? formatDate(c.createdAt) : "-"}
              </p>

            </div>


            {/* CONSENT */}

            <div className="ml-18">

              <p className="text-md font-semibold text-[#5a6c7d]">
                Consent
              </p>

              <p className="font-semibold tracking-wide leading-8 text-lg text-[#002c3e]">
                {c?.consentStatus || "-"}
              </p>

            </div>


            {/* CONSENT DATE */}

            <div className="ml-18">

              <p className="text-md font-semibold text-[#5a6c7d]">
                Consent Date
              </p>

              <p className="font-semibold tracking-wide leading-8 text-lg text-[#002c3e]">
                {c?.consentDate
                  ? new Date(c.consentDate).toLocaleDateString()
                  : "-"}
              </p>

            </div>

          </div>

        ))}

      </div>

      {showContactHistory && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white w-[650px] max-h-[80vh] overflow-y-auto rounded-3xl p-6 relative">

      {/* CLOSE */}
      <button
        onClick={() => setShowContactHistory(false)}
        className="absolute top-4 right-4 text-xl font-bold text-gray-500"
      >
        ✕
      </button>

      {/* TITLE */}
      <h2 className="text-2xl font-semibold text-[#002c3e] mb-4">
        Contact History
      </h2>

      {/* HISTORY */}
      {data.contactHistory?.length ? (
        <div className="space-y-3">

          {data.contactHistory.map((c) => (

            <div
              key={c._id}
              className="bg-[#f5f5f5] rounded-2xl p-4 flex justify-between items-center"
            >

              {/* LEFT */}
              <div>
                <p className="font-semibold text-[#002c3e]">
                  {c.name} ({c.phone})
                </p>

                <p className="text-sm text-[#5a6c7d] mt-1">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>

              {/* RIGHT (ACTION BADGE) */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  c.action === "ADDED"
                    ? "bg-green-100 text-green-700"
                    : c.action === "UPDATED"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {c.action}
              </span>

            </div>

          ))}

        </div>
      ) : (
        <p className="text-[#5a6c7d]">No history found</p>
      )}

    </div>

  </div>
)}

    </div>

  );
}

/* =====================================================
   ALERTS
===================================================== */

function formatAlertType(type){

  if(!type) return "-"
  
  return type
  .toLowerCase()
  .replace("_"," ")
  .replace(/\b\w/g,c=>c.toUpperCase())
  
  }

  function formatAlertStatus(status){

    if(!status) return "-"
    
    if(status === "SMS_PENDING") return "SMS Pending Retry"
    if(status === "SMS_SENT") return "SMS Sent"
    if(status === "FAILED") return "Failed"
    if(status === "CREATED") return "Created"
    
    return status
    }


function RecentAlerts({ data }) {

  const alerts = data?.recentAlerts?.length
    ? data.recentAlerts
    : [
        {
          type: "Missed Check-in",
          status: "SMS Pending Retry",
          creditsUsed: 1,
          retryCount: 2,
          createdAt: "2026-03-03T10:00:00",
        },
      ];

  const a = alerts[0];

  return (

    <div>

      <SectionTitle>Recent Alerts</SectionTitle>

      <div className="border border-[#CFD5DB]  overflow-hidden">

        {/* ROW 1 */}

        <div className="grid grid-cols-3 px-10 py-6 border-b border-[#CFD5DB]">

          {/* ALERT TYPE */}

          <div>

            <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
              Alert Type
            </p>

            <p className="font-semibold tracking-wide leading-8 text-xl text-[#ee6a59]">
            {formatAlertType(a.type)}
            </p>

          </div>


          {/* STATUS */}

          <div>

            <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
              Status
            </p>

            <p className="font-semibold tracking-wide leading-8 text-xl text-[#002c3e]">
            {formatAlertStatus(a.status)}
            </p>

          </div>


          {/* CREDITS USED */}

          <div>

            <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
              Alert Credits Used
            </p>

            <p className="font-semibold tracking-wide leading-8 text-xl text-[#002c3e]">
              {a.creditsUsed}
            </p>

          </div>

        </div>


        {/* ROW 2 */}

        <div className="grid grid-cols-3 px-10 py-6">

          {/* DATE */}

          <div>

            <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
              Date | Time
            </p>

            <p className="font-semibold tracking-wide leading-8 text-xl text-[#002c3e]">
{formatDateTime(a.createdAt)}
</p>

          </div>


          {/* ATTEMPTS */}

          <div>

            <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
              Attempts
            </p>

            <p className="font-semibold tracking-wide leading-8 text-xl text-[#002c3e]">
            {a.retryCount ?? 0} | 5
            </p>

          </div>


          {/* BALANCE */}

          <div>

            <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
              Alert Credits Balance
            </p>

            <p className="font-semibold tracking-wide leading-8 text-xl text-[#002c3e]">
              {data?.currentBalance ?? 2}
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}

/* =====================================================
   CHECKIN
===================================================== */


function formatDelay(min){

  if(!min) return "-"
  
  if(min % 60 === 0){
  
  const hours = min / 60
  
  if(hours === 1) return "1 Hour"
  
  return `${hours} Hours`
  
  }
  
  return `${min} Minutes`
  
  }
  function formatDateTime(date){

    if(!date) return "-"
    
    const d = new Date(date)
    
    const day = d.getDate()
    const month = d.toLocaleString("en",{month:"short"})
    const year = d.getFullYear()
    
    const time = d.toLocaleString("en",{
    hour:"numeric",
    minute:"2-digit",
    hour12:true
    })
    
    return `${day} ${month} ${year} | ${time}`
    
    }

    function getStatusReason(c){

      if(c.status === "PAUSED") return "User Paused Manually"
      
      if(c.status === "ALERTED") return "Missed Check-in"
      
      return "-"
      
      }

    function formatTime(time){

      if(!time) return "-"
      
      const [h,m] = time.split(":")
      const d = new Date()
      d.setHours(h)
      d.setMinutes(m)
      
      return d.toLocaleString("en",{
      hour:"numeric",
      minute:"2-digit",
      hour12:true
      })
      
      }

      function formatStatuss(status){

        if(status === "PAUSED") return "Paused"
        if(status === "ACTIVE") return "Active"
        if(status === "ALERTED") return "Alerted"
        
        return status
        
        }

        

function Checkin({ data }) {

  const c = data.checkin;

  if (!c) {
    return (
      <div className="px-10 py-8">
        <p className="text-[#5a6c7d]">No check-in schedule set.</p>
      </div>
    );
  }

  const rows = [
    {
    label: "Check-In Time",
    value: c.checkInTimes?.length
    ? c.checkInTimes.map(t => formatTime(t)).join(" / ")
    : "No Check-in Time Set",
    delay: formatDelay(c.graceMinutes),
    status: c.status
    },
    {
    label: "Check-In Time",
    value: c.checkInTimes?.length
    ? c.checkInTimes.map(t => formatTime(t)).join(" / ")
    : "-",
    lastCheckin: c.lastCheckInAt
    ? formatDateTime(c.lastCheckInAt)
    : "-",
    reason: c.status === "PAUSED"
    ? "User Paused Manually"
    : "-"
    }
    ]

  return (

    <div>

      <SectionTitle>Check-In Details</SectionTitle>

      <div className="border border-[#CFD5DB] overflow-hidden">

        {rows.map((row, index) => (

          <div
            key={index}
            className={`grid grid-cols-4 px-10 py-6 items-center ${
              index !== rows.length - 1
                ? "border-b border-[#CFD5DB]"
                : ""
            }`}
          >

            {/* NUMBER + TITLE */}

            <div className="flex items-center gap-2 ">

              <div className="w-12 h-12 rounded-full bg-[#78bcc4] text-white flex items-center justify-center text-xl font-semibold">
                {index + 1}
              </div>

              <div>

                <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
                  {row.label}
                </p>

                <p className="font-semibold tracking-wide leading-8 text-xl text-[#002c3e]">
                  {row.value}
                </p>

              </div>

            </div>


            {/* ALERT DELAY / LAST CHECKIN */}

            <div className="ml-18">

              <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
                {index === 0 ? "Alert Delay" : "Last Check-in"}
              </p>

              <p className="font-semibold tracking-wide leading-8 text-xl text-[#002c3e]">
                {index === 0 ? row.delay : row.lastCheckin}
              </p>

            </div>


            {/* STATUS / REASON */}

            <div className="ml-18 col-span-2">

              <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">
                {index === 0 ? "Status" : "Status Reason"}
              </p>

              <p
                className={`font-semibold tracking-wide leading-8 text-xl ${
                  index === 0 && row.status === "PAUSED"
                    ? "text-[#ee6a59]"
                    : "text-[#002c3e]"
                }`}
              >
                {index === 0 ? formatStatuss(row.status) : row.reason}
              </p>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

/* =====================================================
   CREDITS
===================================================== */

function Credits({ data, refresh }) {

  const [amount, setAmount] = useState(2);
  const [loading, setLoading] = useState(false);

  const history = data.creditHistory || [];

  const [page, setPage] = useState(1);
  const perPage = 5;

  const totalPages = Math.ceil(history.length / perPage);

  const paginatedHistory = history.slice(
    (page - 1) * perPage,
    page * perPage
  );

  function formatDateTime(date){

    if(!date) return "-"

    const d = new Date(date)

    const day = d.getDate()
    const month = d.toLocaleString("en",{month:"short"})
    const year = d.getFullYear()

    const time = d.toLocaleString("en",{
      hour:"numeric",
      minute:"2-digit",
      hour12:true
    })

    return `${day} ${month} ${year} | ${time}`

  }

  function formatReason(reason){

    if(!reason) return "-"

    return reason
      .toLowerCase()
      .replaceAll("_"," ")
      .replace(/\b\w/g,c=>c.toUpperCase())

  }

  const adjustCredit = async () => {

    if (!amount) return;

    try {

      setLoading(true);

      await api.post(`/admin/users/${data.basicInfo._id}/adjust-credits`, {
        amount: Number(amount),
        reason: "ADMIN_ADJUSTMENT",
      });

      refresh();

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  };

  return (

    <div className="tracking-wide">

      {/* HEADER */}

      <div className="grid grid-cols-2 px-10 py-6">

        <h2 className="text-[26px] font-semibold text-[#002c3e]">
          Alert Credits Management
        </h2>

        <h2 className="text-[26px] font-semibold text-[#002c3e]">
          Adjust Alert Credits
        </h2>

      </div>


      {/* INFO + ADJUST */}

      <div className="grid grid-cols-2 border-t border-[#CFD5DB]">

        <div className="flex gap-24 px-10 py-6">

          <div>

            <p className="text-lg font-semibold text-[#5a6c7d]">
              Alert Credits Used
            </p>

            <p className="font-semibold text-xl text-[#002c3e]">
              {data.totalCreditsUsed || 1}
            </p>

          </div>

          <div>

            <p className="text-lg font-semibold text-[#5a6c7d]">
              Alert Credits Balance
            </p>

            <p className="font-semibold text-xl text-[#002c3e]">
              {data.currentBalance}
            </p>

          </div>

        </div>


        {/* ADJUST */}

        <div className="flex items-center justify-center">

          <div className="flex items-center gap-4 bg-[#B5B9B2] px-6 py-6 -ml-12 rounded-4xl">

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-38 px-4 py-2 text-[#5a6c7d] text-xl bg-white rounded-full outline-none"
            />

            <button
              onClick={() => setAmount(amount + 1)}
              className="w-12 h-12 rounded-full bg-white text-4xl text-[#5a6c7d] flex items-center justify-center"
            >
              +
            </button>

            <button
              onClick={() => setAmount(amount - 1)}
              className="w-12 h-12 rounded-full bg-white text-4xl text-[#5a6c7d] flex items-center justify-center"
            >
              −
            </button>

            <button
              onClick={adjustCredit}
              disabled={loading}
              className="bg-[#002c3e] text-white px-14 py-3 rounded-full font-semibold"
            >
              {loading ? "..." : "Apply"}
            </button>

          </div>

        </div>

      </div>


      {/* HISTORY TITLE */}

      <div className="border-t border-[#CFD5DB] px-10 py-5">

        <p className="text-xl font-semibold text-[#002c3e]">
          View History
        </p>

      </div>


      {/* HISTORY */}

      <div>

        {paginatedHistory.map((c) => {

          const isAdd = c.type === "ADD";

          return (

            <div
              key={c._id}
              className="flex justify-between items-center px-10 py-6 border-t border-[#CFD5DB]"
            >

              {/* LEFT */}

              <div className="flex items-center gap-4">

                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                    isAdd ? "bg-[#0cb4ab]" : "bg-[#ee6a59]"
                  }`}
                >
                  {isAdd ? "+" : "−"}
                </div>

                <div>

                  <p className="font-semibold text-xl text-[#002c3e]">
                    {formatReason(c.reason)}
                  </p>

                  <p
                    className={`text-lg font-semibold ${
                      isAdd ? "text-[#5a6c7d]" : "text-[#ee6a59]"
                    }`}
                  >
                    {formatDateTime(c.createdAt)}
                  </p>

                </div>

              </div>


              {/* RIGHT */}

              <div className="text-right">

                <p className="text-lg font-semibold text-[#5a6c7d]">
                  Alert Credits
                </p>

                <p
                  className={`font-semibold text-2xl ${
                    isAdd ? "text-[#0cb4ab]" : "text-[#ee6a59]"
                  }`}
                >
                  {isAdd ? `+${c.amount}` : `-${c.amount}`}
                </p>

              </div>

            </div>

          );

        })}

      </div>


      {/* PAGINATION */}

      <div className="flex justify-center items-center gap-6 py-8">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-6 py-2 border border-[#5a6c7d] text-[#5a6c7d] rounded-full"
        >
          Back
        </button>

        <p className="text-[#5a6c7d] font-semibold">
          Page {page} of {totalPages || 1}
        </p>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-6 py-2 bg-[#002c3e] text-white rounded-full"
        >
          Next
        </button>

      </div>

    </div>

  );

}
/* =====================================================
   ADMIN NOTES
===================================================== */

function AdminNotes({ data, refresh }) {

  const [note, setNote] = useState("");

  const addNote = async () => {

    if (!note.trim()) return;

    await api.post(`/admin/users/${data.basicInfo._id}/notes`, { note });

    setNote("");

    refresh();

  };

  return (

    <div>

      {/* TITLE */}

      <SectionTitle>Admin Notes</SectionTitle>


      {/* TEXTAREA */}

      <div className="px-10 py-6">

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-32 border border-[#BDC7CE] rounded-[28px] text-[#002c3e] px-6 py-4 outline-none resize-none text-lg"
        />

        <button
          onClick={addNote}
          className="mt-6 bg-[#002c3e] text-white px-8 py-3 rounded-full font-semibold"
        >
          Add Note
        </button>

      </div>


      {/* HISTORY TITLE */}

      <div className="border-t border-[#C7D0D6] px-10 py-5">

        <p className="text-xl font-semibold text-[#002c3e]">
          View History
        </p>

      </div>


      {/* HISTORY LIST */}

      <div>

        {data.adminNotes?.map((n) => (

          <div
            key={n._id}
            className="px-10 py-6 border-t border-[#C7D0D6]"
          >

            <p className="font-semibold tracking-wide leading-8 text-xl text-[#002c3e]">
              {n.note}
            </p>

            <p className="text-lg tracking-wide font-semibold text-[#5a6c7d]">

            {formatDateTime(n.createdAt)}

            </p>

          </div>

        ))}

      </div>

    </div>

  );

}