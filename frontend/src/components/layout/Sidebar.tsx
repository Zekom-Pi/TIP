import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";

const menuItems = [
  {
    label: "DASHBOARD",
    path: "/dashboard",
  },
  {
    label: "IOC EXPLORER",
    path: "/iocs",
  },
  {
    label: "SOURCES",
    path: "/sources",
  },
  {
    label: "SYNC LOGS",
    path: "/sync-logs",
  },
];

export default function Sidebar() {
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-800 bg-black font-mono text-white select-none">
      <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6">
        <div className="flex items-center gap-2">
          
          <h1 className="text-sm font-bold tracking-widest text-white">
            TIP CORE
          </h1>
        </div>
        
      </div>

      {/* List */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-neutral-600">
          //////
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `
              flex items-center px-3 py-2.5
              text-xs tracking-wider transition
              ${
                isActive
                  ? "border-l-2 border-white bg-neutral-900 font-semibold text-white"
                  : "border-l-2 border-transparent text-neutral-400 hover:bg-neutral-950 hover:text-neutral-200"
              }
              `
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      

      {/* Logout */}
      <div className="border-t border-neutral-800 p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center px-3 py-2.5 text-xs font-medium tracking-wider text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
        >
          <span>X Logout</span>
        </button>
      </div>
    </aside>
  );
}