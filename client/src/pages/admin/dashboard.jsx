import ProductImageUpload from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImage } from "@/store/common-slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);
  const isViewer = user?.role !== "admin";

  // console.log(uploadedImageUrl);
  function handleUploadFeatureImage() {
    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImage());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }
  useEffect(() => {
    dispatch(getFeatureImage());
  }, [dispatch]);

  // console.log(featureImageList);

  return (
    <div>
      <div className={`${isViewer ? "relative group" : ""}`}>
        <div className={isViewer ? "opacity-50 pointer-events-none" : ""}>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isCustomStyling={true}
            // isEditMode={currentEditedId !== null}
          />
          <Button
            onClick={handleUploadFeatureImage}
            disabled={isViewer}
            className={`mt-5 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium py-3 rounded-lg shadow-md transition-all duration-300 ${
              isViewer
                ? "cursor-not-allowed"
                : "hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:scale-105"
            }`}
          >
            Upload
          </Button>
        </div>
        {isViewer && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block text-sm bg-gray-800 text-white px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-lg">
            🔒 View only — Upload not allowed
          </span>
        )}
      </div>
      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((item) => (
              <div className="relative">
                <img
                  src={item?.image}
                  className="w-full h-[350px] object-cover rounded-t-lg "
                  loading="lazy"
                />
              </div>
            ))
          : ""}
      </div>
    </div>
  );
}

export default AdminDashboard;
