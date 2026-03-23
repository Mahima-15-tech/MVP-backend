import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import { CalendarDays } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

export default function CustomDatePicker({ value, onChange, placeholder }) {

  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState(value);

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
        className="bg-white rounded-full px-6 py-3 w-[250px] cursor-pointer flex justify-between items-center"
      >
        <span className={`${value ? "text-[#002c3e]" : "text-gray-400"}`}>
          {value
            ? new Date(value).toLocaleDateString("en-GB").replaceAll("/", " | ")
            : "DD | MM | YY"}
        </span>

        <CalendarDays size={22} className="text-[#002c3e]" />
      </div>

      {/* DROPDOWN CALENDAR (NOT MODAL) */}
      {open && (
        <div className="absolute top-[60px] left-0 z-50 bg-white rounded-3xl p-3 w-62 shadow-xl">

          <DatePicker
            selected={tempDate}
            onChange={(date) => setTempDate(date)}
            inline
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