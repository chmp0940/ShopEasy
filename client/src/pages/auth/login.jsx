import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from "@/store/auth-slice";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    console.log("submitted");

    event.preventDefault();
    dispatch(loginUser(formData)).then((data) => {
      // console.log(data);
      if (data?.payload?.success) {
        console.log(data.payload);
        // localStorage.setItem("user", JSON.stringify(data.payload.user));
        // localStorage.setItem("isAuthenticated", "true");
        toast({
          title: data?.payload?.message,
          className: "bg-green-500",
        });
        console.log(data.payload.user.role);
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
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
