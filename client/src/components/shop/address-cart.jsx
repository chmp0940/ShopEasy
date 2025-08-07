import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAddress,
  editAddress,
  fetchAllAddress,
} from "@/store/shop/address-slice";

function AddressCart({
  addressInfo,
  setFormData,
  setCurrentEditedId,
  setCurrentSelectedState,
  selectedId,
}) {
  console.log(selectedId);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  function handleDeleteAddress(addressItemDelete) {
    // console.log(addressItemDelete);
    // console.log(addressItemDelete?.userId, addressItemDelete?._id);

    dispatch(
      deleteAddress({
        userId: addressItemDelete?.userId,
        addressId: addressItemDelete?._id,
      })
    ).then((data) => {
      // console.log(data);

      dispatch(fetchAllAddress(user?.id));
    });
  }

  function handleEditAddress(addressItemEdit) {
    // console.log(addressInfo);
    setFormData({
      address: addressItemEdit?.address || "",
      city: addressItemEdit?.city || "",
      phone: addressItemEdit?.phone || "",
      pincode: addressItemEdit?.pincode || "",
      notes: addressItemEdit?.notes || "",
    });
    setCurrentEditedId(addressItemEdit?._id);
  }

  return (
    <Card
      onClick={
        setCurrentSelectedState
          ? () => {
              setCurrentSelectedState(addressInfo);
            }
          : null
      }
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        selectedId?._id === addressInfo?._id
          ? "border-green-500 border-2 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg scale-105"
          : "border-blue-200 hover:border-blue-300 bg-white/90 hover:bg-gradient-to-br hover:from-blue-50 hover:to-orange-50"
      }`}
    >
      <CardContent className="grid gap-3 p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              📍
            </span>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Address
              </Label>
              <p className="text-gray-800 font-medium">
                {addressInfo?.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              🏙️
            </span>
            <div>
              <Label className="text-sm font-medium text-gray-600">City</Label>
              <p className="text-gray-800 font-medium">{addressInfo?.city}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
              📮
            </span>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Pincode
              </Label>
              <p className="text-gray-800 font-medium">
                {addressInfo?.pincode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              📞
            </span>
            <div>
              <Label className="text-sm font-medium text-gray-600">Phone</Label>
              <p className="text-gray-800 font-medium">{addressInfo?.phone}</p>
            </div>
          </div>

          {addressInfo?.notes && (
            <div className="flex items-start gap-2">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                📝
              </span>
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Notes
                </Label>
                <p className="text-gray-800 font-medium">
                  {addressInfo?.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {selectedId?._id === addressInfo?._id && (
          <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium flex items-center gap-2">
              ✅ Selected for delivery
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-between gap-3 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200">
        <Button
          onClick={() => handleEditAddress(addressInfo)}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </Button>
        <Button
          onClick={() => handleDeleteAddress(addressInfo)}
          className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCart;
