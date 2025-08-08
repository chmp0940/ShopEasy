# ShopEasy - MERN Stack E-Commerce

A full-stack e-commerce web application built as a learning project using the MERN stack with modern features like shopping cart, payment integration, and admin dashboard.

## 🚀 Features

**Customer Features:**

- User registration & login with JWT authentication
- Browse products by categories and brands
- Search and filter products
- Shopping cart management
- Multiple address management
- PayPal payment integration
- Order tracking and history
- Product reviews and ratings

**Admin Features:**

- Product management (CRUD operations)
- Order management and status updates
- Image upload with Cloudinary
- Sales dashboard

## 🛠️ Technology Stack

**Frontend:**

- React 19 with Vite
- Redux Toolkit (State Management)
- Tailwind CSS (Styling)
- Radix UI (Components)
- React Router DOM

**Backend:**

- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Cloudinary (Image Storage)
- PayPal SDK (Payments)

**Tools:**

- Axios (HTTP Client)
- bcryptjs (Password Hashing)
- Multer (File Upload)

## 📦 Installation

### Prerequisites

- Node.js (v16+)
- MongoDB
- npm/yarn

### Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd ShopEasy
```

2. **Setup Backend**

```bash
cd server
npm install
```

3. **Create server/.env file**

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
PAYPAL_MODE=sandbox
```

4. **Setup Frontend**

```bash
cd ../client
npm install
```

5. **Create client/.env file**

```env
VITE_API_URL=http://localhost:5000
```

6. **Start the application**

```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 📁 Project Structure

```
ShopEasy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   └── assets/         # Images & files
└── server/                 # Node.js backend
    ├── controllers/        # Route handlers
    ├── models/            # Database models
    ├── routes/            # API routes
    └── middlewares/       # Custom middleware
```

## 🔧 Available Scripts

**Backend:**

- `npm run dev` - Start with nodemon
- `npm start` - Start production server

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production

## 📚 Learning Outcomes

This project demonstrates:

- Full-stack web development with MERN
- User authentication & authorization
- RESTful API design
- State management with Redux
- Payment gateway integration
- File upload and cloud storage
- Responsive web design
- Database design and relationships

---

**📝 Created as a student project for learning MERN stack development**
