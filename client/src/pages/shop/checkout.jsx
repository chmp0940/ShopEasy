import React, { useState } from "react";
import img from "../../assets/account-main.jpg";
import Address from "@/components/shop/address";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shop/cart-items-content";
import { Button } from "@/components/ui/button";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/hooks/use-toast";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const { approvalUrl } = useSelector((state) => state.shopOrder);
  const { toast } = useToast();
  const dispatch = useDispatch();
  console.log(currentSelectedAddress);
  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currenItem) =>
            sum +
            (currenItem?.salePrice > 0
              ? currenItem?.salePrice
              : currenItem.price) *
              currenItem?.quantity,
          0
        )
      : 0;

  function handleInitiatePaypalPayment() {
    if (cartItems.items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Please add products to proceed with checkout.",
        variant: "destructive",
      });
      return;
    }

    if (currentSelectedAddress === null) {
      toast({
        title: "Address required",
        description: "Please select a delivery address to continue.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem.productId,
        title: singleCartItem.title,
        image: singleCartItem.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem.salePrice
            : singleCartItem.price,
        quantity: singleCartItem.quantity,
      })),
      orderStatus: "pending",
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      paymentStatus: "pending",
      paymentMethod: "paypal",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };
    // console.log(orderData);
    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymentStart(true);
      } else {
        setIsPaymentStart(false);
      }
    });
  }

  if (approvalUrl) {
    window.location.href = approvalUrl;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[450px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedState={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4 ">
            <div className="flex justify-between ">
              <span className="font-bold">Total</span>
              <span className="font-bold">${totalCartAmount}</span>
            </div>
          </div>
          <div className="mt-7 w-full flex">
            <Button
              onClick={handleInitiatePaypalPayment}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              {isPaymentStart
                ? "Processing Paypal Payment......"
                : "   Checkout with Paypal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
