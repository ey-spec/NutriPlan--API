// ===================== API Layer ================================

export class ApiService {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  buildUrl(endpoint, params = {}) {
    const url = new URL(this.baseURL + endpoint);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });

    return url.toString();
  }

  async get(endpoint, params = {}) {
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async post(endpoint, body = {}) {
    const url = this.buildUrl(endpoint);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

// ===================== Nutrition Services ================================

export class NutritionService extends ApiService {
  constructor(baseURL, apiKey) {
    super(baseURL, apiKey);
  }

  async analyzeNutrition(recipeName, ingredients) {
    return this.post("nutrition/analyze", { recipeName, ingredients });
  }
}

// ===================== Meals Services ================================

export class MealsService extends ApiService {
  constructor(baseURL, apiKey) {
    super(baseURL, apiKey);
  }

  async searchMeals(query, page, limit) {
    return this.get("meals/search", { q: query, page, limit });
  }

  async filterMeals({ category, area, ingredient, page, limit } = {}) {
    return this.get("meals/filter", {
      category,
      area,
      ingredient,
      page,
      limit,
    });
  }

  async getAllMeals(page, limit) {
    return this.searchMeals("", page, limit);
  }

  async getCategories() {
    return this.get("meals/categories");
  }

  async getAreas() {
    return this.get("meals/areas");
  }

  async getRandomMeals(count) {
    return this.get("meals/random", { count });
  }
}

// ===================== Product Services ================================

export class ProductsService extends ApiService {
  constructor(baseURL, apiKey) {
    super(baseURL, apiKey);
  }

  async searchProducts(query, page, limit) {
    return this.get("products/search", { q: query, page, limit });
  }

  async getProductByBarcode(barcode) {
    return this.get(`products/barcode/${barcode}`);
  }

  async getCategories() {
    return this.get("products/categories");
  }

  async getProductsByCategory(categoryId, page, limit) {
    return this.get(`products/category/${categoryId}`, { page, limit });
  }
}
