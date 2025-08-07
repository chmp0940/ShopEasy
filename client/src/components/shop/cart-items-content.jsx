import React from "react";
import { Button } from "../ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCartItems,
  fetchCartItems,
  updateCartQuantity,
} from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";

function UserCartItemsContent({ cartItem }) {
  // console.log(cartItems);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );

  // console.log(productList);

  function handleCartItemDelete(getCartItem) {
    // console.log(getCartItem);

    dispatch(
      deleteCartItems({ userId: user?.id, productId: getCartItem?.productId })
    );
  }

  function handleUpdateQuantity(getCartItem, typeofAction) {
    // console.log(getCartItem);
    if (typeofAction == "plus") {
      let getCartItemsduplicate = cartItems.items || [];
      if (getCartItemsduplicate.length) {
        const indexOfCurrentItem = getCartItemsduplicate.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrrentProductIndex = productList.findIndex(
          (product) => product?._id === getCartItem?.productId
        );
        const getTotalStock = productList[getCurrrentProductIndex].totalStock;
        // console.log(getCurrrentProductIndex, getTotalStock);

        if (indexOfCurrentItem > -1) {
          const getQuantity =
            getCartItemsduplicate[indexOfCurrentItem].quantity;

          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getTotalStock} quantity can be added for this product`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeofAction == "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
      }
    });
  }

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        <div className="flex items-center mt-1 gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">decrease</span>
          </Button>
          <span className="semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          $
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-2 size={20}"
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
