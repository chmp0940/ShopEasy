import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { useNavigate } from "react-router-dom";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  return (
    <Card className="p-10">
      <CardHeader className="p-0">
        <CardTitle className="text-4xl">
          Payment is Successfull .... 🎉🎉
        </CardTitle>
      </CardHeader>
      <Button
        className="mt-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        onClick={() => navigate("/shop/account")}
      >
        View Orders
      </Button>
    </Card>
  );
}

export default PaymentSuccessPage;
