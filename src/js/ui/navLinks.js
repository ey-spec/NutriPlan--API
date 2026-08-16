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