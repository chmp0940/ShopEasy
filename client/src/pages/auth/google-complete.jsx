import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import { googleLogin } from "@/store/auth-slice";
import { useNavigate } from "react-router-dom";

// After Clerk processes the Google OAuth callback, this page:
// 1. Gets the Clerk session token
// 2. Sends it to our backend for verification & JWT issuance
// 3. Signs out of Clerk (we use our own JWT system)
// 4. Redirects to the app
function GoogleComplete() {
  const { getToken, signOut, isSignedIn } = useAuth();
  const { isLoaded } = useUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    console.log("[GoogleComplete] isLoaded:", isLoaded, "isSignedIn:", isSignedIn, "processed:", processedRef.current);

    // Wait for Clerk to load
    if (!isLoaded) return;

    // Don't process twice
    if (processedRef.current) return;
    processedRef.current = true;

    // If not signed in with Clerk, go back to login
    if (!isSignedIn) {
      console.log("[GoogleComplete] Not signed in with Clerk, redirecting to login");
      navigate("/auth/login", { replace: true });
      return;
    }

    const processGoogleAuth = async () => {
      try {
        console.log("[GoogleComplete] Getting Clerk token...");
        // Get Clerk session token
        const clerkToken = await getToken();
        console.log("[GoogleComplete] Got token:", clerkToken ? "yes (length: " + clerkToken.length + ")" : "null");

        if (!clerkToken) {
          console.error("[GoogleComplete] No Clerk token available");
          await signOut();
          navigate("/auth/login", { replace: true });
          return;
        }

        // Send to our backend — backend verifies token, creates/finds user, returns JWT
        console.log("[GoogleComplete] Calling backend /api/auth/google-login...");
        const result = await dispatch(googleLogin({ clerkToken })).unwrap();
        console.log("[GoogleComplete] Backend result:", result);

        // Done with Clerk — sign out (we use our own JWT from here)
        try {
          await signOut();
        } catch (_) {
          // Ignore signout errors — not critical
        }

        if (result.success) {
          console.log("[GoogleComplete] Success! Navigating to app...");
          // Redux state is now updated with isAuthenticated=true, token in sessionStorage
          if (result.user?.role === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/choose-experience", { replace: true });
          }
        } else {
          console.log("[GoogleComplete] Backend returned failure:", result);
          navigate("/auth/login", { replace: true });
        }
      } catch (error) {
        console.error("[GoogleComplete] Google auth processing failed:", error);
        // Clean up Clerk session
        try {
          await signOut();
        } catch (_) {}
        navigate("/auth/login", { replace: true });
      }
    };

    processGoogleAuth();
  }, [isLoaded, isSignedIn]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 font-medium">
          Completing Google sign-in...
        </p>
        <p className="text-gray-400 text-sm">Just a moment</p>
      </div>
    </div>
  );
}

export default GoogleComplete;
