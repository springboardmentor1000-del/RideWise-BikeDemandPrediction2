import { LayoutDashboard, Brain, Map, Calendar, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function SideNavbar() {
  return (
    <aside className=" fixed top-0 left-0 h-screen w-[260px]
    bg-gradient-to-b
      from-[#6d3aa8]/35
      via-[#3b155f]/30
      to-[#12001f]/40
    backdrop-blur-xl
    border-r border-white/10
    shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)]
    pt-28 px-4
    z-40">
      <p className="text-gray-500 text-xs mb-4 tracking-widest">NAVIGATION</p>

      <SidebarItem to="/home" icon={<LayoutDashboard />} text="Dashboard" />
      <SidebarItem to="/predict" icon={<Brain />} text="AI Insights" />
      <SidebarItem to="/map" icon={<Map />} text="Station Map" />
      <SidebarItem to="/reserve" icon={<Calendar />} text="Reservations" />
      <SidebarItem to="/setting" icon={<Settings />} text="Settings" />
    </aside>
  );
}

function SidebarItem({ to, icon, text }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all
        ${
          isActive
            ? "bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-lg"
            : "text-white hover:bg-white/5"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{text}</span>
    </NavLink>
  );
}