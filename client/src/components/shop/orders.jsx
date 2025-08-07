import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import ShoppingOrderDetails from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrderByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";

function ShoppingOrders() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  console.log(orderDetails);

  useEffect(() => {
    dispatch(getAllOrderByUserId(user?.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetails(getId));
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {orderList && orderList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="font-medium">Order ID</TableHead>
                <TableHead className="font-medium">Order Date</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Total</TableHead>
                <TableHead className="font-medium">
                  <span className="sr-only">Details</span>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList.map((orderItem, index) => {
                return (
                  <TableRow
                    key={orderItem?._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm text-gray-600">
                      {orderItem?._id}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {orderItem?.orderDate.split("T")[0]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`py-1 px-3 text-white ${
                          orderItem?.orderStatus === "confirmed"
                            ? "bg-green-600"
                            : orderItem?.orderStatus === "rejected"
                            ? "bg-red-600"
                            : orderItem?.orderStatus === "inProcess"
                            ? "bg-yellow-600"
                            : "bg-gray-600"
                        }`}
                      >
                        {orderItem?.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-800">
                      ${orderItem?.totalAmount}
                    </TableCell>
                    <TableCell>
                      <Dialog
                        open={openDetailsDialog}
                        onOpenChange={() => {
                          setOpenDetailsDialog(false);
                          dispatch(resetOrderDetails());
                        }}
                      >
                        <Button
                          onClick={() =>
                            handleFetchOrderDetails(orderItem?._id)
                          }
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          View Details
                        </Button>
                        <ShoppingOrderDetails orderDetails={orderDetails} />
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
            <p>Start shopping to see your orders here!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
