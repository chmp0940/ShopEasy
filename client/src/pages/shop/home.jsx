import React, { useEffect, useState } from "react";
import banner1 from "../../assets/banner-1.jpg";
import banner2 from "../../assets/banner-2.png";
import banner3 from "../../assets/banner-3.jpg";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import nikeIcon from "../../assets/nike.png";
import addidasIcon from "../../assets/addidas.png";
import hmICon from "../../assets/h&m.png";
import levisIcon from "../../assets/levis.png";
import pumaIcon from "../../assets/puma.png";
import zaraIcon from "../../assets/zara.png";
import {
  BabyIcon,
  BookHeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FootprintsIcon,
  ShirtIcon,
  WatchIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shop/productile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ProductDetailsDialog from "./product-details";
import { getFeatureImage } from "@/store/common-slice";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: BookHeartIcon },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: FootprintsIcon },
];

// Skeleton Components
const ProductSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-2">
    <CardContent className="p-4">
      <Skeleton className="w-full h-48 mb-4 rounded-lg" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-6 w-1/3 mb-3" />
      <Skeleton className="h-10 w-full rounded-md" />
    </CardContent>
  </Card>
);

const CategorySkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-2">
    <CardContent className="flex flex-col items-center justify-center p-8">
      <Skeleton className="w-16 h-16 mb-4 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </CardContent>
  </Card>
);

const BrandSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-2">
    <CardContent className="flex flex-col items-center justify-center p-8">
      <Skeleton className="w-16 h-16 mb-4 rounded-lg" />
      <Skeleton className="h-4 w-12" />
    </CardContent>
  </Card>
);

const HeroSkeleton = () => (
  <div className="relative w-full h-[650px] overflow-hidden bg-gray-200">
    <Skeleton className="w-full h-full" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center px-4 max-w-4xl">
        <Skeleton className="h-16 w-96 mx-auto mb-6" />
        <Skeleton className="h-8 w-80 mx-auto mb-8" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    </div>
  </div>
);

const brandWithIcon = [
  { id: "nike", label: "Nike", icon: nikeIcon },
  { id: "adidas", label: "Adidas", icon: addidasIcon },
  { id: "puma", label: "Puma", icon: pumaIcon },
  { id: "levi", label: "Levi's", icon: levisIcon },
  { id: "zara", label: "Zara", icon: zaraIcon },
  { id: "h&m", label: "H&M", icon: hmICon },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);
  const fallbackSlides = [banner1, banner2, banner3];
  const dispatch = useDispatch();
  const { productList, productDetails, isLoading } = useSelector(
    (state) => state.shopProducts
  );
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { featureImageList } = useSelector((state) => state.commonFeature);

  // Use dynamic slides array
  const slides =
    featureImageList?.length > 0
      ? featureImageList
      : fallbackSlides.map((img) => ({ image: img }));

  useEffect(() => {
    // Simulate initial loading for categories and brands
    const timer = setTimeout(() => {
      setCategoriesLoading(false);
      setBrandsLoading(false);
      setHeroLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    dispatch(getFeatureImage());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Reset slide when images change
  useEffect(() => {
    if (
      featureImageList?.length > 0 &&
      currentSlide >= featureImageList.length
    ) {
      setCurrentSlide(0);
    }
  }, [featureImageList, currentSlide]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  function handleNaviagateToListingPage(getCurrentItem, section) {
    console.log(getCurrentItem);

    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
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
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 via-blue-50 to-yellow-50">
      {heroLoading ? (
        <HeroSkeleton />
      ) : (
        <div className="relative w-full h-[650px] overflow-hidden">
          {slides && slides.length > 0
            ? slides.map((slide, index) => (
                <div
                  key={slide?.image || index}
                  className={`${
                    index === currentSlide
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105"
                  } absolute top-0 left-0 w-full h-full transition-all duration-1000 ease-in-out`}
                >
                  <img
                    src={slide?.image}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Enhanced overlay with multiple gradients */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Hero Content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-4 max-w-4xl">
                      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                        <span className="block bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent">
                          NEW ARRIVALS
                        </span>
                        <span className="block text-white mt-2">
                          JUST FOR YOU
                        </span>
                      </h1>
                      <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg font-medium">
                        Discover the latest fashion trends with up to{" "}
                        <span className="text-yellow-400 font-bold">
                          50% OFF
                        </span>
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                          onClick={() => navigate("/shop/listing")}
                        >
                          Shop Now
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="bg-white/90 hover:bg-white text-gray-800 border-2 border-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                          onClick={() => navigate("/shop/listing")}
                        >
                          Explore Collections
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : null}

          {/* Enhanced Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentSlide(
                (prevSlide) => (prevSlide - 1 + slides.length) % slides.length
              )
            }
            className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-md w-12 h-12 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
            }
            className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-md w-12 h-12 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125 shadow-lg"
                    : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* Floating elements for visual appeal */}
          <div className="absolute top-20 right-20 w-20 h-20 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-32 left-16 w-16 h-16 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full opacity-20 animate-bounce"></div>
        </div>
      )}
      <section className="py-20 bg-gradient-to-r from-blue-100 via-orange-100 to-yellow-100 mt-0">
        <div className="container mx-auto px-4 ">
          <h2 className="text-4xl font-bold text-center  mb-12 bg-gradient-to-r h-[6rem] from-blue-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categoriesLoading
              ? // Show skeleton loading for categories
                Array.from({ length: 5 }).map((_, index) => (
                  <CategorySkeleton key={index} />
                ))
              : // Show actual categories
                categoriesWithIcon.map((categoryItem) => (
                  <Card
                    key={categoryItem.id}
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-2 hover:border-blue-300"
                    onClick={() =>
                      handleNaviagateToListingPage(categoryItem, "category")
                    }
                  >
                    <CardContent className="flex flex-col items-center justify-center p-8">
                      <categoryItem.icon
                        className="w-16 h-16 mb-4 text-gradient-to-r from-blue-500 to-orange-500"
                        style={{ color: "#3b82f6" }}
                      />
                      <span className="font-bold text-gray-800">
                        {categoryItem.label}
                      </span>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-gradient-to-r from-yellow-100 via-blue-100 to-orange-100">
        <div className="container mx-auto px-4 ">
          <h2 className="text-4xl font-bold text-center h-[6rem] mb-12 bg-gradient-to-r from-yellow-600 via-blue-600 to-orange-600 bg-clip-text text-transparent">
            Shop by Brand
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brandsLoading
              ? // Show skeleton loading for brands
                Array.from({ length: 6 }).map((_, index) => (
                  <BrandSkeleton key={index} />
                ))
              : // Show actual brands
                brandWithIcon.map((brandItem) => (
                  <Card
                    key={brandItem.id}
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-2 hover:border-orange-300"
                    onClick={() =>
                      handleNaviagateToListingPage(brandItem, "brand")
                    }
                  >
                    <CardContent className="flex flex-col items-center justify-center p-8">
                      <img
                        src={brandItem.icon}
                        alt={brandItem.label}
                        className="w-16 h-16 mb-4 object-contain filter hover:brightness-110 transition-all duration-300"
                      />
                      <span className="font-bold text-gray-800">
                        {brandItem.label}
                      </span>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-orange-50 to-blue-50">
        <div className="container mx-auto px-4 ">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-orange-600 via-blue-600 to-yellow-600 bg-clip-text text-transparent">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {isLoading ? (
              // Show skeleton loading state
              Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="transform hover:scale-105 transition-all duration-300"
                >
                  <ProductSkeleton />
                </div>
              ))
            ) : // Show actual products
            productList && productList.length > 0 ? (
              productList.map((productItem) => (
                <div
                  key={productItem._id}
                  className="transform hover:scale-105 transition-all duration-300"
                >
                  <ShoppingProductTile
                    product={productItem}
                    handleGetProductDetails={handleGetProductDetails}
                    handleAddtoCart={handleAddtoCart}
                  />
                </div>
              ))
            ) : (
              // Show empty state
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No products available</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
