import React from "react";
import accountBanner from "../../assets/account-banner.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shop/address";
import ShoppingOrders from "@/components/shop/orders";

function ShoppingAccount() {
  return (
    <div className="flex flex-col ">
      <div className="relative h-[400px] w-full overflow-hidden">
        <img
          src={accountBanner}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="container mx-auto grid-cols-1 gap-8 py-8 ">
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>
            <TabsContent value="orders">
              <ShoppingOrders />
            </TabsContent>
            <TabsContent value="address">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
