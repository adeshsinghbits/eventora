import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const { sidebarOpen, theme } = useSelector((state) => state.ui);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <Topbar />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-24"
        }`}
      >
        <main className="pt-20 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}