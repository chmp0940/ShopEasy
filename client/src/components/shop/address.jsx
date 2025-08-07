import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import CommonForm from "../common/form";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  editAddress,
  fetchAllAddress,
} from "@/store/shop/address-slice";
import AddressCart from "./address-cart";
import { useToast } from "@/hooks/use-toast";

const initialAddressFormData = {
  address: "",
  city: "",
  phone: "",
  pincode: "",
  notes: "",
};

function Address({ setCurrentSelectedState, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const { toast } = useToast();

  // console.log(addressList);

  // console.log(user?.id);
  console.log(setCurrentSelectedState);

  function handleManageAddress(event) {
    event.preventDefault();
    // console.log(user?.id);

    if (currentEditedId !== null) {
      dispatch(
        editAddress({ formData, userId: user?.id, addressId: currentEditedId })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddress(user?.id));
          setFormData(initialAddressFormData);
          setCurrentEditedId(null);
          toast({
            title: "Success",
            description: "Address updated successfully!",
            className: "bg-green-400",
          });
        }
      });
    } else {
      if (addressList.length >= 3) {
        toast({
          title: "Address Limit Reached",
          description: "You can only add up to 3 addresses",
          variant: "destructive",
        });
        return;
      }
      dispatch(
        addNewAddress({
          ...formData,
          userId: user?.id,
        })
      ).then((data) => {
        // console.log(data);
        if (data?.payload?.success) {
          dispatch(fetchAllAddress(user?.id));
          setFormData(initialAddressFormData);
          toast({
            title: "Success",
            description: "Address added successfully!",
          });
        }
      });
    }
  }
  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }
  useEffect(() => {
    dispatch(fetchAllAddress(user?.id));
  }, [dispatch, user?.id]);

  return (
    <Card className="bg-gradient-to-br from-blue-50 via-orange-50 to-yellow-50 border border-blue-200 shadow-xl">
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {addressList && addressList.length > 0 ? (
          addressList.map((addresssItem) => (
            <div
              key={addresssItem._id}
              className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-100 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <AddressCart
                selectedId={selectedId}
                addressInfo={addresssItem}
                setFormData={setFormData}
                setCurrentEditedId={setCurrentEditedId}
                setCurrentSelectedState={setCurrentSelectedState}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white/60 rounded-xl border border-blue-100">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-500">Add your first address below!</p>
          </div>
        )}
      </div>
      <CardHeader className="bg-white/80 backdrop-blur-sm rounded-t-xl border-b border-blue-100 shadow-sm">
        <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
          {currentEditedId !== null ? "Edit the Address" : "Add New Address"}
        </h2>
      </CardHeader>
      <CardContent className="space-y-3 bg-white/80 backdrop-blur-sm rounded-b-xl p-6">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={
            currentEditedId !== null ? "Update Address" : "Add Address"
          }
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
}

export default Address;
