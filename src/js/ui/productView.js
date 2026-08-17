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
    this.searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.handleSearch();
      }
    });

    this.barcodeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.handleBarcodeLookup();
      }
    });
    this.categoriesContainer.addEventListener("click", (event) => {
      const btn = event.target.closest(".product-category-btn");
      if (!btn) return;
      this.handleCategoryClick(btn.dataset.categoryId);
    });

    this.gradeFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.handleGradeFilter(btn));
    });

    this.loadCategories();
    this.loadInitialProducts();
  }

  async loadInitialProducts() {
    this.showLoading();

    try {
      const response = await this.productsService.searchProducts("", 1, 24);
      this.currentProducts = response.results;
      this.currentLabel = "All Products";
      this.applyGradeFilter();
    } catch (error) {
      this.showError();
    }
  }

  showNotFoundToast(message = "Product not found in database") {
    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "error",
      title: message,
      showConfirmButton: false,
      timer: 2500,
      background: "#ef4444",
      color: "#ffffff",
      iconColor: "#ffffff",
    });
  }

  async handleSearch() {
    const query = this.searchInput.value.trim();
    if (!query) {
      this.loadInitialProducts();
      return;
    }

    this.showLoading();

    try {
      const response = await this.productsService.searchProducts(query, 1, 24);
      this.currentProducts = response.results;
      this.currentLabel = `"${query}"`;
      this.applyGradeFilter();

      if (response.results.length === 0) {
        this.showNotFoundToast(`No products found for "${query}"`);
      }
    } catch (error) {
      this.showError();
    }
  }

  async handleBarcodeLookup() {
    const barcode = this.barcodeInput.value.trim();
    if (!barcode) {
      this.loadInitialProducts();
      return;
    }

    this.showLoading();

    try {
      const response = await this.productsService.getProductByBarcode(barcode);
      this.currentProducts = [response.result];
      this.currentTotal = 1;
      this.currentLabel = "this barcode";
      this.applyGradeFilter();
    } catch (error) {
      this.currentProducts = [];
      this.currentTotal = 0;
      this.currentLabel = `"${barcode}"`;

      this.renderGrid([], this.currentLabel);
      this.showNotFoundToast();
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
      this.currentLabel = ` "${categoryId}"`;
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

    this.renderGrid(filtered, this.currentLabel ?? "");
  }

  showLoading() {
    this.productsGrid.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>`;
  }

  showError(message = "Something went wrong. Please try again.") {
    document.getElementById("products-section").innerHTML = `
    <p class="col-span-full text-center text-red-500 py-8">
      <i class="fa-solid fa-circle-exclamation mr-1"></i>${message}
    </p>`;
  }

  renderGrid(products, label) {
    this.productsCount.textContent = `Showing ${products.length} Product of ${label}`;

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
