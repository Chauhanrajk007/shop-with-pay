# LuxCart - Premium E-Commerce App 🛍️✨

LuxCart is a modern, ultra-premium e-commerce web application that leverages Generative AI to provide users with a personalized shopping experience. Built with a sleek glassmorphism UI, it features a smart "AI Mode" search capable of understanding complex natural language queries, creating product bundles, and providing conversational reasoning for its recommendations.

## 🚀 Key Features

*   **AI-Powered Search (Gemini 2.5 Flash)**:
    *   Toggle AI Mode directly from the navigation bar.
    *   Understands context, budgets, and intent (e.g., "Best gaming setup under 1 lakh").
    *   **Smart Bundling**: Automatically picks complementary products across different categories to build a complete package (e.g., matching a laptop with a mouse and headset).
    *   Provides specific reasoning for *why* each product was picked.
*   **Wishlist & Price Drop Alerts**: Save favorite products locally. Features mock UI for active price drop tracking.
*   **Compare Products**: (Architecture implemented) Select multiple products to view side-by-side spec comparisons.
*   **Premium UI/UX**:
    *   Custom vanilla CSS with CSS variables for easy theming.
    *   Smooth micro-animations, glassmorphism modals, and clean responsive design.
    *   No heavy UI libraries—pure, performant web standards.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, Vanilla JavaScript (ESModules), Vanilla CSS3.
*   **Build Tool**: [Vite](https://vitejs.dev/) for blazing fast local development and optimized production bundling.
*   **Backend / Serverless**: Vercel Serverless Functions (`/api`).
*   **AI Integration**: Google Generative AI (`@google/generative-ai`) via the Gemini 2.5 Flash model.
*   **Database**: MongoDB (via `mongoose` in Serverless Functions) for product storage.

## 📂 Project Structure

```text
├── api/
│   ├── rag-search.js      # Serverless function handling Gemini AI queries & RAG logic
│   ├── server.js          # Serverless function handling MongoDB product fetching
│   └── compare.js         # Serverless function for product comparison logic
├── src/
│   ├── modules/           # Modular Vanilla JS logic
│   │   ├── ai-search.js   # Frontend integration for AI Search inline rendering
│   │   ├── wishlist.js    # Wishlist state management (Local Storage)
│   │   ├── ui.js          # Toast notifications, modal helpers, and card rendering
│   │   ├── animations.js  # Cursor glow, scroll reveals, preloader
│   │   ├── cart.js        # Shopping cart logic
│   │   └── auth.js        # Authentication modal logic
│   ├── style.css          # Core design system and responsive styles
│   └── main.js            # Application entry point and initialization
├── index.html             # Main application layout
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration (API proxying)
```

## 💻 Local Development

### Prerequisites
*   Node.js (v18+)
*   MongoDB URI (for `api/server.js`)
*   Google Gemini API Key (for `api/rag-search.js`)

### Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Shopwithpay-main.git
    cd Shopwithpay-main
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root directory and add your keys:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_gemini_api_key
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```
    This will start Vite on `http://localhost:5173`. *Note: To test the `/api` serverless functions locally alongside Vite, you may need to use Vercel CLI (`vercel dev`).*

5.  **Build for Production**:
    ```bash
    npm run build
    ```

## ☁️ Deployment

This project is optimized for deployment on **Vercel**. 

1. Connect your GitHub repository to Vercel.
2. In the Vercel project settings, add the Environment Variables (`MONGODB_URI` and `GEMINI_API_KEY`).
3. Vercel will automatically detect Vite and the `/api` directory for Serverless Functions. Deploy!

---
*Built with ❤️ and AI.*
