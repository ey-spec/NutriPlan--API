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

  showError(message = "Something went wrong. Please try again.") {
    document.getElementById("all-recipes-section").innerHTML = `
    <p class="text-sm text-red-500 text-center py-4 col-span-full">
      <i class="fa-solid fa-circle-exclamation mr-1"></i>${message}
    </p>`;

    document.getElementById("search-filters-section").classList.add("hidden");
    document.getElementById("meal-categories-section").classList.add("hidden");
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
      this.showError();
      this.cuisinePillsContainer.innerHTML = `
      <p class="text-sm text-red-500">
        <i class="fa-solid fa-circle-exclamation mr-1"></i>Failed to load cuisines.
      </p>`;
    }
  }

  toggleCategoriesView() {
    this.categoriesExpanded = !this.categoriesExpanded;
    this.viewAllIcon = document.getElementById("view-all-categories-icon");

    if (this.categoriesExpanded) {
      this.viewAllText.textContent = "Show Less";
      this.viewAllIcon.outerHTML = `<i id="view-all-categories-icon" class="fa-solid fa-chevron-up text-xs"></i>`;
    } else {
      this.viewAllText.textContent = "View All";
      this.viewAllIcon.classList.remove("fa-chevron-up");
      this.viewAllIcon.outerHTML = `<i id="view-all-categories-icon" class="fa-solid fa-chevron-right text-xs"></i>`;
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
    const limitedAreas = areas.slice(0, 12);

    const allPill = `
  <button class="area-pill px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 hover:scale-110 transition-all" data-area="">
    All Cuisines
  </button>`;

    const areaPills = limitedAreas
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
      this.showError();
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
      this.showError();
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
