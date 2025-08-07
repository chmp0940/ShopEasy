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
        className="mt-5 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
      >
        Upload
      </Button>
      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((item) => (
              <div className="relative">
                <img
                  src={item?.image}
                  className="w-full h-[350px] object-cover rounded-t-lg "
                />
              </div>
            ))
          : ""}
      </div>
    </div>
  );
}

export default AdminDashboard;
