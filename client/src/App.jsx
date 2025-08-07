import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/auth/layout";
import AuthLogin from "./pages/auth/login";
import AuthRegister from "./pages/auth/register";
import AdminLayout from "./components/admin/layout";
import AdminDashboard from "./pages/admin/dashboard";
import AdminProducts from "./pages/admin/products";
import AdminOrders from "./pages/admin/order";
import AdminFeatures from "./pages/admin/features";
import ShoppingLayout from "./components/shop/layout";
import Notfound from "./pages/not-found";
import ShoppingHome from "./pages/shop/home";
import ShoppingCheckout from "./pages/shop/checkout";
import ShoppingAccount from "./pages/shop/account";
import ShoppingListing from "./pages/shop/listing";
import CheckAuth from "./components/common/checkauth";
import UnauthPage from "./pages/unauth-page";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth, setLoadingFalse } from "./store/auth-slice";
import { Skeleton } from "@/components/ui/skeleton";
import PaypalReturnPage from "./pages/shop/paypal-return";
import PaymentSuccessPage from "./pages/shop/payment-success";
import SearchProducts from "./pages/shop/search";

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
    <Routes>
      <Route
        path="/"
        element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}></CheckAuth>
        }
      />
      <Route
        path="/"
        element={
          <CheckAuth isAuthenticated={isAuthenticated} user={user}></CheckAuth>
        }
      />
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
  );
}

export default App;
