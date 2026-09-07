import { MoreHorizontal } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";


interface HeaderProps {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export function Header({ menuOpen, setMenuOpen }: HeaderProps) {
const menuItems = [
  { label: "HOME", path: "/" },
  { label: "GO TO LIVE MAP", path: "/livemap" },
  { label: "DASHBOARD", path: "/dashboard" },
];

  return (
    <header className="flex justify-between items-center w-full z-50">
      <div className="text-3xl grain-text font-serif tracking-widest uppercase">
        Hearken
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[#F4EEDB]"
        >
          <MoreHorizontal size={26} />
        </button>

        {/* First Full Screen Menu*/}
        {menuOpen && (
          <div
            className="
              fixed inset-0 z-[100]
              bg-[#040404]/98 backdrop-blur-sm
              flex flex-col
              animate-in fade-in duration-300
            "
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 pt-8">
              

              <p>Hearken</p>

              {/* Close Button */}
              <button
                onClick={() => setMenuOpen(false)}
                className="text-[#E9DFC8] hover:rotate-90 transition-transform duration-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6L18 18" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 flex items-center justify-center">
  <div
    className="relative z-10 flex flex-col h-dvh overflow-y-auto overscroll-contain px-8 py-8"
    onClick={(e) => e.stopPropagation()}
  >
    {menuItems.map((item, index) => (
      <Link
        key={item.label}
        to={item.path}
        onClick={() => setMenuOpen(false)} 
        className="
          text-[#E9DFC8]
          uppercase
          tracking-[0.18em]
          text-3xl md:text-5xl
          font-serif
          hover:text-[#CFAE63]
          hover:scale-105
          transition-all duration-300
          animate-in slide-in-from-bottom-4 fade-in
        "
        style={{
          animationDelay: `${index * 120}ms`,
          animationFillMode: "both",
        }}
      >
        {item.label}
      </Link>
    ))}
  </div>
</nav>
          </div>
        )}
      </div>
    </header>
  );
}
