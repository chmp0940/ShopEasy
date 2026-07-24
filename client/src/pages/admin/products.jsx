import ProductImageUpload from "@/components/admin/image-upload";
import AdminProductTile from "@/components/admin/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { addProductFormElements } from "@/config";
import { useToast } from "@/hooks/use-toast";

import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/product-slice";
import {
  aiGenerateDescription,
  aiAutoTag,
  clearGeneratedDescription,
  clearAutoTag,
} from "@/store/shop/ai-slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);

  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.adminProducts);
  const { user } = useSelector((state) => state.auth);
  const { descriptionLoading, generatedDescription, autoTagLoading, autoTagResults } =
    useSelector((state) => state.shopAI);
  const { toast } = useToast();
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const isViewer = user?.role !== "admin";

  // Apply generated description when it comes back
  useEffect(() => {
    if (generatedDescription) {
      setFormData((prev) => ({ ...prev, description: generatedDescription }));
      dispatch(clearGeneratedDescription());
      toast({
        title: "✨ AI Description Generated!",
        description: "Review and edit as needed.",
        className: "bg-purple-500 text-white",
      });
    }
  }, [generatedDescription]);

  // Apply auto-tag results when they come back
  useEffect(() => {
    if (autoTagResults && !autoTagResults.error) {
      const updates = {};
      if (autoTagResults.category) updates.category = autoTagResults.category;
      if (
        autoTagResults.suggestedBrand &&
        autoTagResults.suggestedBrand !== "unknown"
      )
        updates.brand = autoTagResults.suggestedBrand;
      if (autoTagResults.description)
        updates.description = autoTagResults.description;
      if (autoTagResults.suggestedTitle && !formData.title)
        updates.title = autoTagResults.suggestedTitle;

      setFormData((prev) => ({ ...prev, ...updates }));
      dispatch(clearAutoTag());
      toast({
        title: "🏷️ AI Auto-Tag Complete!",
        description: "Category, brand, and description suggested. Review and edit.",
        className: "bg-purple-500 text-white",
      });
    }
  }, [autoTagResults]);

  function handleGenerateDescription() {
    if (!formData.title || !formData.category || !formData.brand) {
      toast({
        title: "Fill in title, category, and brand first",
        variant: "destructive",
      });
      return;
    }
    dispatch(
      aiGenerateDescription({
        title: formData.title,
        category: formData.category,
        brand: formData.brand,
        price: formData.price,
      })
    );
  }

  function handleAutoTag() {
    if (!uploadedImageUrl) {
      toast({
        title: "Upload an image first",
        variant: "destructive",
      });
      return;
    }
    dispatch(aiAutoTag(uploadedImageUrl));
  }

  function onSubmit(event) {
    event.preventDefault();
    currentEditedId != null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          })
        ).then((data) => {
          console.log(data);
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            toast({
              title: "Product Edited Succesfully",
              className: "bg-green-400",
            });
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          console.log(data);
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
            toast({
              title: "Product added Succesfully",
              className: "bg-green-400",
            });
          }
        });
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  console.log(productList, uploadedImageUrl);
  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }
  function handleDelete(getCurrentProductId) {
    console.log(getCurrentProductId);
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }
  console.log(formData);

  return (
    <>
      <div className="mb-5 flex justify-end w-full">
        <Button
          onClick={() => {
            setOpenCreateProductsDialog(true);
            if (isViewer) {
              toast({
                title: "👁 View Only Mode",
                description: "You can only view this form. Editing is not allowed.",
                className: "bg-violet-500 text-white",
              });
            }
          }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          Add new Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                setFormData={setFormData}
                product={productItem}
                handleDelete={handleDelete}
                isViewer={isViewer}
              />
            ))
          : null}
      </div>
      {/* // Product List rahegi yaha pe  */}
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setCurrentEditedId(null);
          setFormData(initialFormData);
          // actually whats happening is that when edit is click then it will show its current items right but when we click the add new button the same thigns get there also as we didn't reset the form so therefore this two are used
          setOpenCreateProductsDialog(false);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle className="text-violet-800">
              {currentEditedId != null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>

          {/* Viewer banner inside sheet */}
          {isViewer && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200 text-violet-700 text-sm">
              <span>🔒</span>
              <span>View only — You can see the form but cannot make changes.</span>
            </div>
          )}

          <div className={isViewer ? "opacity-50 pointer-events-none" : ""}>
            <ProductImageUpload
              imageFile={imageFile}
              setImageFile={setImageFile}
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              setImageLoadingState={setImageLoadingState}
              imageLoadingState={imageLoadingState}
              isEditMode={currentEditedId !== null}
            />

            {/* AI Auto-Tag Button — shown after image upload */}
            {uploadedImageUrl && currentEditedId === null && (
              <button
                onClick={handleAutoTag}
                disabled={autoTagLoading || isViewer}
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  background: autoTagLoading
                    ? "#f3f4f6"
                    : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))",
                  color: "#6366f1",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: autoTagLoading || isViewer ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {autoTagLoading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px",
                        height: "14px",
                        border: "2px solid #a855f7",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    AI Analyzing Image...
                  </>
                ) : (
                  "🏷️ AI Auto-Fill (Category, Brand, Description)"
                )}
              </button>
            )}

            <div className="py-6">
              {/* AI Description Generator Button */}
              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={handleGenerateDescription}
                  disabled={
                    descriptionLoading ||
                    !formData.title ||
                    !formData.category ||
                    !formData.brand ||
                    isViewer
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    background: descriptionLoading
                      ? "#f3f4f6"
                      : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))",
                    color:
                      !formData.title || !formData.category || !formData.brand
                        ? "#9ca3af"
                        : "#6366f1",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor:
                      descriptionLoading ||
                      !formData.title ||
                      !formData.category ||
                      !formData.brand ||
                      isViewer
                        ? "not-allowed"
                        : "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {descriptionLoading ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: "14px",
                          height: "14px",
                          border: "2px solid #a855f7",
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Generating...
                    </>
                  ) : (
                    "✨ Generate Description with AI"
                  )}
                </button>
                {(!formData.title || !formData.category || !formData.brand) && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af",
                      marginTop: "4px",
                      textAlign: "center",
                    }}
                  >
                    Fill title, category & brand first
                  </p>
                )}
              </div>

              <CommonForm
                onSubmit={onSubmit}
                formData={formData}
                setFormData={setFormData}
                buttonText={currentEditedId !== null ? "Edit" : "Add"}
                formControls={addProductFormElements}
                isBtnDisabled={!isFormValid()}
              />
            </div>
          </div>

          {/* CSS for spinner */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AdminProducts;
