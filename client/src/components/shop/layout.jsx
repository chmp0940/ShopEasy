import React from 'react'
import { Outlet } from 'react-router-dom'
import ShoppingHeader from './header'
import AIChatbot from './ai-chatbot'

function ShoppingLayout() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full">
        <Outlet />
      </main>
      {/* AI Shopping Assistant — floats on all shop pages */}
      <AIChatbot />
    </div>
  );
}

export default ShoppingLayout