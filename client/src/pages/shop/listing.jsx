import React, { useEffect, useState } from "react";
import ProductFilter from "./filter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDownIcon } from "lucide-react";
import { sortOptions } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shop/productile";
import { useSearchParams } from "react-router-dom";
import ProductDetailsDialog from "./product-details";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useToast } from "@/hooks/use-toast";

function createSearchParamsHelper(filterParams) {
  console.log(filterParams);

  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

// Skeleton Components
const ProductSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
    <Skeleton className="w-full h-48 mb-4 rounded-lg" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-2" />
    <Skeleton className="h-6 w-1/3 mb-3" />
    <Skeleton className="h-10 w-full rounded-md" />
  </div>
);

const FilterSkeleton = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 h-fit">
    <div className="p-6 border-b border-gray-200/50">
      <Skeleton className="h-6 w-20" />
    </div>
    <div className="p-6 space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
          {index < 2 && <Skeleton className="h-px w-full" />}
        </div>
      ))}
    </div>
  </div>
);
/*
it will work like this 
Step 1: Initialize
const queryParams = []; // Empty array

    Step 2: Object.entries() breakdown
    Object.entries({ category: ["men"] })
    Returns: [["category", ["men"]]]   

    Step 3: Loop iteration
    for (const [key, value] of [["category", ["men"]]]) {
      First iteration: key = "category", value = ["men"]
      
      Step 4: Check if valid array
  if (Array.isArray(["men"]) && ["men"].length > 0) { // true && true = true
    
      Step 5: Join array elements
    const paramValue = ["men"].join(","); // "men"
    
      Step 6: Create query parameter
    queryParams.push(`category=${encodeURIComponent("men")}`);
      queryParams = ["category=men"]
  }
}

    Step 7: Join all parameters
return ["category=men"].join("&"); // "category=men"


*/

function ShoppingListing() {
  const dispatch = useDispatch();
  const { productList, productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();

  // console.log(cartItems);

  /*



*/
  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters]);
  /*



*/
  function handleSort(value) {
    // console.log(value);
    setSort(value);
  }
  /*



*/

  // console.log(filters);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [setSort]);
  /*



*/

  //category,men
  //keyItems,option.id
  function handleFilter(getSectionId, getCurrentOption) {
    // console.log(getSectionId, getCurrentOption);
    console.log(filters);

    // If cpyFilters = { category: ["men"], brand: ["nike"] }
    // Object.keys(cpyFilters); // Returns: ["category", "brand"]
    let cpyFilters = { ...filters };
    const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);
    // If getSectionId = "category"
    // ["category", "brand"]
    //   .indexOf("category") // Returns: 0 (found at index 0)

    //   [
    // If getSectionId = "brand"
    //     ("category", "brand")
    //   ].indexOf("brand") // Returns: 1 (found at index 1)

    //   [
    //      If getSectionId = "price" (doesn't exist)
    //     ("category", "brand")
    //   ].indexOf("price"); // Returns: -1 (not found)

    // if it doesn't exist yet so add it
    if (indexOfCurrentSection === -1) {
      cpyFilters = {
        ...cpyFilters, // Keep all existing filters
        [getSectionId]: [getCurrentOption], // Add new section with current option
      };
    } else {
      const indexofCurrentOption =
        cpyFilters[getSectionId].indexOf(getCurrentOption);
      // we are here just toggling the options checked here

      if (indexofCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption); // if not then push it
      else cpyFilters[getSectionId].splice(indexofCurrentOption, 1); // to remove if we deslect it as it is was present prior
    }
    // console.log(cpyFilters);
    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }
  /*



  */

  useEffect(() => {
    if (filters !== null && sort != null)
      dispatch(
        fetchAllFilteredProducts({ filterParams: filters, sortParams: sort })
      );
  }, [dispatch, sort, filters]);

  // console.log(searchParams);
  /*



  */
  function handleGetProductDetails(getCurrentProductId) {
    // console.log(getCurrentProductId);
    dispatch(fetchProductDetails(getCurrentProductId));
  }
  // console.log(productDetails);
  /*
  
  
  */

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  /*
  
  
  */

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

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCartItems(user?.id));
    }
  }, [dispatch]);

  // console.log(productList);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-blue-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
          {isLoading ? (
            <FilterSkeleton />
          ) : (
            <ProductFilter filters={filters} handleFilter={handleFilter} />
          )}
          <div className="bg-white/80 backdrop-blur-sm w-full rounded-2xl shadow-xl border border-white/50">
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-orange-50 rounded-t-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  All Products
                </h2>
                <div className="flex items-center gap-6">
                  {isLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    <span className="text-gray-600 font-medium bg-white/70 px-3 py-1 rounded-full">
                      {productList?.length} Products Found
                    </span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 bg-white/90 hover:bg-white border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
                        disabled={isLoading}
                      >
                        <ArrowUpDownIcon className="h-4 w-4" />
                        <span>Sort by</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[200px] bg-white/95 backdrop-blur-sm border-gray-200/50"
                    >
                      <DropdownMenuRadioGroup
                        value={sort}
                        onValueChange={handleSort}
                      >
                        {sortOptions.map((sortItem) => (
                          <DropdownMenuRadioItem
                            value={sortItem.id}
                            key={sortItem.id}
                            className="hover:bg-blue-50 transition-colors duration-200"
                          >
                            {sortItem.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                  ))}
                </div>
              ) : productList && productList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productList.map((productItem) => (
                    <div
                      key={productItem?._id}
                      className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                    >
                      <ShoppingProductTile
                        handleGetProductDetails={handleGetProductDetails}
                        product={productItem}
                        handleAddtoCart={handleAddtoCart}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-r from-blue-100 to-orange-100 rounded-2xl p-12 max-w-md mx-auto">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      No Products Found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search criteria
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingListing;
