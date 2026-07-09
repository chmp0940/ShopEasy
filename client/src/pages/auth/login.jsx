import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { loginUser, googleLogin } from "@/store/auth-slice";
import { useSignIn, useAuth } from "@clerk/clerk-react";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
const initialState = {
  email: "",
  password: "",
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const [googleLoading, setGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, isLoaded: isClerkLoaded } = useSignIn();
  const { getToken, signOut, isSignedIn } = useAuth();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
          className: "bg-green-500",
        });
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  async function handleGoogleLogin() {
    if (!isClerkLoaded) return;
    setGoogleLoading(true);
    try {
      // If already signed in with Clerk (e.g. from a previous failed attempt),
      // directly get the token and call our backend
      if (isSignedIn) {
        const clerkToken = await getToken();
        if (clerkToken) {
          const result = await dispatch(googleLogin({ clerkToken })).unwrap();
          await signOut();
          if (result.success) {
            if (result.user?.role === "admin") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/choose-experience", { replace: true });
            }
            return;
          }
        }
        // If that didn't work, sign out of Clerk and retry fresh
        await signOut();
      }

      // Start fresh Google OAuth redirect
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/google-complete",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
      setGoogleLoading(false);
      // Clean up Clerk session on failure
      try {
        await signOut();
      } catch (_) {}
      toast({
        title: "Google sign-in failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👋</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-gray-600">Sign in to continue shopping</p>
      </div>

      {/* Google Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading || !isClerkLoaded}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        {googleLoading ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        ) : (
          <GoogleIcon />
        )}
        {googleLoading ? "Signing in..." : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-400 font-medium">
            or sign in with email
          </span>
        </div>
      </div>

      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign In"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />

      <div className="text-center">
        <p className="text-gray-600">
          Don't have an account?
          <Link
            className="font-medium ml-2 text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            to="/auth/register"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthLogin;
