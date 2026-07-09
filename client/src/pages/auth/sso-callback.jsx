import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

// This page handles the OAuth redirect from Google → Clerk
// It processes the authentication response and then redirects to /auth/google-complete
function SSOCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-600 font-medium">Authenticating with Google...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}

export default SSOCallback;
