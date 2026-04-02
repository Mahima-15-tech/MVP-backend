import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

export default function CustomDatePicker({ value, onChange, placeholder }) {

  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const [showMonth, setShowMonth] = useState(false);
const [showYear, setShowYear] = useState(false);

const years = Array.from({ length: 50 }, (_, i) => 2000 + i);
const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

  const ref = useRef();

  // 👉 click outside close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
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
  className="bg-white rounded-full px-8 py-2.5 w-[200px] cursor-pointer flex items-center gap-2 hover:bg-[#f9faf9] transition"
>
  <span className={`${value ? "text-[#002c3e]" : "text-gray-400"} text-sm`}>
    {value
      ? new Date(value).toLocaleDateString("en-GB").replaceAll("/", " | ")
      : "DD | MM | YY"}
  </span>

  <CalendarDays size={18} className="text-[#002c3e] ml-auto" />
</div>

      {/* DROPDOWN CALENDAR (NOT MODAL) */}
      {open && (
        <div className="absolute top-[60px] left-0 z-50 bg-white rounded-3xl p-3 w-62 shadow-xl">

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

    <div className="flex items-center justify-between px-3 mb-3">

      {/* LEFT */}
      <button
        onClick={decreaseMonth}
        className="w-8 h-8 rounded-full bg-[#f1f3f4] hover:bg-[#e0e0e0]"
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
            className="bg-[#f5f5f5] px-3 py-1 rounded-full text-sm font-semibold text-[#002c3e] cursor-pointer"
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
            className="bg-[#f5f5f5] px-3 py-1 rounded-full text-sm font-semibold text-[#002c3e] cursor-pointer"
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
        className="w-8 h-8 rounded-full bg-[#f1f3f4] hover:bg-[#e0e0e0]"
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
              className="bg-[#B5B9B2] text-white  px-6 py-2 rounded-full"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onChange(tempDate);
                setOpen(false);
              }}
              className="bg-[#002c3e] text-white px-6 py-2 rounded-full"
            >
              Confirm
            </button>

          </div>

        </div>
      )}
    </div>
  );
}