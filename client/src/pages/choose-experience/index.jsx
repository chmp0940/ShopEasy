import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, LayoutDashboard, Eye, ArrowRight } from "lucide-react";
import { useSelector } from "react-redux";

function ChooseExperience() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, <span className="text-emerald-600">{user?.userName || "User"}</span> 👋
          </h1>
          <p className="text-lg text-gray-500">
            Choose where you'd like to go
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Shopping Card */}
          <div
            onClick={() => navigate("/shop/home")}
            className="group relative cursor-pointer bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Shopping Store
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  Browse products, add to cart, and place orders — the full shopping experience.
                </p>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 font-medium group-hover:gap-3 transition-all duration-300">
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Admin Viewer Card */}
          <div
            onClick={() => navigate("/admin/dashboard")}
            className="group relative cursor-pointer bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform duration-300">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Admin Panel
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  View the admin dashboard, products, and orders in
                  <span className="inline-flex items-center gap-1 ml-1 text-violet-600 font-medium">
                    <Eye className="w-3.5 h-3.5" /> read-only
                  </span>{" "}
                  mode.
                </p>
              </div>
              <div className="flex items-center gap-2 text-violet-600 font-medium group-hover:gap-3 transition-all duration-300">
                <span>View Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-400">
          You can switch anytime by navigating back here
        </p>
      </div>
    </div>
  );
}

export default ChooseExperience;
