/**
 * NutriPlan - Main Entry Point
*/
"use strict";

import {
  ApiService,
  NutritionService,
  MealsService,
  ProductsService,
} from "./api/mealdb.js";
import { FoodLogStore } from "./state/appState.js";
import {
  NavController,
  MobileMenuController,
  FoodLogQuickActions,
  LogMealModal,
  MealsView,
  FoodLogView,
  ProductsView,
} from "./ui/components.js";


const API_KEY = "NNbxvbRBOgZO01gmUdCFVMhUuQ8EcX9fbQLy5boP";
const MEALS_URL = "https://nutriplan-api.vercel.app/api/";

const productsSection = document.getElementById("products-section");
const foodlogSection = document.getElementById("foodlog-section");

productsSection.style.display = "none";
foodlogSection.style.display = "none";

// ======================= Loading Overlay =====================
const loadingOverlay = document.getElementById("app-loading-overlay");

loadingOverlay.style.display = "flex";
loadingOverlay.style.opacity = "1";

function hideLoadingOverlay() {
  loadingOverlay.style.opacity = "0";
}

loadingOverlay.addEventListener("transitionend", () => {
  loadingOverlay.style.display = "none";
});

// ===================== App Init ================================

const foodLogStore = new FoodLogStore("nutriplan-foodlog");
const foodLogView = new FoodLogView(foodLogStore);
const logMealModal = new LogMealModal(foodLogStore, () => foodLogView.render());

const mealsService = new MealsService(MEALS_URL, API_KEY);
const nutritionService = new NutritionService(MEALS_URL, API_KEY);
const mealsView = new MealsView(mealsService, nutritionService, logMealModal);
const navController = new NavController();
const mobileMenuController = new MobileMenuController();
const foodLogQuickActions = new FoodLogQuickActions(
  navController,
  loadingOverlay,
  hideLoadingOverlay,
);

const productsService = new ProductsService(MEALS_URL, API_KEY);
const productsView = new ProductsView(productsService, foodLogStore, () =>
  foodLogView.render(),
);

mealsView
  .loadAllMeals()
  .catch((error) => console.error("Failed to load meals:", error))
  .finally(() => hideLoadingOverlay());
