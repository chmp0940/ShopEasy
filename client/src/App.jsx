import { Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, setLoadingFalse } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";
import CheckAuth from "./components/common/checkauth";

// Layouts loaded eagerly (needed immediately)
import AuthLayout from "./components/auth/layout";
import AdminLayout from "./components/admin/layout";
import ShoppingLayout from "./components/shop/layout";

// Pages loaded lazily (only when user navigates to them)
const AuthLogin = lazy(() => import("./pages/auth/login"));
const AuthRegister = lazy(() => import("./pages/auth/register"));
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/products"));
const AdminOrders = lazy(() => import("./pages/admin/order"));
const AdminFeatures = lazy(() => import("./pages/admin/features"));
const ShoppingHome = lazy(() => import("./pages/shop/home"));
const ShoppingCheckout = lazy(() => import("./pages/shop/checkout"));
const ShoppingAccount = lazy(() => import("./pages/shop/account"));
const ShoppingListing = lazy(() => import("./pages/shop/listing"));
const PaypalReturnPage = lazy(() => import("./pages/shop/paypal-return"));
const PaymentSuccessPage = lazy(() => import("./pages/shop/payment-success"));
const SearchProducts = lazy(() => import("./pages/shop/search"));
const ChooseExperience = lazy(() => import("./pages/choose-experience"));
const SSOCallback = lazy(() => import("./pages/auth/sso-callback"));
const GoogleComplete = lazy(() => import("./pages/auth/google-complete"));
const UnauthPage = lazy(() => import("./pages/unauth-page"));
const Notfound = lazy(() => import("./pages/not-found"));

// Fallback spinner for lazy-loaded pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  );
}

function App() {
  const { isAuthenticated, user, isLoading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  console.log(isAuthenticated);

  useEffect(() => {
    try {
      const token = JSON.parse(sessionStorage.getItem("token"));
      console.log("Token from sessionStorage:", token);

      if (token && token !== null) {
        // Only call checkAuth if token exists and is not null
        dispatch(checkAuth(token));
      } else {
        // If no token or token is null, stop loading immediately
        console.log("No valid token found, stopping loading");
        dispatch(setLoadingFalse());
      }
    } catch (error) {
      // If JSON.parse fails, clear invalid token and stop loading
      console.log("Invalid token format, clearing and stopping loading");
      sessionStorage.removeItem("token");
      dispatch(setLoadingFalse());
    }
  }, [dispatch]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-[600px] w-full  bg-black" />
      </div>
    );
  }
  return (
    <>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth
              isAuthenticated={isAuthenticated}
              user={user}
            ></CheckAuth>
          }
        />
        {/* SSO callback routes — outside /auth to avoid route conflict with auth layout */}
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route path="/google-complete" element={<GoogleComplete />} />
        <Route
          path="auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<AuthLogin />} />
          <Route path="register" element={<AuthRegister />} />
        </Route>
        <Route
          path="/choose-experience"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ChooseExperience />
            </CheckAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
        </Route>
        <Route
          path="/shop"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShoppingLayout />
            </CheckAuth>
          }
        >
          <Route path="account" element={<ShoppingAccount />} />
          <Route path="checkout" element={<ShoppingCheckout />} />
          <Route path="home" element={<ShoppingHome />} />
          <Route path="listing" element={<ShoppingListing />} />
          <Route path="paypal-return" element={<PaypalReturnPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="search" element={<SearchProducts />} />
        </Route>
        <Route path="/unauth-page" element={<UnauthPage />} />
        <Route path="*" element={<Notfound />} />
      </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
