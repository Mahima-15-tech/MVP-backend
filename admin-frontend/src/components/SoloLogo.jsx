export default function SoloLogo({ scale = 1 }) {
  return (
    <div
      className="flex flex-col items-center"
      style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
    >
      <div className="flex items-end">

        {/* S */}
        <span
          style={{
            fontSize: "72px",
            fontWeight: "700",
            color: "#002c3e",
            lineHeight: "1"
          }}
        >
          S
        </span>

        {/* BIG O */}
        <svg viewBox="0 0 100 100" style={{ width: "92px", height: "92px" }}>

          <circle cx="50" cy="50" r="48" fill="#1f9f98"/>
          <circle cx="50" cy="50" r="43" fill="#22b3ac"/>

          <g>
            <circle cx="36" cy="42" r="13" fill="white"/>
            <circle cx="64" cy="42" r="13" fill="white"/>

            <circle cx="36" cy="42" r="6" fill="black">
              <animate attributeName="cx" values="30;42;30" dur="3s" repeatCount="indefinite"/>
            </circle>

            <circle cx="64" cy="42" r="6" fill="black">
              <animate attributeName="cx" values="70;58;70" dur="3s" repeatCount="indefinite"/>
            </circle>

            <rect x="20" y="28" width="60" height="0" fill="#22b3ac">
              <animate
                attributeName="height"
                values="0;0;28;0"
                keyTimes="0;0.45;0.5;1"
                dur="4s"
                repeatCount="indefinite"
              />
            </rect>
          </g>

        </svg>

        {/* L */}
        <span
          style={{
            fontSize: "72px",
            fontWeight: "700",
            color: "#002c3e",
            lineHeight: "1"
          }}
        >
          L
        </span>

        {/* CLOCK O */}
        <svg viewBox="0 0 100 100" style={{ width: "72px", height: "76px" }}>

          <circle cx="50" cy="50" r="45" fill="#b5d43c"/>

          <circle cx="50" cy="50" r="5" fill="#002c3e"/>

          <rect x="48" y="20" width="4" height="34" fill="#002c3e">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="18s"
              repeatCount="indefinite"
            />
          </rect>

          <rect x="48" y="18" width="4" height="28" fill="#002c3e">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="60s"
              repeatCount="indefinite"
            />
          </rect>

        </svg>

      </div>

      {/* tagline */}
      <p
        style={{
          marginTop: "8px",
          fontSize: "18px",
          color: "#5a6c7d",
          fontWeight: "500",
          letterSpacing: "0.9px",
          marginLeft: "-7px"
          
        }}
      >
        Your Daily Check-In Buddy
      </p>

    </div>
  );
}