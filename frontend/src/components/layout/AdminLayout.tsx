import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto bg-black p-6 text-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}