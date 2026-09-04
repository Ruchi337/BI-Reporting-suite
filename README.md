# Inventory Intelligence & E-Commerce AI Suite

A full-stack e-commerce intelligence and inventory optimization platform built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Express**, featuring **Google Gemini 3.7 Flash** and **Vision AI**.

---

## 🚀 Quick Start Guide for Visual Studio / VS Code

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 2. Installation
Open the project directory in Visual Studio / VS Code terminal and run:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (copied from `.env.example`):
```bash
cp .env.example .env
```
Inside `.env`, provide your Gemini API key:
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
PORT=3000
```
> *Note: If no Gemini API key is provided, the application runs with intelligent fallback heuristics for all features.*

### 4. Running the Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

### 5. Type Checking & Verification
To verify that all TypeScript types compile without errors:
```bash
npm run lint
```

### 6. Production Build
To create a production build:
```bash
npm run build
npm start
```

---

## 🛠️ Project Structure
```
├── server.ts                  # Express API server with Gemini AI endpoints
├── src/
│   ├── components/            # UI components (Catalog, Inventory, Forecast, SQL BI, etc.)
│   ├── utils/                 # ML forecasting, in-memory SQL engine, vector search
│   ├── types.ts               # TypeScript data models and interfaces
│   ├── mockData.ts            # Seed catalog, reviews, and customer RFM cohorts
│   ├── App.tsx                # Main application container
│   ├── main.tsx               # React DOM entry point
│   └── index.css              # Tailwind CSS styles
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

---

## 📋 Features Implemented (Milestones 1, 2 & 3)
- **Milestone 1**: Multimodal Vision API product categorization + Gemini AI copy generator.
- **Milestone 2 (Base)**: Real-time inventory tracking, low-stock triggers, SQL customer segmentation, rule-based recommendations.
- **Milestone 2 (Advanced)**: Time-series Holt-Winters/ARIMA demand forecasting (with 95% confidence bands and backtest metrics), LLM review sentiment analysis, pgvector semantic search recommendations.
- **Milestone 3**: SQL Analytics Workbench, Executive BI metrics, and CSV/JSON data export.
