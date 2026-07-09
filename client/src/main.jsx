import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store'
import { Toaster } from './components/ui/toaster'
import { ClerkProvider } from '@clerk/clerk-react'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={CLERK_KEY}>
    <BrowserRouter>
      <Provider store={store}>
        <App />
        <Toaster/>
      </Provider>
    </BrowserRouter>
  </ClerkProvider>
);
