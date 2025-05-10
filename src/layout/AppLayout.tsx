import React from "react";
import { LogOut } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Bilinguismo</h1>
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
          <h2 className="text-lg font-medium">Top Bar</h2>
          <div className="flex items-center gap-4">
            <button className="hover:text-gray-500">Help</button>
            <div className="flex items-center gap-2">
              <span>Max Happiness</span>
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </header>
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
