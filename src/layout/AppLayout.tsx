import React from "react";
import { LogOut } from "lucide-react";
import Sidebar from "../components/Sidebar";
import logo from "../assets/logo-negativo.png";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-14 auto"></img>
          <h1 className="text-3xl font-bold">WebApp</h1>
        </div>
        <Sidebar />
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-2 hover:text-gray-300">
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-4">
            <span>Username</span>
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
          </div>
        </header>
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
