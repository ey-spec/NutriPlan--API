// ===================== Nav Links ================================

export class NavController {
  constructor() {
    this.navLinks = document.querySelectorAll(".nav-link");
    this.header = document.getElementById("header");

    this.sectionGroups = {
      meals: [
        document.getElementById("search-filters-section"),
        document.getElementById("meal-categories-section"),
        document.getElementById("all-recipes-section"),
        document.getElementById("meal-details"),
      ],
      products: [document.getElementById("products-section")],
      foodlog: [document.getElementById("foodlog-section")],
    };

    this.headerTitles = {
      meals: {
        title: "Meals & Recipes",
        subtitle: "Discover delicious and nutritious recipes tailored for you",
      },
      products: {
        title: "Product Scanner",
        subtitle: "Search packaged foods by name or barcode",
      },
      foodlog: {
        title: "Food Log",
        subtitle: "Track your daily nutrition and food intake",
      },
    };

    this.navLinks.forEach((link, index) => {
      const keys = ["meals", "products", "foodlog"];
      link.addEventListener("click", (event) => {
        event.preventDefault();
        this.switchTo(keys[index]);
        document.getElementById("sidebar")?.classList.remove("open");
        document.getElementById("sidebar-overlay")?.classList.remove("active");
      });
    });
  }

  switchTo(sectionKey) {
    for (const key in this.sectionGroups) {
      for (const el of this.sectionGroups[key]) {
        if (!el) continue;
        el.style.display = key === sectionKey ? "" : "none";
      }
    }

    this.setActiveLink(sectionKey);
    this.updateHeader(sectionKey);
  }

  setActiveLink(sectionKey) {
    const keys = ["meals", "products", "foodlog"];
    const activeIndex = keys.indexOf(sectionKey);

    this.navLinks.forEach((link, index) => {
      if (index === activeIndex) {
        link.classList.add("bg-emerald-50", "text-emerald-700");
        link.classList.remove("text-gray-600");
      } else {
        link.classList.remove("bg-emerald-50", "text-emerald-700");
        link.classList.add("text-gray-600");
      }
    });
  }

  updateHeader(sectionKey) {
    const info = this.headerTitles[sectionKey];
    const titleEl = this.header.querySelector("h1");
    const subtitleEl = this.header.querySelector("p");

    if (titleEl) titleEl.textContent = info.title;
    if (subtitleEl) subtitleEl.textContent = info.subtitle;
  }
}

export class MobileMenuController {
  constructor() {
    this.sidebar = document.getElementById("sidebar");
    this.overlay = document.getElementById("sidebar-overlay");
    this.openBtn = document.getElementById("header-menu-btn");
    this.closeBtn = document.getElementById("sidebar-close-btn");

    this.openBtn.addEventListener("click", () => this.open());
    this.closeBtn.addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", () => this.close());
  }

  open() {
    this.sidebar.classList.add("open");
    this.overlay.classList.add("active");
  }

  close() {
    this.sidebar.classList.remove("open");
    this.overlay.classList.remove("active");
  }
}

// ===================== Foodlog action button =======================

export class FoodLogQuickActions {
  constructor(navController, loadingOverlay, hideLoadingOverlayFn) {
    this.navController = navController;
    this.loadingOverlay = loadingOverlay;
    this.hideLoadingOverlayFn = hideLoadingOverlayFn;

    this.foodlogSection = document.getElementById("foodlog-section");

    this.foodlogSection.addEventListener("click", (event) => {
      const browseLink = event.target.closest('a[href="#meals"]');
      if (browseLink) {
        event.preventDefault();
        this.navController.switchTo("meals");
        return;
      }

      const scanLink = event.target.closest('a[href="/products"]');
      if (scanLink) {
        event.preventDefault();
        this.goToProductsWithLoading();
      }
    });
  }

  goToProductsWithLoading() {
    this.loadingOverlay.style.display = "flex";
    this.loadingOverlay.style.opacity = "1";

    setTimeout(() => {
      this.navController.switchTo("products");
      this.loadingOverlay.style.opacity = "0";

      this.loadingOverlay.addEventListener(
        "transitionend",
        () => {
          this.loadingOverlay.style.display = "none";
        },
        { once: true },
      );
    }, 500);
  }
}

// ===================== LogMealModal ================================

export class LogMealModal {
  constructor(foodLogStore, onMealLogged) {
    this.foodLogStore = foodLogStore;
    this.onMealLogged = onMealLogged;
    this.currentMeal = null;
    this.nutritionPerServing = null;

    this.injectModalHtml();

    this.modalElement = document.getElementById("log-meal-modal");
    this.thumbnailImg = this.modalElement.querySelector("img");
    this.mealNameEl = document.getElementById("modal-meal-name");

    this.servingsInput = document.getElementById("meal-servings");
    this.decreaseBtn = document.getElementById("decrease-servings");
    this.increaseBtn = document.getElementById("increase-servings");

    this.caloriesEl = document.getElementById("modal-calories");
    this.proteinEl = document.getElementById("modal-protein");
    this.carbsEl = document.getElementById("modal-carbs");
    this.fatEl = document.getElementById("modal-fat");

    this.cancelBtn = document.getElementById("cancel-log-meal");
    this.confirmBtn = document.getElementById("confirm-log-meal");

    this.modalElement.style.display = "none";

    this.decreaseBtn.addEventListener("click", () => this.updateServings(-0.5));
    this.increaseBtn.addEventListener("click", () => this.updateServings(0.5));
    this.servingsInput.addEventListener("input", () =>
      this.updateNutritionPreview(),
    );
    this.cancelBtn.addEventListener("click", () => this.close());
    this.confirmBtn.addEventListener("click", () => this.handleLogMeal());

    this.modalElement.addEventListener("click", (event) => {
      if (event.target === this.modalElement) this.close();
    });
  }

  injectModalHtml() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="log-meal-modal">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <div class="flex items-center gap-4 mb-6">
            <img src="" alt="" class="w-16 h-16 rounded-xl object-cover">
            <div>
              <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
              <p id="modal-meal-name" class="text-gray-500 text-sm"></p>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
            <div class="flex items-center gap-3">
              <button id="decrease-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <i class="fa-solid fa-minus text-gray-600"></i>
              </button>
              <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5" class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2">
              <button id="increase-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <i class="fa-solid fa-plus text-gray-600"></i>
              </button>
            </div>
          </div>

          <div class="bg-emerald-50 rounded-xl p-4 mb-6">
            <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
            <div class="grid grid-cols-4 gap-2 text-center">
              <div>
                <p class="text-lg font-bold text-emerald-600" id="modal-calories">0</p>
                <p class="text-xs text-gray-500">Calories</p>
              </div>
              <div>
                <p class="text-lg font-bold text-blue-600" id="modal-protein">0g</p>
                <p class="text-xs text-gray-500">Protein</p>
              </div>
              <div>
                <p class="text-lg font-bold text-amber-600" id="modal-carbs">0g</p>
                <p class="text-xs text-gray-500">Carbs</p>
              </div>
              <div>
                <p class="text-lg font-bold text-purple-600" id="modal-fat">0g</p>
                <p class="text-xs text-gray-500">Fat</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
              <i class="fa-solid fa-clipboard-list mr-2"></i>
              Log Meal
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(wrapper.firstElementChild);
  }

  open(meal, nutritionPerServing) {
    this.currentMeal = meal;
    this.nutritionPerServing = nutritionPerServing;
    this.servingsInput.value = 1;

    this.thumbnailImg.src = meal.thumbnail;
    this.thumbnailImg.alt = meal.name;
    this.mealNameEl.textContent = meal.name;

    this.updateNutritionPreview();
    this.modalElement.style.display = "flex";
  }

  close() {
    this.modalElement.style.display = "none";
    this.currentMeal = null;
    this.nutritionPerServing = null;
  }

  updateServings(delta) {
    const current = parseFloat(this.servingsInput.value) || 1;
    const next = Math.min(10, Math.max(0.5, current + delta));

    this.servingsInput.value = next;
    this.updateNutritionPreview();
  }

  updateNutritionPreview() {
    const servings = parseFloat(this.servingsInput.value) || 1;
    const n = this.nutritionPerServing;

    this.caloriesEl.textContent = Math.round(n.calories * servings);
    this.proteinEl.textContent = `${Math.round(n.protein * servings)}g`;
    this.carbsEl.textContent = `${Math.round(n.carbs * servings)}g`;
    this.fatEl.textContent = `${Math.round(n.fat * servings)}g`;
  }

  handleLogMeal() {
    const servings = parseFloat(this.servingsInput.value) || 1;
    const n = this.nutritionPerServing;

    const entry = {
      type: "meal",
      name: this.currentMeal.name,
      mealId: this.currentMeal.id,
      category: this.currentMeal.category,
      thumbnail: this.currentMeal.thumbnail,
      servings,
      nutrition: {
        calories: Math.round(n.calories * servings),
        protein: Math.round(n.protein * servings),
        carbs: Math.round(n.carbs * servings),
        fat: Math.round(n.fat * servings),
      },
      loggedAt: new Date().toISOString(),
    };

    this.foodLogStore.addMeal(entry);
    this.onMealLogged?.();
    this.close();

    Swal.fire({
      icon: "success",
      title: "Meal Logged!",
      html: `${entry.name} (${entry.servings} serving${entry.servings !== 1 ? "s" : ""}) has been added to your daily log.<br><span style="color:#059669;font-weight:600;">+${entry.nutrition.calories} calories</span>`,
      showConfirmButton: false,
      timer: 2000,
    });
  }
}

// ===================== Meals View ================================

export class MealsView {
  constructor(mealsService, nutritionService, logMealModal) {
    this.mealsService = mealsService;
    this.nutritionService = nutritionService;
    this.logMealModal = logMealModal;
    this.currentMeals = [];
    this.nutritionCache = {};

    this.recipesGrid = document.getElementById("recipes-grid");
    this.recipesCount = document.getElementById("recipes-count");
    this.mealDetailsSection = document.getElementById("meal-details");
    this.allRecipesSection = document.getElementById("all-recipes-section");
    this.categoriesSection = document.getElementById("meal-categories-section");
    this.searchFiltersSection = document.getElementById(
      "search-filters-section",
    );
    this.backButton = document.getElementById("back-to-meals-btn");
    this.categoriesGrid = document.getElementById("categories-grid");
    this.searchInput = document.getElementById("search-input");

    this.cuisinePillsContainer = document.getElementById(
      "cuisine-pills-container",
    );

    this.gridViewBtn = document.getElementById("grid-view-btn");
    this.listViewBtn = document.getElementById("list-view-btn");
    this.viewMode = "grid";

    this.gridViewBtn.addEventListener("click", () => this.setViewMode("grid"));
    this.listViewBtn.addEventListener("click", () => this.setViewMode("list"));

    this.activeFilter = { type: "all", value: null };

    this.viewAllBtn = document.getElementById("view-all-categories-btn");
    this.viewAllText = document.getElementById("view-all-categories-text");
    this.viewAllIcon = document.getElementById("view-all-categories-icon");
    this.categoriesExpanded = false;
    this.visibleCategoriesCount = 12;
    this.allCategories = [];

    this.dailyValues = {
      protein: 50,
      carbs: 250,
      fat: 65,
      fiber: 28,
      sugar: 50,
      saturatedFat: 20,
    };

    this.viewAllBtn.addEventListener("click", () =>
      this.toggleCategoriesView(),
    );

    this.categoryStyles = {
      Beef: {
        icon: "fa-drumstick-bite",
        from: "from-red-50",
        to: "to-rose-50",
        border: "border-red-200",
        iconFrom: "from-red-400",
        iconTo: "to-rose-500",
      },
      Chicken: {
        icon: "fa-drumstick-bite",
        from: "from-amber-50",
        to: "to-orange-50",
        border: "border-amber-200",
        iconFrom: "from-amber-400",
        iconTo: "to-orange-500",
      },
      Dessert: {
        icon: "fa-birthday-cake",
        from: "from-pink-50",
        to: "to-rose-50",
        border: "border-pink-200",
        iconFrom: "from-pink-400",
        iconTo: "to-rose-500",
      },
      Lamb: {
        icon: "fa-drumstick-bite",
        from: "from-orange-50",
        to: "to-amber-50",
        border: "border-orange-200",
        iconFrom: "from-orange-400",
        iconTo: "to-amber-500",
      },
      Miscellaneous: {
        icon: "fa-bowl-rice",
        from: "from-slate-50",
        to: "to-gray-50",
        border: "border-slate-200",
        iconFrom: "from-slate-400",
        iconTo: "to-gray-500",
      },
      Pasta: {
        icon: "fa-bowl-food",
        from: "from-yellow-50",
        to: "to-amber-50",
        border: "border-yellow-200",
        iconFrom: "from-yellow-400",
        iconTo: "to-amber-500",
      },
      Pork: {
        icon: "fa-bacon",
        from: "from-rose-50",
        to: "to-red-50",
        border: "border-rose-200",
        iconFrom: "from-rose-400",
        iconTo: "to-red-500",
      },
      Seafood: {
        icon: "fa-fish",
        from: "from-cyan-50",
        to: "to-blue-50",
        border: "border-cyan-200",
        iconFrom: "from-cyan-400",
        iconTo: "to-blue-500",
      },
      Side: {
        icon: "fa-bowl-rice",
        from: "from-green-50",
        to: "to-emerald-50",
        border: "border-green-200",
        iconFrom: "from-green-400",
        iconTo: "to-emerald-500",
      },
      Starter: {
        icon: "fa-utensils",
        from: "from-teal-50",
        to: "to-cyan-50",
        border: "border-teal-200",
        iconFrom: "from-teal-400",
        iconTo: "to-cyan-500",
      },
      Vegan: {
        icon: "fa-leaf",
        from: "from-emerald-50",
        to: "to-green-50",
        border: "border-emerald-200",
        iconFrom: "from-emerald-400",
        iconTo: "to-green-500",
      },
      Vegetarian: {
        icon: "fa-carrot",
        from: "from-lime-50",
        to: "to-green-50",
        border: "border-lime-200",
        iconFrom: "from-lime-400",
        iconTo: "to-green-500",
      },
      Goat: {
        icon: "fa-paw",
        from: "from-stone-50",
        to: "to-amber-50",
        border: "border-stone-200",
        iconFrom: "from-stone-400",
        iconTo: "to-amber-500",
      },
      Breakfast: {
        icon: "fa-mug-hot",
        from: "from-amber-50",
        to: "to-yellow-50",
        border: "border-amber-200",
        iconFrom: "from-amber-400",
        iconTo: "to-yellow-500",
      },
    };

    this.defaultCategoryStyle = {
      icon: "fa-utensils",
      from: "from-gray-50",
      to: "to-slate-50",
      border: "border-gray-200",
      iconFrom: "from-gray-400",
      iconTo: "to-slate-500",
    };

    this.heroCalories = document.getElementById("hero-calories");
    this.logMealBtn = document.getElementById("log-meal-btn");
    this.nutritionFactsContainer = document.getElementById(
      "nutrition-facts-container",
    );

    this.logMealBtn.addEventListener("click", () => {
      const cached = this.nutritionCache[this.currentDetailMeal.id];
      if (!cached) return;
      this.logMealModal.open(this.currentDetailMeal, cached.data.perServing);
    });

    this.mealDetailsSection.style.display = "none";

    this.backButton.addEventListener("click", () => this.showList());

    this.loadCategoriesAndAreas();
    this.setupSearch();

    this.categoriesGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".category-card");
      if (!card) return;
      this.applyFilter({ category: card.dataset.category });
    });
  }

  showError(container, message = "Something went wrong. Please try again.") {
    container.innerHTML = `
    <p class="text-sm text-red-500 text-center py-4 col-span-full">
      <i class="fa-solid fa-circle-exclamation mr-1"></i>${message}
    </p>`;
  }

  buildIngredientStrings(ingredients) {
    return ingredients.map((item) =>
      `${item.measure} ${item.ingredient}`.trim(),
    );
  }

  setLogButtonState(state) {
    if (state === "loading") {
      this.logMealBtn.disabled = true;
      this.logMealBtn.classList.remove("bg-blue-600", "hover:bg-blue-700");
      this.logMealBtn.classList.add("bg-gray-400", "cursor-not-allowed");
      this.logMealBtn.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      <span>Calculating...</span>`;
    } else {
      this.logMealBtn.disabled = false;
      this.logMealBtn.classList.remove("bg-gray-400", "cursor-not-allowed");
      this.logMealBtn.classList.add("bg-blue-600", "hover:bg-blue-700");
      this.logMealBtn.innerHTML = `
      <i class="fa-solid fa-clipboard-list"></i>
      <span>Log This Meal</span>`;
    }
  }

  setHeroCalories(text) {
    this.heroCalories.textContent = text;
  }

  renderNutritionLoading() {
    this.nutritionFactsContainer.innerHTML = `
    <div class="flex flex-col items-center justify-center py-10 text-center">
      <div class="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <i class="fa-solid fa-calculator text-emerald-600 text-xl"></i>
      </div>
      <p class="font-semibold text-gray-900">Calculating Nutrition</p>
      <p class="text-sm text-gray-500 mt-1">Analyzing ingredients...</p>
      <div class="flex items-center justify-center gap-1 mt-3">
        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    </div>`;
  }

  renderNutritionError() {
    this.nutritionFactsContainer.innerHTML = `
    <div class="flex flex-col items-center justify-center py-10 text-center">
      <i class="fa-solid fa-circle-exclamation text-red-500 text-2xl mb-3"></i>
      <p class="text-sm text-red-500">Failed to calculate nutrition.</p>
    </div>`;
  }

  renderNutritionSuccess(data) {
    const { perServing, totals } = data.data;

    this.nutritionFactsContainer.innerHTML = `
    <p class="text-sm text-gray-500 mb-4">Per serving</p>

    <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
      <p class="text-sm text-gray-600">Calories per serving</p>
      <p class="text-4xl font-bold text-emerald-600">${Math.round(perServing.calories)}</p>
      <p class="text-xs text-gray-500 mt-1">Total: ${Math.round(totals.calories)} cal</p>
    </div>

    <div class="space-y-4">
      ${this.renderNutrientBar("Protein", perServing.protein, "g", "bg-emerald-500", this.dailyValues.protein)}
      ${this.renderNutrientBar("Carbs", perServing.carbs, "g", "bg-blue-500", this.dailyValues.carbs)}
      ${this.renderNutrientBar("Fat", perServing.fat, "g", "bg-purple-500", this.dailyValues.fat)}
      ${this.renderNutrientBar("Fiber", perServing.fiber, "g", "bg-orange-500", this.dailyValues.fiber)}
      ${this.renderNutrientBar("Sugar", perServing.sugar, "g", "bg-pink-500", this.dailyValues.sugar)}
      ${this.renderNutrientBar("Saturated Fat", perServing.saturatedFat, "g", "bg-red-500", this.dailyValues.saturatedFat)}
    </div>`;
  }

  calcBarWidth(value, dailyValue) {
    const percent = (value / dailyValue) * 100;
    return Math.min(percent, 100);
  }

  renderNutrientBar(label, value, unit, colorClass, dailyValue) {
    const percent = this.calcBarWidth(value, dailyValue);

    return `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full ${colorClass}"></div>
        <span class="text-gray-700">${label}</span>
      </div>
      <span class="font-bold text-gray-900">${Math.round(value)}${unit}</span>
    </div>
    <div class="w-full bg-gray-100 rounded-full h-2">
      <div class="${colorClass} h-2 rounded-full" style="width: ${percent}%"></div>
    </div>`;
  }

  async loadNutrition(meal) {
    if (this.nutritionCache[meal.id]) {
      this.applyNutritionData(this.nutritionCache[meal.id]);
      return;
    }

    this.renderNutritionLoading();
    this.setHeroCalories("Calculating...");
    this.setLogButtonState("loading");

    try {
      const ingredientStrings = this.buildIngredientStrings(meal.ingredients);
      const nutritionData = await this.nutritionService.analyzeNutrition(
        meal.name,
        ingredientStrings,
      );

      this.nutritionCache[meal.id] = nutritionData;
      this.applyNutritionData(nutritionData);
    } catch (error) {
      this.renderNutritionError();
      this.setHeroCalories("N/A");
      this.setLogButtonState("default");
    }
  }

  applyNutritionData(nutritionData) {
    const calories = Math.round(nutritionData.data.perServing.calories);
    this.setHeroCalories(`${calories} cal/serving`);
    this.renderNutritionSuccess(nutritionData);
    this.setLogButtonState("default");
  }

  showDetail(mealId) {
    const meal = this.currentMeals.find((m) => m.id === mealId);
    if (!meal) return;

    this.currentDetailMeal = meal;
    this.renderDetail(meal);
    this.loadNutrition(meal);

    this.allRecipesSection.style.display = "none";
    this.categoriesSection.style.display = "none";
    this.searchFiltersSection.style.display = "none";
    this.mealDetailsSection.style.display = "block";
  }

  async loadCategoriesAndAreas() {
    try {
      const [categoriesRes, areasRes] = await Promise.all([
        this.mealsService.getCategories(),
        this.mealsService.getAreas(),
      ]);
      this.allCategories = categoriesRes.results;
      this.renderCategoryCards();
      this.renderCuisinePills(areasRes.results);
    } catch (error) {
      this.showError(this.categoriesGrid, "Failed to load categories.");
      this.cuisinePillsContainer.innerHTML = `
      <p class="text-sm text-red-500">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>Failed to load cuisines.
      </p>`;
    }
  }

  toggleCategoriesView() {
    this.categoriesExpanded = !this.categoriesExpanded;

    if (this.categoriesExpanded) {
      this.viewAllText.textContent = "View Less";
      this.viewAllIcon.classList.remove("fa-chevron-right");
      this.viewAllIcon.classList.add("fa-chevron-up");
    } else {
      this.viewAllText.textContent = "View All";
      this.viewAllIcon.classList.remove("fa-chevron-up");
      this.viewAllIcon.classList.add("fa-chevron-right");
    }

    this.renderCategoryCards();
  }

  setViewMode(mode) {
    this.viewMode = mode;

    if (mode === "grid") {
      this.gridViewBtn.classList.add("bg-white", "shadow-sm");
      this.gridViewBtn.querySelector("i").classList.remove("text-gray-500");
      this.gridViewBtn.querySelector("i").classList.add("text-gray-700");

      this.listViewBtn.classList.remove("bg-white", "shadow-sm");
      this.listViewBtn.querySelector("i").classList.remove("text-gray-700");
      this.listViewBtn.querySelector("i").classList.add("text-gray-500");
    } else {
      this.listViewBtn.classList.add("bg-white", "shadow-sm");
      this.listViewBtn.querySelector("i").classList.remove("text-gray-500");
      this.listViewBtn.querySelector("i").classList.add("text-gray-700");

      this.gridViewBtn.classList.remove("bg-white", "shadow-sm");
      this.gridViewBtn.querySelector("i").classList.remove("text-gray-700");
      this.gridViewBtn.querySelector("i").classList.add("text-gray-500");
    }

    this.renderGrid(this.currentMeals, this.currentTotal);
  }

  renderCategoryCards() {
    const categoriesToShow = this.categoriesExpanded
      ? this.allCategories
      : this.allCategories.slice(0, this.visibleCategoriesCount);

    this.categoriesGrid.innerHTML = categoriesToShow
      .map((cat) => {
        const style =
          this.categoryStyles[cat.name] ?? this.defaultCategoryStyle;
        return `
      <div
        class="category-card bg-gradient-to-br ${style.from} ${style.to} rounded-xl p-3 border ${style.border} hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
        data-category="${cat.name}"
      >
        <div class="flex items-center gap-2.5">
          <div class="text-white w-9 h-9 bg-gradient-to-br ${style.iconFrom} ${style.iconTo} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <i class="fa-solid ${style.icon}"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${cat.name}</h3>
          </div>
        </div>
      </div>`;
      })
      .join("");

    this.viewAllBtn.style.display =
      this.allCategories.length > this.visibleCategoriesCount ? "flex" : "none";
  }

  renderCuisinePills(areas) {
    const allPill = `
    <button class="area-pill px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 hover:scale-110 transition-all" data-area="">
      All Cuisines
    </button>`;

    const areaPills = areas
      .map(
        (area) => `
      <button class="area-pill px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 hover:scale-110 transition-all" data-area="${area.name}">
        ${area.name}
      </button>`,
      )
      .join("");

    this.cuisinePillsContainer.innerHTML = allPill + areaPills;

    this.cuisinePillsContainer.addEventListener("click", (event) => {
      const pill = event.target.closest(".area-pill");
      if (!pill) return;

      this.setActivePill(pill);
      this.applyFilter({ area: pill.dataset.area || undefined });
    });
  }

  setActivePill(activePill) {
    const allPills = this.cuisinePillsContainer.querySelectorAll(".area-pill");

    allPills.forEach((pill) => {
      pill.classList.remove("bg-emerald-600", "text-white");
      pill.classList.add("bg-gray-100", "text-gray-700");
    });

    activePill.classList.remove("bg-gray-100", "text-gray-700");
    activePill.classList.add("bg-emerald-600", "text-white");
  }

  setupSearch() {
    this.searchInput.addEventListener("input", () => {
      const query = this.searchInput.value.trim();
      this.applyFilter({ query });
    });
  }

  async applyFilter({ category, area, query } = {}) {
    this.showGridLoading();

    let response;

    try {
      if (query) {
        this.activeFilter = { type: "search", value: query };
        response = await this.mealsService.searchMeals(query, 1, 25);
      } else if (category) {
        this.activeFilter = { type: "category", value: category };
        response = await this.mealsService.filterMeals({
          category,
          area,
          page: 1,
          limit: 25,
        });
      } else if (area) {
        this.activeFilter = { type: "area", value: area };
        response = await this.mealsService.filterMeals({
          category,
          area,
          page: 1,
          limit: 25,
        });
      } else {
        this.activeFilter = { type: "all", value: null };
        response = await this.mealsService.getAllMeals(1, 25);
      }

      this.currentMeals = response.results;
      this.renderGrid(this.currentMeals, response.pagination.total);
    } catch (error) {
      this.showError(this.recipesGrid, "Failed to load recipes.");
      this.recipesCount.textContent = "";
    }
  }

  async loadAllMeals() {
    this.showGridLoading();
    this.activeFilter = { type: "all", value: null };

    try {
      const response = await this.mealsService.getRandomMeals(25);
      this.currentMeals = response.results;
      this.renderGrid(this.currentMeals, this.currentMeals.length);
    } catch (error) {
      this.showError(this.recipesGrid, "Failed to load recipes.");
    }
  }

  showGridLoading() {
    this.recipesGrid.innerHTML = `
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>`;
  }

  buildCountText(count, total) {
    const { type, value } = this.activeFilter;

    if (type === "category") return `Showing ${count} ${value} recipes`;
    if (type === "area") return `Showing ${count} ${value} recipes`;
    if (type === "search") return `Showing ${count} results for "${value}"`;
    if (type === "all") return `Showing ${count} random recipes`;

    return `Showing ${count} of ${total} recipes`;
  }

  renderGrid(meals, total) {
    this.recipesCount.textContent = this.buildCountText(meals.length, total);

    if (meals.length === 0) {
      this.recipesGrid.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
    </div>
    <p class="text-gray-500 text-lg">No recipes found</p>
    <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
</div>`;
      return;
    }

    if (this.viewMode === "grid") {
      this.recipesGrid.className = "grid grid-cols-4 gap-5";
      this.recipesGrid.innerHTML = meals
        .map((meal) => this.renderGridCard(meal))
        .join("");
    } else {
      this.recipesGrid.className = "grid grid-cols-2 gap-5";
      this.recipesGrid.innerHTML = meals
        .map((meal) => this.renderListCard(meal))
        .join("");
    }

    this.recipesGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".recipe-card");
      if (!card) return;
      this.showDetail(card.dataset.mealId);
    });
  }

  renderGridCard(meal) {
    return `
    <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.id}">
      <div class="relative h-48 overflow-hidden">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}" loading="lazy" />
        <div class="absolute bottom-3 left-3 flex gap-2">
          <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${meal.category}</span>
          ${meal.area ? `<span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${meal.area}</span>` : ""}
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
        <p class="text-xs text-gray-600 mb-3 line-clamp-2">Delicious recipe to try!</p>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.category}</span>
          <span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.area ?? "International"}</span>
        </div>
      </div>
    </div>`;
  }

  renderListCard(meal) {
    const firstStep = meal.instructions[0] ?? "";
    const trimmedStep =
      firstStep.length > 100 ? firstStep.slice(0, 100) + "..." : firstStep;

    return `
    <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-row h-40" data-meal-id="${meal.id}">
      <div class="overflow-hidden w-48 h-full">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${meal.thumbnail}" alt="${meal.name}"/>
        </div>
        <div class="p-4">
        <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
        <p class="text-xs text-gray-600 mb-3 line-clamp-2">${trimmedStep}</p>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.category}</span>
          <span class="font-semibold text-gray-900"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.area ?? "International"}</span>
        </div>
      </div>
    </div>`;
  }

  showList() {
    this.mealDetailsSection.style.display = "none";
    this.allRecipesSection.style.display = "block";
    this.categoriesSection.style.display = "block";
    this.searchFiltersSection.style.display = "block";
  }

  renderDetail(meal) {
    document.querySelector("#meal-details h1").textContent = meal.name;

    const ingredientsContainer = document.getElementById(
      "ingredients-container",
    );
    ingredientsContainer.innerHTML = meal.ingredients
      .map(
        (item) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
          <span class="text-gray-700">
            <span class="font-medium text-gray-900">${item.measure}</span> ${item.ingredient}
          </span>
        </div>`,
      )
      .join("");

    const instructionsContainer = document.getElementById(
      "instructions-container",
    );

    instructionsContainer.innerHTML = meal.instructions
      .map(
        (step, index) => `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${index + 1}</div>
          <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
        </div>`,
      )
      .join("");

    const heroImg = document.getElementById("meal-hero-img");
    heroImg.src = meal.thumbnail;
    heroImg.alt = meal.name;
    this.renderVideo(meal.youtube);
  }

  renderVideo(youtubeUrl) {
    const iframe = document.querySelector("#meal-details iframe");
    const videoSection = document.getElementById("video-section");

    if (!youtubeUrl) {
      videoSection.style.display = "none";
      return;
    }

    videoSection.style.display = "block";

    const videoId = this.extractYoutubeId(youtubeUrl);
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
  }

  extractYoutubeId(url) {
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : "";
  }
}

// ===================== FoodLog View ================================

export class FoodLogView {
  constructor(foodLogStore) {
    this.foodLogStore = foodLogStore;

    this.dailyGoals = {
      calories: 2000,
      protein: 50,
      carbs: 250,
      fat: 65,
    };

    this.caloriesBar = document.getElementById("foodlog-calories-bar");
    this.caloriesPercent = document.getElementById("foodlog-calories-percent");
    this.caloriesValue = document.getElementById("foodlog-calories-value");

    this.proteinBar = document.getElementById("foodlog-protein-bar");
    this.proteinPercent = document.getElementById("foodlog-protein-percent");
    this.proteinValue = document.getElementById("foodlog-protein-value");

    this.carbsBar = document.getElementById("foodlog-carbs-bar");
    this.carbsPercent = document.getElementById("foodlog-carbs-percent");
    this.carbsValue = document.getElementById("foodlog-carbs-value");

    this.fatBar = document.getElementById("foodlog-fat-bar");
    this.fatPercent = document.getElementById("foodlog-fat-percent");
    this.fatValue = document.getElementById("foodlog-fat-value");

    this.itemsCount = document.getElementById("foodlog-items-count");
    this.itemsList = document.getElementById("foodlog-items-list");
    this.clearBtn = document.getElementById("foodlog-clear-btn");

    this.clearBtn.addEventListener("click", () => this.confirmClearAll());

    this.render();
  }

  getTodayData() {
    const all = this.foodLogStore.loadAll();
    const dateKey = this.foodLogStore.getTodayKey();
    return (
      all[dateKey] ?? {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: [],
      }
    );
  }

  render() {
    const data = this.getTodayData();

    this.updateBar(
      this.caloriesBar,
      this.caloriesPercent,
      this.caloriesValue,
      data.totalCalories,
      this.dailyGoals.calories,
      "kcal",
    );
    this.updateBar(
      this.proteinBar,
      this.proteinPercent,
      this.proteinValue,
      data.totalProtein,
      this.dailyGoals.protein,
      "g",
    );
    this.updateBar(
      this.carbsBar,
      this.carbsPercent,
      this.carbsValue,
      data.totalCarbs,
      this.dailyGoals.carbs,
      "g",
    );
    this.updateBar(
      this.fatBar,
      this.fatPercent,
      this.fatValue,
      data.totalFat,
      this.dailyGoals.fat,
      "g",
    );

    this.renderItemsList(data.meals);
    this.renderWeeklyOverview();
    this.renderQuickStats();
  }

  updateBar(barEl, percentEl, valueEl, current, goal, unit) {
    const percent = Math.min(Math.round((current / goal) * 100), 100);
    barEl.style.width = `${percent}%`;
    percentEl.textContent = `${percent}%`;
    valueEl.textContent = `${current} ${unit}`;

    if (percent >= 100) {
      barEl.classList.add("bg-red-500");
      barEl.classList.remove(
        "bg-emerald-500",
        "bg-blue-500",
        "bg-amber-500",
        "bg-purple-500",
      );
    } else {
      barEl.classList.remove("bg-red-500");

      if (barEl === this.caloriesBar) barEl.classList.add("bg-emerald-500");
      if (barEl === this.proteinBar) barEl.classList.add("bg-blue-500");
      if (barEl === this.carbsBar) barEl.classList.add("bg-amber-500");
      if (barEl === this.fatBar) barEl.classList.add("bg-purple-500");
    }
  }

  renderItemsList(meals) {
    this.itemsCount.textContent = `Logged Items (${meals.length})`;
    this.clearBtn.style.display = meals.length > 0 ? "inline-flex" : "none";

    if (meals.length === 0) {
      this.itemsList.innerHTML = `
      <div class="text-center py-12">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-utensils text-3xl text-gray-300"></i>
        </div>
        <p class="text-gray-500 font-medium mb-2">No food logged today</p>
        <p class="text-gray-400 text-sm mb-4">Start tracking your nutrition by logging meals or scanning products</p>
        <div class="flex justify-center gap-3">
          <a href="#meals" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
            <i class="fa-solid fa-plus"></i>
            Browse Recipes
          </a>
          <a href="/products" class="nav-link inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-barcode"></i>
            Scan Product
          </a>
        </div>
      </div>`;
      return;
    }

    this.itemsList.innerHTML = meals
      .map((meal, index) => this.renderItemCard(meal, index))
      .join("");

    this.itemsList.querySelectorAll(".delete-item-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        this.deleteItem(index);
      });
    });
  }

  renderItemCard(meal, index) {
    const time = new Date(meal.loggedAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    const isProduct = meal.type === "product";
    const typeLabel = isProduct ? "Product" : "Recipe";
    const typeColor = isProduct ? "text-blue-600" : "text-emerald-600";

    const subtitleLine = isProduct
      ? `${meal.brand ? `${meal.brand} • ` : ""}<span class="${typeColor} font-medium">${typeLabel}</span>`
      : `${meal.servings} serving${meal.servings !== 1 ? "s" : ""} • <span class="${typeColor} font-medium">${typeLabel}</span>`;

    const imageHtml = meal.thumbnail
      ? `<img src="${meal.thumbnail}" alt="${meal.name}" class="w-14 h-14 rounded-lg object-cover" />`
      : `<div class="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
         <i class="fa-solid fa-barcode text-blue-500 text-xl"></i>
       </div>`;

    return `
  <div class="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
    ${imageHtml}
    <div class="flex-1">
      <p class="font-bold text-gray-900">${meal.name}</p>
      <p class="text-sm text-gray-500">${subtitleLine}</p>
      <p class="text-xs text-gray-400">${time}</p>
    </div>
    <div class="text-right">
      <p class="text-xl font-bold text-emerald-600">${meal.nutrition.calories}</p>
      <p class="text-xs text-gray-500">kcal</p>
    </div>
    <div class="flex gap-2">
      <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">${meal.nutrition.protein}g P</span>
      <span class="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full">${meal.nutrition.carbs}g C</span>
      <span class="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full">${meal.nutrition.fat}g F</span>
    </div>
    <button class="delete-item-btn text-gray-400 hover:text-red-500 transition-colors" data-index="${index}">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>`;
  }

  deleteItem(index) {
    const all = this.foodLogStore.loadAll();
    const dateKey = this.foodLogStore.getTodayKey();
    const dayData = all[dateKey];
    if (!dayData) return;

    const removed = dayData.meals[index];
    if (!removed) return;

    dayData.meals.splice(index, 1);
    dayData.totalCalories -= removed.nutrition.calories;
    dayData.totalProtein -= removed.nutrition.protein;
    dayData.totalCarbs -= removed.nutrition.carbs;
    dayData.totalFat -= removed.nutrition.fat;

    this.foodLogStore.saveAll(all);
    this.render();

    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "info",
      title: "Item removed from log",
      showConfirmButton: false,
      timer: 2000,
      background: "#2563eb",
      color: "#ffffff",
      iconColor: "#ffffff",
    });
  }

  confirmClearAll() {
    Swal.fire({
      icon: "warning",
      title: "Clear Today's Log?",
      text: "This will remove all logged food items for today.",
      showCancelButton: true,
      confirmButtonText: "Yes, clear it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#475569",
    }).then((result) => {
      if (result.isConfirmed) {
        this.clearAll();
      }
    });
  }

  clearAll() {
    const all = this.foodLogStore.loadAll();
    const dateKey = this.foodLogStore.getTodayKey();

    delete all[dateKey];

    this.foodLogStore.saveAll(all);
    this.render();

    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "success",
      title: "Today's log cleared",
      showConfirmButton: false,
      timer: 2000,
      background: "#10b981",
      color: "#ffffff",
      iconColor: "#ffffff",
    });
  }

  getLastSevenDays() {
    const days = [];
    const today = new Date();
    const dayOfWeek = today.getDay();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${day}`;

      days.push({
        key,
        label: date.toLocaleDateString([], { weekday: "short" }),
        dayNumber: date.getDate(),
        isToday: key === this.foodLogStore.getTodayKey(),
      });
    }

    return days;
  }

  renderWeeklyOverview() {
    const all = this.foodLogStore.loadAll();
    const days = this.getLastSevenDays();
    const weeklyGrid = document.getElementById("foodlog-weekly-grid");

    weeklyGrid.innerHTML = days
      .map((day) => {
        const dayLog = all[day.key];
        const calories = dayLog ? dayLog.totalCalories : 0;
        const itemCount = dayLog ? dayLog.meals.length : 0;

        const highlightClass = day.isToday ? "bg-indigo-100 rounded-xl" : "";
        const numberColor = calories > 0 ? "text-emerald-600" : "text-gray-300";

        return `
        <div class="text-center ${highlightClass}">
          <p class="text-xs text-gray-500 mb-1">${day.label}</p>
          <p class="text-sm font-medium text-gray-900">${day.dayNumber}</p>
          <div class="mt-2 ${numberColor}">
            <p class="text-lg font-bold">${calories}</p>
            <p class="text-xs">kcal</p>
          </div>
          ${itemCount > 0 ? `<p class="text-xs text-gray-500 mt-1">${itemCount} items</p>` : ""}
        </div>`;
      })
      .join("");
  }

  renderQuickStats() {
    const all = this.foodLogStore.loadAll();
    const days = this.getLastSevenDays();

    let totalCalories = 0;
    let totalItems = 0;
    let daysOnGoal = 0;

    days.forEach((day) => {
      const dayLog = all[day.key];
      if (!dayLog) return;

      totalCalories += dayLog.totalCalories;
      totalItems += dayLog.meals.length;

      if (
        dayLog.totalCalories > 0 &&
        dayLog.totalCalories <= this.dailyGoals.calories
      ) {
        daysOnGoal++;
      }
    });

    const weeklyAverage = Math.round(totalCalories / 7);

    document.getElementById("foodlog-weekly-average").textContent =
      `${weeklyAverage} kcal`;
    document.getElementById("foodlog-total-items").textContent =
      `${totalItems} items`;
    document.getElementById("foodlog-days-on-goal").textContent =
      `${daysOnGoal} / 7`;
  }
}

// ===================== Product View ================================

export class ProductsView {
  constructor(productsService, foodLogStore, onProductLogged) {
    this.productsService = productsService;
    this.foodLogStore = foodLogStore;
    this.onProductLogged = onProductLogged;
    this.currentProducts = [];
    this.activeGrade = "";

    this.gradeInfo = {
      a: { color: "#1e8f4e", label: "Excellent" },
      b: { color: "#7ac547", label: "Good" },
      c: { color: "#f9c700", label: "Average" },
      d: { color: "#f2762e", label: "Poor" },
      e: { color: "#e63e11", label: "Bad" },
      unknown: { color: "#9ca3af", label: "Unknown" },
    };

    this.novaInfo = {
      1: "Unprocessed",
      2: "Processed culinary",
      3: "Processed",
      4: "Ultra-processed",
    };

    this.searchInput = document.getElementById("product-search-input");
    this.searchBtn = document.getElementById("search-product-btn");
    this.barcodeInput = document.getElementById("barcode-input");
    this.lookupBtn = document.getElementById("lookup-barcode-btn");
    this.categoriesContainer = document.getElementById("product-categories");
    this.gradeFilterButtons = document.querySelectorAll(".nutri-score-filter");
    this.productsGrid = document.getElementById("products-grid");
    this.productsCount = document.getElementById("products-count");

    this.injectProductModalHtml();
    this.modalElement = document.getElementById("product-detail-modal");
    this.modalImage = document.getElementById("modal-product-image");
    this.modalBrand = document.getElementById("modal-product-brand");
    this.modalName = document.getElementById("modal-product-name");
    this.modalBadgesContainer = document.getElementById(
      "modal-badges-container",
    );
    this.modalCalories = document.getElementById("modal-product-calories");
    this.modalProteinBar = document.getElementById("modal-protein-bar");
    this.modalProteinValue = document.getElementById("modal-protein-value");
    this.modalCarbsBar = document.getElementById("modal-carbs-bar");
    this.modalCarbsValue = document.getElementById("modal-carbs-value");
    this.modalFatBar = document.getElementById("modal-fat-bar");
    this.modalFatValue = document.getElementById("modal-fat-value");
    this.modalSugarBar = document.getElementById("modal-sugar-bar");
    this.modalSugarValue = document.getElementById("modal-sugar-value");
    this.modalSaturatedFat = document.getElementById("modal-saturated-fat");
    this.modalFiber = document.getElementById("modal-fiber");
    this.modalSalt = document.getElementById("modal-salt");

    this.addToLogBtn = document.getElementById("add-product-to-log");
    this.addToLogBtn.addEventListener("click", () => this.handleLogProduct());

    this.modalElement.addEventListener("click", (event) => {
      if (
        event.target === this.modalElement ||
        event.target.closest(".close-product-modal")
      ) {
        this.closeProductModal();
      }
    });

    this.productsGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".product-card");
      if (!card) return;
      this.openProductModal(card.dataset.barcode);
    });

    this.searchBtn.addEventListener("click", () => this.handleSearch());
    this.lookupBtn.addEventListener("click", () => this.handleBarcodeLookup());
    this.categoriesContainer.addEventListener("click", (event) => {
      const btn = event.target.closest(".product-category-btn");
      if (!btn) return;
      this.handleCategoryClick(btn.dataset.categoryId);
    });

    this.gradeFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.handleGradeFilter(btn));
    });

    this.loadCategories();
    this.renderGrid([], 0, "");
  }

  async handleSearch() {
    const query = this.searchInput.value.trim();
    if (!query) return;

    this.showLoading();

    try {
      const response = await this.productsService.searchProducts(query, 1, 24);
      this.currentProducts = response.results;
      this.currentTotal = response.pagination.total;
      this.currentLabel = `results for "${query}"`;
      this.applyGradeFilter();
    } catch (error) {
      this.showError();
    }
  }

  async handleBarcodeLookup() {
    const barcode = this.barcodeInput.value.trim();
    if (!barcode) return;

    this.showLoading();

    try {
      const response = await this.productsService.getProductByBarcode(barcode);
      this.currentProducts = [response.result];
      this.currentTotal = response.pagination.total;
      this.currentLabel = "result";
      this.applyGradeFilter();
    } catch (error) {
      this.showError("Product not found for this barcode.");
    }
  }

  async handleCategoryClick(categoryId) {
    this.showLoading();

    try {
      const response = await this.productsService.getProductsByCategory(
        categoryId,
        1,
        24,
      );
      this.currentProducts = response.results;
      this.currentTotal = response.pagination.total;
      this.currentLabel = "products";
      this.applyGradeFilter();
    } catch (error) {
      this.showError();
    }
  }

  handleGradeFilter(clickedBtn) {
    this.activeGrade = clickedBtn.dataset.grade;
    this.setActiveGradeButton(clickedBtn);
    this.applyGradeFilter();
  }

  setActiveGradeButton(activeBtn) {
    this.gradeFilterButtons.forEach((btn) => {
      btn.classList.remove("ring-2", "ring-offset-1");
    });
    activeBtn.classList.add("ring-2", "ring-offset-1");
  }

  applyGradeFilter() {
    const filtered = this.activeGrade
      ? this.currentProducts.filter(
          (p) => p.nutritionGrade === this.activeGrade,
        )
      : this.currentProducts;

    this.renderGrid(
      filtered,
      this.currentTotal ?? filtered.length,
      this.currentLabel ?? "",
    );
  }

  showLoading() {
    this.productsGrid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>`;
  }

  showError(message = "Something went wrong. Please try again.") {
    this.productsGrid.innerHTML = `
    <p class="col-span-full text-center text-red-500 py-8">
      <i class="fa-solid fa-circle-exclamation mr-1"></i>${message}
    </p>`;
  }

  renderGrid(products, total, label) {
    this.productsCount.textContent = `Showing ${products.length} of ${total} ${label}`;

    if (products.length === 0) {
      this.productsGrid.innerHTML = `
          <div id="products-empty" style="grid-column: 1 / -1;" class="py-12">
            <div class="text-center">
              <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-box-open text-3xl text-gray-400"></i>
              </div>
              <p class="text-gray-500 text-lg mb-2">No products to display</p>
              <p class="text-gray-400 text-sm">Search for a product or browse by category</p>
            </div>
          </div>`;
      return;
    }

    this.productsGrid.innerHTML = products
      .map((p) => this.renderProductCard(p))
      .join("");
  }

  renderProductCard(product) {
    const gradeColors = {
      a: "bg-green-500",
      b: "bg-lime-500",
      c: "bg-yellow-500",
      d: "bg-orange-500",
      e: "bg-red-500",
      unknown: "bg-gray-400",
    };
    const gradeColor = gradeColors[product.nutritionGrade] ?? "bg-gray-400";
    const image = product.image ?? "";

    return `
    <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group" data-barcode="${product.barcode}">
      <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        ${
          image
            ? `<img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${image}" alt="${product.name}" loading="lazy" />`
            : `<i class="fa-solid fa-box-open text-4xl text-gray-300"></i>`
        }
        <div class="absolute top-2 left-2 ${gradeColor} text-white text-xs font-bold px-2 py-1 rounded uppercase">
          Nutri-Score ${product.nutritionGrade}
        </div>
        ${
          product.novaGroup
            ? `<div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${product.novaGroup}">${product.novaGroup}</div>`
            : ""
        }
      </div>
      <div class="p-4">
        <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brand ?? ""}</p>
        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">${product.name}</h3>
        <div class="grid grid-cols-4 gap-1 text-center">
          <div class="bg-emerald-50 rounded p-1.5">
            <p class="text-xs font-bold text-emerald-700">${Math.round(product.nutrients.protein)}g</p>
            <p class="text-[10px] text-gray-500">Protein</p>
          </div>
          <div class="bg-blue-50 rounded p-1.5">
            <p class="text-xs font-bold text-blue-700">${Math.round(product.nutrients.carbs)}g</p>
            <p class="text-[10px] text-gray-500">Carbs</p>
          </div>
          <div class="bg-purple-50 rounded p-1.5">
            <p class="text-xs font-bold text-purple-700">${Math.round(product.nutrients.fat)}g</p>
            <p class="text-[10px] text-gray-500">Fat</p>
          </div>
          <div class="bg-orange-50 rounded p-1.5">
            <p class="text-xs font-bold text-orange-700">${Math.round(product.nutrients.sugar)}g</p>
            <p class="text-[10px] text-gray-500">Sugar</p>
          </div>
        </div>
      </div>
    </div>`;
  }

  renderCategories(categories) {
    const styleMap = {
      "breakfast-cereals": {
        gradient: "from-amber-500 to-orange-500",
        icon: "fa-wheat-awn",
      },
      beverages: {
        gradient: "from-blue-500 to-cyan-500",
        icon: "fa-bottle-water",
      },
      snacks: { gradient: "from-purple-500 to-pink-500", icon: "fa-cookie" },
      dairies: { gradient: "from-sky-400 to-blue-500", icon: "fa-cheese" },
      fruits: { gradient: "from-red-500 to-rose-500", icon: "fa-apple-whole" },
      vegetables: {
        gradient: "from-green-500 to-emerald-500",
        icon: "fa-carrot",
      },
      breads: {
        gradient: "from-amber-600 to-yellow-500",
        icon: "fa-bread-slice",
      },
      meats: {
        gradient: "from-red-600 to-rose-600",
        icon: "fa-drumstick-bite",
      },
      sauces: { gradient: "from-orange-500 to-red-500", icon: "fa-jar" },

      cheeses: { gradient: "from-yellow-400 to-amber-500", icon: "fa-cheese" },
      yogurts: { gradient: "from-cyan-400 to-blue-500", icon: "fa-bowl-food" },
      chocolates: {
        gradient: "from-amber-600 to-orange-500",
        icon: "fa-cookie-bite",
      },
      biscuits: { gradient: "from-orange-400 to-amber-500", icon: "fa-cookie" },
      "ice-creams": {
        gradient: "from-pink-400 to-rose-500",
        icon: "fa-ice-cream",
      },
      waters: { gradient: "from-cyan-400 to-blue-500", icon: "fa-glass-water" },
      sodas: { gradient: "from-red-400 to-pink-500", icon: "fa-bottle-water" },
      coffees: { gradient: "from-stone-400 to-amber-500", icon: "fa-mug-hot" },
      teas: { gradient: "from-green-400 to-emerald-500", icon: "fa-mug-hot" },
      fishes: { gradient: "from-teal-400 to-cyan-500", icon: "fa-fish" },
      "plant-based-foods": {
        gradient: "from-lime-400 to-green-500",
        icon: "fa-seedling",
      },
      "chips-and-fries": {
        gradient: "from-yellow-400 to-orange-500",
        icon: "fa-cookie",
      },
      spreads: { gradient: "from-amber-500 to-orange-500", icon: "fa-jar" },
      pastas: {
        gradient: "from-yellow-400 to-amber-500",
        icon: "fa-bowl-food",
      },
      desserts: {
        gradient: "from-pink-400 to-purple-600",
        icon: "fa-ice-cream",
      },
    };

    const defaultStyle = {
      gradient: "from-blue-400 to-blue-500",
      icon: "fa-utensils",
    };

    this.categoriesContainer.innerHTML = categories
      .map((cat) => {
        const style = styleMap[cat.id] ?? defaultStyle;
        return `
        <button class="product-category-btn flex-shrink-0 px-5 py-3 bg-gradient-to-r ${style.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all" data-category-id="${cat.id}">
          <i class="fa-solid ${style.icon} mr-2"></i>${cat.name}
        </button>`;
      })
      .join("");

    this.categoriesContainer.addEventListener("click", (event) => {
      const btn = event.target.closest(".product-category-btn");
      if (!btn) return;
      this.handleCategoryClick(btn.dataset.categoryId);
    });
  }

  async loadCategories() {
    try {
      const response = await this.productsService.getCategories();
      this.renderCategories(response.results);
    } catch (error) {
      console.error("Failed to load product categories:", error);
    }
  }

  injectProductModalHtml() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" id="product-detail-modal" style="display: none;">
      <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-start gap-6 mb-6">
            <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              <img id="modal-product-image" src="" alt="" class="w-full h-full object-contain">
            </div>
            <div class="flex-1">
              <p id="modal-product-brand" class="text-sm text-emerald-600 font-semibold mb-1"></p>
              <h2 id="modal-product-name" class="text-2xl font-bold text-gray-900 mb-2"></h2>
              <div class="flex items-center gap-3" id="modal-badges-container"></div>
            </div>
            <button class="close-product-modal text-gray-400 hover:text-gray-600">
              <i class="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>

          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-emerald-600"></i>
              Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
            </h3>

            <div class="text-center mb-4 pb-4 border-b border-emerald-200">
              <p id="modal-product-calories" class="text-4xl font-bold text-gray-900">0</p>
              <p class="text-sm text-gray-500">Calories</p>
            </div>

            <div class="grid grid-cols-4 gap-4">
              <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div id="modal-protein-bar" class="bg-emerald-500 h-2 rounded-full" style="width: 0%"></div>
                </div>
                <p id="modal-protein-value" class="text-lg font-bold text-emerald-600">0g</p>
                <p class="text-xs text-gray-500">Protein</p>
              </div>
              <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div id="modal-carbs-bar" class="bg-blue-500 h-2 rounded-full" style="width: 0%"></div>
                </div>
                <p id="modal-carbs-value" class="text-lg font-bold text-blue-600">0g</p>
                <p class="text-xs text-gray-500">Carbs</p>
              </div>
              <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div id="modal-fat-bar" class="bg-purple-500 h-2 rounded-full" style="width: 0%"></div>
                </div>
                <p id="modal-fat-value" class="text-lg font-bold text-purple-600">0g</p>
                <p class="text-xs text-gray-500">Fat</p>
              </div>
              <div class="text-center">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div id="modal-sugar-bar" class="bg-orange-500 h-2 rounded-full" style="width: 0%"></div>
                </div>
                <p id="modal-sugar-value" class="text-lg font-bold text-orange-600">0g</p>
                <p class="text-xs text-gray-500">Sugar</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
              <div class="text-center">
                <p id="modal-saturated-fat" class="text-sm font-semibold text-gray-900">0g</p>
                <p class="text-xs text-gray-500">Saturated Fat</p>
              </div>
              <div class="text-center">
                <p id="modal-fiber" class="text-sm font-semibold text-gray-900">0g</p>
                <p class="text-xs text-gray-500">Fiber</p>
              </div>
              <div class="text-center">
                <p id="modal-salt" class="text-sm font-semibold text-gray-900">0g</p>
                <p class="text-xs text-gray-500">Salt</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button id="add-product-to-log" class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">
              <i class="fa-solid fa-plus mr-2"></i>Log This Food
            </button>
            <button class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>`;

    document.body.appendChild(wrapper.firstElementChild);
  }

  openProductModal(barcode) {
    const product = this.currentProducts.find((p) => p.barcode === barcode);
    if (!product) return;
    this.currentModalProduct = product;

    const gradeKey = product.nutritionGrade ?? "unknown";
    const grade = this.gradeInfo[gradeKey] ?? this.gradeInfo.unknown;
    const gradeLetter = gradeKey === "unknown" ? "?" : gradeKey.toUpperCase();

    this.modalImage.src = product.image ?? "";
    this.modalImage.alt = product.name;
    this.modalBrand.textContent = product.brand ?? "";
    this.modalName.textContent = product.name;

    this.modalBadgesContainer.innerHTML = `
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${grade.color}20">
      <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: ${grade.color}">
        ${gradeLetter}
      </span>
      <div>
        <p class="text-xs font-bold" style="color: ${grade.color}">Nutri-Score</p>
        <p class="text-[10px] text-gray-600">${grade.label}</p>
      </div>
    </div>
    ${
      product.novaGroup
        ? `<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${grade.color}20">
             <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${grade.color}">
               ${product.novaGroup}
             </span>
             <div>
               <p class="text-xs font-bold" style="color: ${grade.color}">NOVA</p>
               <p class="text-[10px] text-gray-600">${this.novaInfo[product.novaGroup] ?? ""}</p>
             </div>
           </div>`
        : ""
    }`;

    const n = product.nutrients;
    this.modalCalories.textContent = Math.round(n.calories ?? 0);
    this.setNutrientBar(
      this.modalProteinBar,
      this.modalProteinValue,
      n.protein,
      50,
    );
    this.setNutrientBar(this.modalCarbsBar, this.modalCarbsValue, n.carbs, 250);
    this.setNutrientBar(this.modalFatBar, this.modalFatValue, n.fat, 65);
    this.setNutrientBar(this.modalSugarBar, this.modalSugarValue, n.sugar, 50);

    this.modalSaturatedFat.textContent = `${(n.saturatedFat ?? 0).toFixed(1)}g`;
    this.modalFiber.textContent = `${(n.fiber ?? 0).toFixed(1)}g`;
    this.modalSalt.textContent = `${(n.salt ?? 0).toFixed(2)}g`;

    this.modalElement.style.display = "flex";
  }

  setNutrientBar(barEl, valueEl, value, dailyValue) {
    const percent = Math.min(
      Math.round(((value ?? 0) / dailyValue) * 100),
      100,
    );
    barEl.style.width = `${percent}%`;
    valueEl.textContent = `${(value ?? 0).toFixed(1)}g`;
  }

  closeProductModal() {
    this.modalElement.style.display = "none";
  }

  handleLogProduct() {
    const product = this.currentModalProduct;
    if (!product) return;

    const n = product.nutrients;

    const entry = {
      type: "product",
      name: product.name,
      brand: product.brand ?? "",
      barcode: product.barcode,
      thumbnail: product.image ?? "",
      servings: 1,
      nutrition: {
        calories: Math.round(n.calories ?? 0),
        protein: Math.round(n.protein ?? 0),
        carbs: Math.round(n.carbs ?? 0),
        fat: Math.round(n.fat ?? 0),
      },
      loggedAt: new Date().toISOString(),
    };

    this.foodLogStore.addMeal(entry);
    this.onProductLogged?.();
    this.closeProductModal();

    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "success",
      title: `${product.name} logged to your daily intake!`,
      showConfirmButton: false,
      timer: 2500,
      background: "#059669",
      color: "#ffffff",
      iconColor: "#ffffff",
    });
  }
}
