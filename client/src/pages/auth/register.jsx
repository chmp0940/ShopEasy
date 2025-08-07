import CommonForm from "@/components/common/form";
import { registerFormControls } from "@/config";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "@/store/auth-slice";

import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const { toast } = useToast();

  /*
  dispatch is used in Redux to send actions to the Redux store.
When you call dispatch(action), you are telling Redux to update the state based on that action.

Why is dispatch used?
To trigger state changes in the Redux store.
To run reducers or async thunks (like API calls).
To notify all parts of your app that the state has changed.
  */
  const navigate = useNavigate();
  function onSubmit(event) {
    event.preventDefault();
    // console.log('submited')
    dispatch(registerUser(formData)).then((data) => {
      // console.log(data)
      if (data?.payload?.success) {
        console.log(data);
        // localStorage.setItem("user", JSON.stringify(data.payload.user));
        // localStorage.setItem("isAuthenticated", "true");
        toast({
          description: data.payload.message,
          className: "bg-green-500",
        });
        navigate("/auth/login");
      } else {
        console.log(data.payload?.message);
        console.log(data.error?.message);

        toast({
          description:
            data.payload?.message ||
            data.error?.message ||
            "Registration failed",
          variant: "destructive",
        });
        navigate("/auth/login");
      }
    });
  }
  // console.log(formData);

  return (
    <div className="mx-auto w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚀</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Join ShopEasy</h1>
        <p className="text-gray-600">Create your account to start shopping</p>
      </div>

      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?
          <Link
            className="font-medium ml-2 text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
            to="/auth/login"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AuthRegister;
