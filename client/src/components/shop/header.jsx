import { Store, LogOut, Menu, ShoppingCart, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";

function MenuItems() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" && getCurrentMenuItem.id !== "products"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(getCurrentMenuItem.path);

    window.location.reload();
  }
  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row ">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group"
          key={menuItem.id}
        >
          {menuItem.label}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const { cartItems } = useSelector((state) => state.shopCart);
  function handleLogout() {
    dispatch(logoutUser());
  }
  useEffect(() => {
    if (user && user?._id) {
      dispatch(fetchCartItems(user?._id));
    }
  }, [dispatch, user]);

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button
          onClick={() => setOpenCartSheet(true)}
          variant="outline"
          size="icon"
          className="relative bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
            {cartItems?.items?.length || 0}
          </span>
        </Button>
        <UserCartWrapper
          cartItems={
            cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items
              : []
          }
          setOpenCartSheet={setOpenCartSheet}
        />
      </Sheet>
      <span className="sr-only">User Cart</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="bg-white hover:bg-blue-50 transition-all duration-200 cursor-pointer ring-2 ring-transparent hover:ring-blue-200 shadow-sm hover:shadow-md border border-gray-200">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-orange-400 text-white font-extrabold">
              {user?.userName[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" className="w-56">
          <DropdownMenuLabel>Logged In as {user.userName} </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/shop/account")}>
            <User className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ShoppingHeader() {
  const { user } = useSelector((state) => state.auth);
  console.log(user);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-orange-100 via-blue-100 to-yellow-100 shadow-md backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          to="/shop/home"
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
        >
          <Store className="h-7 w-7 text-orange-600" />
          <span className="font-bold text-xl bg-gradient-to-r from-orange-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
            ShopEasy
          </span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full max-w-xs bg-gradient-to-b from-orange-100 to-blue-100"
          >
            <MenuItems />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block ">
          <MenuItems />
        </div>
        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;
