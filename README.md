# NutriPlan - Food, Nutrition & Fitness Planner

A fully functional Food, Nutrition & Fitness Planner web app built with vanilla JavaScript, ES6 modules, and an OOP architecture.

## 🎯 Project Overview

NutriPlan lets users browse recipes, calculate nutrition facts, scan packaged food products, and track their daily food intake — all persisted locally in the browser.

## 📁 Project Structure

Nutri-Plan/
├── index.html # Main HTML file
├── README.md # This file
└── src/
├── css/
│ └── style.css # Styles
├── images/
└── js/
├── main.js # Entry point — app initialization & wiring
├── api/
│ └── mealdb.js # API service classes (Meals, Nutrition, Products)
├── state/
│ └── appState.js # FoodLogStore — localStorage-backed state
└── ui/
├── navLinks.js # NavController, MobileMenuController, FoodLogQuickActions
├── mealView.js # MealsView, LogMealModal
├── productView.js # ProductsView
└── foodLog.js # FoodLogView

## 🔗 API Reference

**NutriPlan API** (custom backend, API key required for some endpoints)

Base URL: `https://nutriplan-api.vercel.app/api/`

| Endpoint | Description |
|---|---|
| `meals/categories` | Get all meal categories |
| `meals/areas` | Get all cuisines/areas |
| `meals/search?q={query}` | Search meals by name |
| `meals/filter?category={c}&area={a}` | Filter meals by category/area |
| `meals/random?count={n}` | Get random meals |
| `nutrition/analyze` (POST) | Analyze nutrition from a recipe name + ingredient list |
| `products/search?q={query}` | Search packaged products |
| `products/barcode/{barcode}` | Look up a product by barcode |
| `products/categories` | Get product categories |
| `products/category/{id}` | Get products by category |

## ✅ Features Implemented

### Meals & Recipes
- Fetch and display categories (`#categories-grid`) with expandable "View All" toggle
- Fetch and display recipes (`#recipes-grid`) in grid/list view
- Search recipes by name, filter by category or cuisine
- Recipe detail view with ingredients, instructions, embedded video
- Live nutrition analysis per recipe (calories, macros, daily-value bars) with caching per meal
- Log a recipe to the daily food log via a servings-adjustable modal

### Product Scanner
- Search products by name, or look up by barcode
- Filter results by Nutri-Score (A–E)
- Browse by category
- Product detail modal with Nutri-Score, NOVA group, full nutrition breakdown
- Log a product to the daily food log

### Food Log
- Daily nutrition progress bars (calories, protein, carbs, fat) vs. goals, turning red at 100%
- Logged items list (recipes and products), each removable individually
- Clear-all with confirmation dialog
- Weekly overview strip and quick stats (weekly average, total items, days on goal)
- All data persisted in `localStorage`

### Navigation & UX
- Sidebar navigation between Meals / Product Scanner / Food Log
- Mobile-responsive collapsible sidebar
- Loading overlay on initial load
- SweetAlert2 toasts/dialogs for logging, deleting, and clearing confirmations
- Error states for failed API calls throughout

## 🎨 Key HTML Elements

### Meals Page
| Element ID | Purpose |
|---|---|
| `#app-loading-overlay` | Loading screen |
| `#categories-grid` | Container for category cards |
| `#recipes-grid` | Container for recipe cards |
| `#search-input` | Search input field |
| `#recipes-count` | Text showing recipe count |
| `#meal-details` | Recipe detail section |
| `#nutrition-facts-container` | Nutrition breakdown for the open recipe |
| `#log-meal-btn` | Opens the log-meal modal |

### Product Scanner Page
| Element ID | Purpose |
|---|---|
| `#products-section` | Page container (toggle display) |
| `#product-search-input` | Product name search input |
| `#barcode-input` | Barcode number input |
| `#search-product-btn` / `#lookup-barcode-btn` | Search / lookup triggers |
| `#products-grid` | Container for product cards |
| `#products-count` | Text showing product count |
| `.nutri-score-filter` | Nutri-Score filter buttons |
| `#product-detail-modal` | Product detail modal (injected via JS) |

### Food Log Page
| Element ID | Purpose |
|---|---|
| `#foodlog-section` | Page container (toggle display) |
| `#foodlog-calories-bar` / `-protein-` / `-carbs-` / `-fat-bar` | Daily progress bars |
| `#foodlog-items-list` | Container for logged food items |
| `#foodlog-clear-btn` | Clear all logged items |
| `#foodlog-weekly-grid` | Weekly overview strip |
| `#foodlog-weekly-average` / `-total-items` / `-days-on-goal` | Quick stats |

## 🏗️ Architecture Notes

- **OOP throughout**: every feature is a class with a single responsibility (services fetch data, views render/handle DOM, one shared store persists state).
- **`ApiService`** is the base class for all API services (`MealsService`, `NutritionService`, `ProductsService`), centralizing `fetch`, error handling, and URL building.
- **`FoodLogStore`** is the single source of truth for logged food, shared across `LogMealModal`, `ProductsView`, and `FoodLogView` via constructor injection — no global state.
- **Event delegation** is used on containers whose contents are re-rendered (recipe grid, category grid, food log items) to avoid attaching/losing listeners on dynamically created elements.
- **Caching**: nutrition analysis results are cached per meal ID so re-opening a recipe never re-fetches.

## 💡 Notes for Reviewers

- Data is stored in `localStorage` under the key `nutriplan-foodlog`, keyed by date (`YYYY-MM-DD`).
- The Nutrition Analyze API is called once per recipe and cached in memory for the session.
- All modals (log-meal, product-detail) are injected into the DOM via JS rather than hardcoded in `index.html`.