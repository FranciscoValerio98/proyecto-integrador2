import React from "react";
import { Bell } from "lucide-react";

const NotificationBell = ({ count, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="relative p-2.5 md:p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Notificaciones"
    >
      <Bell size={22} className="text-[#1e3a8a] group-hover:rotate-12 transition-transform" />
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white animate-bounce shadow-sm">
          {count > 9 ? '+9' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;