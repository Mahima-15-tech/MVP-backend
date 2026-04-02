import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const el = document.getElementById("main-scroll");

    if (el) {
      // 👇 thoda delay important hai (layout render ke baad)
      setTimeout(() => {
        el.scrollTop = 0;
      }, 50);
    }
  }, [pathname]);

  return null;
}