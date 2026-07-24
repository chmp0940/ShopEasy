import ProductImageUpload from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImage } from "@/store/common-slice";
import { aiGetSalesInsights } from "@/store/shop/ai-slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { user } = useSelector((state) => state.auth);
  const { salesInsights, salesInsightsLoading } = useSelector(
    (state) => state.shopAI
  );
  const isViewer = user?.role !== "admin";

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

  const stats = salesInsights?.stats;
  const aiInsights = salesInsights?.aiInsights;

  // Stat card component
  const StatCard = ({ icon, label, value, color, gradient }) => (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid #f3f4f6",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "14px",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500, margin: 0 }}>
          {label}
        </p>
        <p
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#111827",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div>
      {/* ═══════════════════════════════════════════════ */}
      {/* AI Sales Intelligence Section */}
      {/* ═══════════════════════════════════════════════ */}
      <div
        style={{
          marginBottom: "32px",
          padding: "24px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.03), rgba(168,85,247,0.03))",
          borderRadius: "20px",
          border: "1px solid rgba(139, 92, 246, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              📊
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI Sales Intelligence
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
                Powered by Google Gemini
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(aiGetSalesInsights())}
            disabled={salesInsightsLoading}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              background: salesInsightsLoading
                ? "#f3f4f6"
                : "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))",
              color: "#6366f1",
              fontSize: "13px",
              fontWeight: 600,
              cursor: salesInsightsLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.3s",
            }}
          >
            {salesInsightsLoading ? (
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
                Analyzing...
              </>
            ) : (
              "🔄 Refresh Insights"
            )}
          </button>
        </div>

        {salesInsightsLoading && !salesInsights ? (
          /* Loading Skeleton */
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    height: "90px",
                    borderRadius: "16px",
                    background: "#f3f4f6",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
            <div
              style={{
                height: "200px",
                borderRadius: "16px",
                background: "#f3f4f6",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <StatCard
                icon="💰"
                label="Total Revenue"
                value={`$${stats.totalRevenue?.toLocaleString()}`}
                gradient="linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))"
              />
              <StatCard
                icon="📦"
                label="Total Orders"
                value={stats.totalOrders}
                gradient="linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))"
              />
              <StatCard
                icon="📈"
                label="Avg Order Value"
                value={`$${stats.avgOrderValue}`}
                gradient="linear-gradient(135deg, rgba(245,158,11,0.15), rgba(234,88,12,0.15))"
              />
              <StatCard
                icon="🛍️"
                label="Total Products"
                value={stats.totalProducts}
                gradient="linear-gradient(135deg, rgba(236,72,153,0.15), rgba(219,39,119,0.15))"
              />
            </div>

            {/* Two Column Layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Top Products */}
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  border: "1px solid #f3f4f6",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  🏆 Top Products
                </h3>
                {stats.topProducts && stats.topProducts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {stats.topProducts.map((product, index) => {
                      const maxSales = stats.topProducts[0]?.sales || 1;
                      const percentage = (product.sales / maxSales) * 100;
                      const colors = [
                        "linear-gradient(90deg, #6366f1, #a855f7)",
                        "linear-gradient(90deg, #8b5cf6, #c084fc)",
                        "linear-gradient(90deg, #a78bfa, #d8b4fe)",
                        "linear-gradient(90deg, #c4b5fd, #e9d5ff)",
                        "linear-gradient(90deg, #ddd6fe, #f3e8ff)",
                      ];
                      return (
                        <div key={index}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#4b5563",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "70%",
                              }}
                            >
                              {product.name}
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#6366f1",
                              }}
                            >
                              {product.sales} sold
                            </span>
                          </div>
                          <div
                            style={{
                              height: "8px",
                              borderRadius: "4px",
                              background: "#f3f4f6",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${percentage}%`,
                                borderRadius: "4px",
                                background: colors[index] || colors[4],
                                transition: "width 1s ease-out",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: "13px", color: "#9ca3af", textAlign: "center" }}>
                    No sales data yet
                  </p>
                )}
              </div>

              {/* Low Stock Alerts */}
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  border: "1px solid #f3f4f6",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ⚠️ Low Stock Alerts
                </h3>
                {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {stats.lowStockProducts.map((product, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          background:
                            product.stock === 0
                              ? "rgba(239,68,68,0.08)"
                              : "rgba(245,158,11,0.08)",
                          border: `1px solid ${product.stock === 0 ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#4b5563",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "70%",
                          }}
                        >
                          {product.title}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: product.stock === 0 ? "#ef4444" : "#f59e0b",
                            padding: "2px 8px",
                            borderRadius: "8px",
                            background:
                              product.stock === 0
                                ? "rgba(239,68,68,0.1)"
                                : "rgba(245,158,11,0.1)",
                          }}
                        >
                          {product.stock === 0 ? "OUT" : `${product.stock} left`}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#10b981",
                      textAlign: "center",
                      fontWeight: 500,
                    }}
                  >
                    ✅ All products well stocked!
                  </p>
                )}
              </div>
            </div>

            {/* AI Insights Panel */}
            {aiInsights && (
              <div
                style={{
                  marginTop: "16px",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.06))",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid rgba(139, 92, 246, 0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>✨</span>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #6366f1, #a855f7)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      margin: 0,
                    }}
                  >
                    AI Business Insights
                  </h3>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#4b5563",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  {aiInsights}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
            <p style={{ color: "#9ca3af", fontSize: "14px" }}>
              No insights available yet. Add some products and orders first!
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* Existing Feature Image Section */}
      {/* ═══════════════════════════════════════════════ */}
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
              <div className="relative" key={item?._id}>
                <img
                  src={item?.image}
                  className="w-full h-[350px] object-cover rounded-t-lg "
                  loading="lazy"
                />
              </div>
            ))
          : ""}
      </div>

      {/* CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
