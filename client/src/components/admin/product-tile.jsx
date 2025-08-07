import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";

function AdminProductTile({
  product,
  setFormData,
  setCurrentEditedId,
  setOpenCreateProductsDialog,
  handleDelete,
}) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <div>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[350px] object-cover rounded-t-lg "
          />
        </div>
        <CardContent>
          <h2 className="text-xl font-bold mb-2 mt-2">{product?.title}</h2>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                product.salePrice > 0 ? "line-through" : ""
              }  text-lg font-semibold text-primary`}
            >
              ${product?.price}
            </span>
            {product.salePrice > 0 ? (
              <span className="text-lg font-bold">${product?.salePrice}</span>
            ) : null}
          </div>
        </CardContent>
      </div>
      <CardFooter className="flex items-center justify-between gap-2">
        <Button
          onClick={() => {
            setOpenCreateProductsDialog(true);
            setCurrentEditedId(product?._id);
            console.log(product);
            setFormData(product);
          }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Edit
        </Button>

        <Button
          onClick={() => handleDelete(product?._id)}
          className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AdminProductTile;
