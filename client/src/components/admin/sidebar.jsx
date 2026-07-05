import {
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useSelector } from "react-redux";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icons: <LayoutDashboard size={20} />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icons: <ShoppingBasket size={20} />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icons: <BadgeCheck size={20} />,
  },
];

function MenuItems({ setOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mt-6 flex-col flex gap-1 px-3">
      {adminSidebarMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path;
        return (
          <div
            key={menuItem.id}
            onClick={() => {
              navigate(menuItem.path);
              setOpen ? setOpen(false) : null;
            }}
            className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-emerald-50 text-emerald-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className={isActive ? "text-emerald-600" : "text-gray-400"}>
              {menuItem.icons}
            </span>
            <span>{menuItem.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function AdminSidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isViewer = user?.role !== "admin";

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b border-gray-100 px-5 py-4">
              <SheetTitle className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <ChartNoAxesCombined size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800">
                  ShopEasy
                </span>
                {isViewer && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold rounded-full bg-violet-100 text-violet-600 uppercase tracking-wide">
                    Viewer
                  </span>
                )}
              </SheetTitle>
            </SheetHeader>
            <MenuItems setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
      <aside className="hidden w-64 flex-col border-r border-gray-100 bg-white lg:flex">
        <div
          onClick={() => navigate("/admin/dashboard")}
          className="flex cursor-pointer items-center gap-2.5 px-5 py-5 border-b border-gray-100"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <ChartNoAxesCombined size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-800">ShopEasy</span>
          {isViewer && (
            <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold rounded-full bg-violet-100 text-violet-600 uppercase tracking-wide">
              Viewer
            </span>
          )}
        </div>
        <MenuItems />
      </aside>
      {/*Aside It semantically tells browsers and assistive technologies that this is a
      sidebar, not the main content. It helps with accessibility and SEO. */ }
    </>
  );
}

export default AdminSidebar;

