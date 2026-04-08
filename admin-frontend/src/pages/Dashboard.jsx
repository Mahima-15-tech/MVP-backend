import { useEffect, useState } from "react";
import api from "../api/axios";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {

  const [data, setData] = useState(null);
  const [activeSegments, setActiveSegments] = useState({
    Trial: true,
    Monthly: true,
    Yearly: true
  });

  const load = async () => {
    const res = await api.get("/admin/dashboard");
    setData(res.data);
  };

  // ✅ SINGLE useEffect
  useEffect(() => {
    load();

    const interval = setInterval(load, 10000);

    return () => clearInterval(interval);
  }, []);

  // ✅ AFTER hooks
  if (!data) return <div>Loading...</div>;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  /* ---------- DONUT CHART ---------- */

  // 👇 ADD HERE (pieData ke upar)

const baseColors = {
  Trial: "#9acd78",
  Monthly: "#04bade",
  Yearly: "#f6c663"
};

const labels = ["Trial", "Monthly", "Yearly"];

const values = [
  data.freeTrialUsers,
  data.monthlyUsers,
  data.yearlyUsers
];

const backgroundColors = labels.map((label, i) => {
  const value = values[i];

  if (!activeSegments[label] || value === 0) {
    return "#e8e8e8"; // grey
  }

  return baseColors[label];
});

const pieData = {
  labels: labels,
  datasets: [
    {
      data: values,
      backgroundColor: backgroundColors,
      borderColor: "#f5f5f5",
      hoverOffset: 5
    }
  ]
};


const pieOptions = {
  cutout: "54%",
  plugins: {
    legend: {
      position: "bottom",
      align: "center",
      labels: {
        color: "#5a6c7d",
        usePointStyle: true,
        pointStyle: "circle",
        padding: 16,
        font: {
          size: 16
        }
      },

      // 🔥 ADD THIS
      onClick: (e, legendItem) => {
        const label = legendItem.text;

        setActiveSegments(prev => ({
          ...prev,
          [label]: !prev[label]
        }));
      }
    }
  },
  maintainAspectRatio: false
};

  return (

    <div className="space-y-8 ">

      {/* KPI */}

      <div className="grid grid-cols-4 gap-6">

      <Card 
  title="Total Users" 
  value={data.totalUsers} 
  onClick={() => console.log("No section yet")} 
/>

<Card 
  title="Active Subscriptions" 
  value={data.activeSubscriptions} 
  onClick={() => scrollToSection("subscription-section")} 
/>

<Card 
  title="Alerts Sent Today" 
  value={data.alertsToday} 
  onClick={() => scrollToSection("activity-section")} 
/>

<Card
  title="SMS Failed (24h)"
  value={data.failedSMS}
  color="text-[#ee6a59]"
  onClick={() => scrollToSection("activity-section")}
/>

        

      </div>


      {/* SECOND ROW */}

      <div className="grid grid-cols-3 gap-6 items-stretch">

        {/* SUBSCRIPTION DISTRIBUTION */}
        <div id="subscription-section" className="bg-[#f5f5f5] rounded-[40px] p-8 flex flex-col">

        <h2 className="text-3xl font-semibold text-[#002c3e] leading-8 tracking-wide mb-4">
  Subscription <br /> Distribution
</h2>

<div className="flex-1 flex items-center justify-center">
  <div className="w-full h-[390px] mt-7 ">
    <Doughnut data={pieData} options={pieOptions}  />
  </div>
</div>

</div>


        {/* SUBSCRIPTION REVENUE */}

        <div id="activity-section" className="bg-[#f5f5f5] rounded-[30px] p-8">

        <h2 className="text-3xl font-semibold text-[#002c3e] leading-8 mb-6 tracking-wide">
  Subscription <br />
  Revenue
  <span className="text-[14px] text-[#5a6c7d] ml-2">Mar 2026</span>
</h2>

          <div className="space-y-2">

            {/* MONTHLY */}

            <div className="relative grid grid-cols-2 rounded-3xl overflow-hidden bg-[#04bade] text-white py-3 px-6">

{/* LEFT */}
<div className="pr-6  mt-2">
  <p className="text-md font-semibold leading-5">Monthly <br /> Plan Gross</p>
  <p className="text-3xl font-medium mt-2">${data.revenue?.monthly?.gross || 0}</p>
</div>

{/* RIGHT */}
<div className="pl-8  mt-2">
  <p className="text-md font-semibold  leading-5">Monthly <br /> Plan Net<sup className="raletive -top-1">*</sup></p>
  <p className="text-3xl font-medium mt-2">${data.revenue?.monthly?.net || 0}</p>
</div>

{/* DIVIDER */}
<div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-white"></div>

</div>


            {/* YEARLY */}

            <div className="relative grid grid-cols-2 rounded-3xl overflow-hidden bg-[#f6c663] text-white py-3 px-6">

            <div className="pr-6 mt-2">
  <p className="text-md font-semibold leading-5">Yearly <br /> Plan Gross</p>
  <p className="text-3xl mt-2">
    ${data.revenue?.yearly?.gross || 0}
  </p>
</div>

<div className="pl-8 mt-2">
  <p className="text-md font-semibold leading-5">Yearly <br /> Plan Net<sup className="raletive -top-1">*</sup></p>
  <p className="text-3xl mt-2">
    ${data.revenue?.yearly?.net || 0}
  </p>
</div>

<div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-white"></div>

</div>


            {/* TOP UPS */}

            <div className="relative grid grid-cols-2 rounded-3xl overflow-hidden bg-[#fc867d] text-white py-3 px-6">

            <div className="pr-6 mt-2">
  <p className="text-md font-semibold leading-5">Top-ups <br /> Gross</p>
  <p className="text-3xl mt-2">
    ${data.revenue?.topups?.gross || 0}
  </p>
</div>

<div className="pl-8 mt-2">
  <p className="text-md font-semibold leading-5">Top-ups <br /> Net<sup className="raletive -top-1">*</sup></p>
  <p className="text-3xl mt-2">
    ${data.revenue?.topups?.net || 0}
  </p>
</div>

<div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-white"></div>

</div>

          </div>

          <p className="text-xs text-[#5a6c7d] mt-4">
            *Net after 15% app store commission
          </p>

        </div>


        {/* SYSTEM ACTIVITY */}

        <div className="bg-[#f5f5f5] rounded-[30px] p-8">

        <h2 className="text-3xl font-semibold text-[#002c3e] -mt-1   tracking-wide">
  System Activity <br /> Today
</h2>

          <div className="space-y-4 ">

          <Activity label="Missed Check-ins" value={data.missedToday} color="#ee6a59" />

<Activity label="SOS Triggers" value={data.sosToday} color="#ee6a59" />

<Activity label="SMS Pending Retry" value={data.retryInProgress} color="#f6c663" />

<Activity label="SMS Confirmed" value={data.smsConfirmed} color="#78bcc4" />

          </div>

        </div>

      </div>

    </div>
  );
}


function Card({ title, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#f5f5f5] rounded-[25px] p-6 text-left shadow-sm 
      cursor-pointer transition-all duration-200 
      hover:scale-[1.03] hover:shadow-md"
    >
      <p className="text-[16px] text-[#5a6c7d] font-semibold">
        {title}
      </p>

      <p className={`text-[48px] font-semibold text-[#002c3e] ${color}`}>
        {value}
      </p>
    </div>
  );
}


function Activity({ label, value, color }) {

  return (

    <div className="flex justify-between items-center bg-[#e8e8e8] px-5 py-5 mt-7 rounded-3xl">

      <span className="text-[#5a6c7d] text-md font-semibold">
        {label}
      </span>

  <span
  className="text-white text-sm font-bold flex items-center justify-center rounded-full min-w-[36px] h-[36px] px-3"
  style={{ background: color }}
>
  {value > 99 ? "99+" : value}
</span>
    </div>
  );
}