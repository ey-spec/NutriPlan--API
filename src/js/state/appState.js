// ===================== FoodLog storage ================================

export class FoodLogStore {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  loadAll() {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : {};
  }

  saveAll(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  addMeal(meal) {
    const dateKey = this.getTodayKey();
    const all = this.loadAll();

    if (!all[dateKey]) {
      all[dateKey] = {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        meals: [],
      };
    }

    all[dateKey].meals.push(meal);
    all[dateKey].totalCalories += meal.nutrition.calories;
    all[dateKey].totalProtein += meal.nutrition.protein;
    all[dateKey].totalCarbs += meal.nutrition.carbs;
    all[dateKey].totalFat += meal.nutrition.fat;

    this.saveAll(all);
    return all[dateKey];
  }
}