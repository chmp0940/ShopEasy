import React, { useEffect } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import UserCartItemsContent from "./cart-items-content";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currenItem) =>
            sum +
            (currenItem?.salePrice > 0
              ? currenItem?.salePrice
              : currenItem.price) *
              currenItem?.quantity,
          0
        )
      : 0;

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch, user?.id]);

  return (
    <SheetContent className="sm:max-w-md bg-gradient-to-br from-blue-50 via-orange-50 to-yellow-50 border-l border-blue-200">
      <SheetHeader className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-blue-100 mb-6">
        <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
          Your Cart
        </SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4 max-h-[60vh] overflow-y-auto">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow duration-200"
            >
              <UserCartItemsContent cartItem={item} />
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white/60 rounded-xl border border-blue-100">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500">Add some products to get started!</p>
          </div>
        )}
      </div>
      <div className="mt-8 space-y-4">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-100">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ${totalCartAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <Button
        className="w-full mt-4  bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          if (cartItems && cartItems.length > 0) {
            navigate("/shop/checkout");
            setOpenCartSheet(false);
            toast({
              title: "Proceeding to checkout",
              description: "Please complete your order details.",
              className: "bg-blue-500 text-white",
            });
          }
        }}
        disabled={!cartItems || cartItems.length === 0}
      >
        {cartItems && cartItems.length > 0
          ? "Proceed to Checkout"
          : "Cart is Empty"}
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
