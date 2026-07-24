import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendChatMessage, addUserMessage, clearChat } from "@/store/shop/ai-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const dispatch = useDispatch();
  const { chatMessages, chatLoading } = useSelector((state) => state.shopAI);
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, chatLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  function handleSend() {
    if (!input.trim() || chatLoading) return;

    const userMessage = input.trim();
    setInput("");

    dispatch(addUserMessage(userMessage));

    const history = chatMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    dispatch(sendChatMessage({ message: userMessage, history }));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleQuickAction(text) {
    setInput(text);
    setTimeout(() => {
      dispatch(addUserMessage(text));
      const history = chatMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      dispatch(sendChatMessage({ message: text, history }));
    }, 100);
  }

  function handleProductClick(productId) {
    dispatch(fetchProductDetails(productId));
  }

  function handleAddToCart(productId) {
    if (!user?.id) {
      toast({ title: "Please login to add items to cart", variant: "destructive" });
      return;
    }
    dispatch(addToCart({ userId: user.id, productId, quantity: 1 })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user.id));
        toast({ title: "Added to cart! 🛒", className: "bg-green-500 text-white" });
      }
    });
  }

  const quickSuggestions = [
    "Show me deals 🏷️",
    "Nike products 👟",
    "Under $50 💰",
    "What's trending? 🔥",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        id="ai-chatbot-toggle"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
          zIndex: 9999,
          transition: "all 0.3s ease",
          transform: isOpen ? "scale(0.9) rotate(90deg)" : "scale(1)",
        }}
        onMouseEnter={(e) => (e.target.style.transform = isOpen ? "scale(0.95) rotate(90deg)" : "scale(1.1)")}
        onMouseLeave={(e) => (e.target.style.transform = isOpen ? "scale(0.9) rotate(90deg)" : "scale(1)")}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="rgba(255,255,255,0.3)" stroke="white" />
          </svg>
        )}
      </button>

      {/* Pulse animation ring */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "2px solid rgba(139, 92, 246, 0.5)",
            zIndex: 9998,
            animation: "chatbotPulse 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          id="ai-chatbot-panel"
          style={{
            position: "fixed",
            bottom: "96px",
            right: "24px",
            width: "380px",
            maxWidth: "calc(100vw - 48px)",
            height: "520px",
            maxHeight: "calc(100vh - 140px)",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 40px rgba(139, 92, 246, 0.1)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "chatSlideUp 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ✨
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.01em",
                }}
              >
                ShopEasy AI
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "rgba(255, 255, 255, 0.8)",
                }}
              >
                Your personal shopping assistant
              </p>
            </div>
            <button
              onClick={() => dispatch(clearChat())}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "white",
                fontSize: "11px",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.15)")}
              title="Clear chat"
            >
              Clear
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {chatMessages.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛍️</div>
                <h4
                  style={{
                    margin: "0 0 8px",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  How can I help you today?
                </h4>
                <p
                  style={{
                    margin: "0 0 16px",
                    fontSize: "13px",
                    color: "#9ca3af",
                    lineHeight: 1.5,
                  }}
                >
                  Ask me about products, deals, or fashion advice!
                </p>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  {quickSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleQuickAction(suggestion)}
                      style={{
                        background: "linear-gradient(135deg, #f0f0ff, #faf5ff)",
                        border: "1px solid rgba(139, 92, 246, 0.2)",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        color: "#6366f1",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "linear-gradient(135deg, #e0e0ff, #f0e5ff)";
                        e.target.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "linear-gradient(135deg, #f0f0ff, #faf5ff)";
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, index) => (
              <div key={index}>
                {/* Message Bubble */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    gap: "8px",
                    alignItems: "flex-end",
                  }}
                >
                  {msg.role !== "user" && (
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      ✨
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius:
                        msg.role === "user"
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                      background:
                        msg.role === "user"
                          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                          : "#f3f4f6",
                      color: msg.role === "user" ? "white" : "#374151",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* Recommended Products */}
                {msg.products && msg.products.length > 0 && (
                  <div
                    style={{
                      marginTop: "8px",
                      marginLeft: "36px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {msg.products.slice(0, 3).map((product) => (
                      <div
                        key={product._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px",
                          background: "white",
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                          e.currentTarget.style.borderColor = "#a855f7";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                        }}
                        onClick={() => handleProductClick(product._id)}
                      >
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "8px",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#374151",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {product.title}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#6366f1",
                            }}
                          >
                            ${product.salePrice > 0 ? product.salePrice : product.price}
                            {product.salePrice > 0 && (
                              <span
                                style={{
                                  textDecoration: "line-through",
                                  color: "#9ca3af",
                                  fontWeight: 400,
                                  marginLeft: "6px",
                                  fontSize: "11px",
                                }}
                              >
                                ${product.price}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product._id);
                          }}
                          style={{
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "6px 10px",
                            color: "white",
                            fontSize: "10px",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          + Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {chatLoading && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  ✨
                </div>
                <div
                  style={{
                    padding: "12px 18px",
                    background: "#f3f4f6",
                    borderRadius: "16px 16px 16px 4px",
                    display: "flex",
                    gap: "4px",
                  }}
                >
                  <span style={{ ...dotStyle, animationDelay: "0s" }} className="chat-dot" />
                  <span style={{ ...dotStyle, animationDelay: "0.2s" }} className="chat-dot" />
                  <span style={{ ...dotStyle, animationDelay: "0.4s" }} className="chat-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #f3f4f6",
              display: "flex",
              gap: "8px",
              background: "white",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "24px",
                border: "1px solid #e5e7eb",
                outline: "none",
                fontSize: "13px",
                background: "#f9fafb",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#a855f7";
                e.target.style.boxShadow = "0 0 0 3px rgba(168, 85, 247, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatLoading}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "none",
                background:
                  input.trim() && !chatLoading
                    ? "linear-gradient(135deg, #6366f1, #a855f7)"
                    : "#e5e7eb",
                cursor: input.trim() && !chatLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes chatbotPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        @keyframes chatDotBounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .chat-dot {
          animation: chatDotBounce 1.4s ease-in-out infinite !important;
        }
      `}</style>
    </>
  );
}

const dotStyle = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#9ca3af",
  display: "inline-block",
};

export default AIChatbot;
