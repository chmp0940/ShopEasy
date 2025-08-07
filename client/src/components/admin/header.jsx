import { AlignJustify, LogOut } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { logoutUser, resetTokenAndCredentials } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";

function AdminHeader({ setOpen }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  function handleLogout() {
    // dispatch(logoutUser());
    dispatch(resetTokenAndCredentials());
    sessionStorage.clear()
    navigate('/auth/login');
    
  }
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-background border-b">
      <Button
        onClick={() => setOpen(true)}
        className="lg:hidden sm:block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
      >
        <AlignJustify />
        {/* <span className="sr-only">Toggle Menu</span> as such no spl use of it */}
      </Button>
      <div className="flex flex-1 justify-end ">
        <Button
          onClick={handleLogout}
          className="inline-flex gap-2 items-center rounded-md px-4 py-2 text-sm font-medium bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default AdminHeader;
