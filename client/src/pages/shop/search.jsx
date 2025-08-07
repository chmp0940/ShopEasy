import ShoppingProductTile from "@/components/shop/productile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { Heading1 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ProductDetailsDialog from "./product-details";
import { fetchProductDetails } from "@/store/shop/products-slice";
import loadinggif from "../../assets/loading.gif";
import { Skeleton } from "@/components/ui/skeleton";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchResults, isLoading } = useSelector((state) => state.shopSearch);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );

  useEffect(() => {
    if (keyword && keyword.trim() !== "" && keyword.trim().length > 3) {
      setTimeout(() => {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
      }, 1000);
    } else {
      setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
      dispatch(resetSearchResults());
    }
  }, [keyword]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];
    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;

        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this product`,
            variant: "destructive",
          });

          return;
        }
      }
    }

    console.log(getCurrentProductId);

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success === true) {
        dispatch(fetchCartItems(user?.id));
      }
    });
  }
  function handleGetProductDetails(getCurrentProductId) {
    // console.log(getCurrentProductId);
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  console.log(searchResults);

  return (
    <div className="container mx-auto md:px-6 px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="w-full flex items-center">
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="py-6"
            placeholder="Search Products ..."
          />
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>

                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>

                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {!searchResults.length && keyword.trim().length > 3 ? (
            <div className="flex justify-center py-16">
              <h1 className="text-5xl font-extrabold text-gray-500">
                No Results Found!
              </h1>
            </div>
          ) : null}

          {/* Results Grid */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {searchResults.map((item) => (
                <ShoppingProductTile
                  key={item._id}
                  product={item}
                  handleAddtoCart={handleAddtoCart}
                  handleGetProductDetails={handleGetProductDetails}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}
export default SearchProducts;
