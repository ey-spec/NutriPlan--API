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
  <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
    <div class="flex items-center gap-4">
      ${imageHtml}
      <div>
        <p class="font-bold text-gray-900">${meal.name}</p>
        <p class="text-sm text-gray-500">${subtitleLine}</p>
        <p class="text-xs text-gray-400">${time}</p>
      </div>
    </div>
    <div class = "flex items-center gap-4">
      <div class="text-right">
        <p class="text-xl font-bold text-emerald-600">${meal.nutrition.calories}</p>
        <p class="text-xs text-gray-500">kcal</p>
      </div>
      <div class="hidden md:flex gap-2 text-xs text-gray-500">
        <span class="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">${meal.nutrition.protein}g P</span>
        <span class="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full">${meal.nutrition.carbs}g C</span>
        <span class="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full">${meal.nutrition.fat}g F</span>
      </div>
      <button class="delete-item-btn text-gray-400 hover:text-red-500 transition-colors" data-index="${index}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
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

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

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