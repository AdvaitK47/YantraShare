/**
 * YantraShare - Shared Navigation & Persona Switcher
 * Provides clean, monotonous, monochrome navigation bar and demo switcher
 */

document.addEventListener("DOMContentLoaded", () => {
  renderSharedHeader();
  renderSharedFooter();
  setupPersonaSwitcher();
  highlightActiveNav();
});

function renderSharedHeader() {
  const headerContainer = document.getElementById("site-header-container");
  if (!headerContainer) return;

  const user = window.yantraStore.getCurrentUser();
  const isAdmin = user.role === "admin" || user.role === "manager";

  headerContainer.innerHTML = `
    <!-- Top Persona Demo Bar (Monochrome, Elegant, No Emojis) -->
    <div class="demo-top-bar">
      <div class="container demo-bar-inner">
        <div class="demo-title">
          <span class="demo-tag">DEMO MODE</span>
          <span class="demo-label">Active Persona:</span>
        </div>
        
        <div class="persona-chips">
          <button class="persona-chip ${user.id === 'farmer_a' ? 'active' : ''}" data-persona="farmer_a">
            Farmer A <span class="sub">(Gurpreet • Small)</span>
          </button>
          <button class="persona-chip ${user.id === 'farmer_b' ? 'active' : ''}" data-persona="farmer_b">
            Farmer B <span class="sub">(Balwinder • Large)</span>
          </button>
          <button class="persona-chip ${user.id === 'owner' ? 'active' : ''}" data-persona="owner">
            CHC Owner <span class="sub">(Harinder Kaur)</span>
          </button>
          <button class="persona-chip ${user.id === 'manager' ? 'active' : ''}" data-persona="manager">
            Society Manager <span class="sub">(Jaspal)</span>
          </button>
          <button class="persona-chip ${user.id === 'admin' ? 'active' : ''}" data-persona="admin">
            Admin <span class="sub">(Dr. Sarao)</span>
          </button>
        </div>

        <div class="demo-info">
          Punjab CRM Scheme • CEEW Model
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar (Clean, Black Capsule Pill per reference) -->
    <header class="main-navbar-wrapper">
      <div class="container main-navbar-flex">
        <!-- Brand Logo (Clean Monochrome) -->
        <a href="index.html" class="brand-link">
          <div class="brand-glyph">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="brand-name">YantraShare</span>
          <span class="brand-version">CRM</span>
        </a>

        <!-- Aesthetic Black Center Pill (Matches User Reference Image) -->
        <nav class="center-black-pill">
          <a href="index.html" class="pill-nav-item" data-page="home">Home</a>
          <a href="tools.html" class="pill-nav-item" data-page="tools">Tools & Machinery</a>
          <a href="list-equipment.html" class="pill-nav-item" data-page="list">List Equipment</a>
          <a href="dispatch.html" class="pill-nav-item" data-page="dispatch">Dispatch Board</a>
          <a href="profile.html" class="pill-nav-item" data-page="profile">Your Profile</a>
          ${isAdmin ? `<a href="admin.html" class="pill-nav-item admin-link" data-page="admin">Admin Audit</a>` : ''}
        </nav>

        <!-- Right Side User Actions -->
        <div class="right-user-actions">
          <a href="profile.html" class="user-pill-btn" title="View Profile & Farming History">
            <img src="${user.avatar}" alt="${user.name}" class="avatar-mini">
            <div class="user-pill-text">
              <span class="user-name-line">${user.name}</span>
              <span class="user-tier-line">${user.category} • ${user.district}</span>
            </div>
          </a>

          <a href="login.html" class="btn-signup-pill">Sign In</a>
        </div>
      </div>
    </header>
  `;
}

function renderSharedFooter() {
  const footerContainer = document.getElementById("site-footer-container");
  if (!footerContainer) return;

  footerContainer.innerHTML = `
    <footer class="clean-footer">
      <div class="container">
        <div class="footer-top-row">
          <div>
            <div class="brand-link footer-brand">
              <div class="brand-glyph">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span class="brand-name">YantraShare</span>
            </div>
            <p class="footer-desc">
              Fair, accountable sharing of idle crop-residue management machinery at Custom Hiring Centres (CHCs). Built for clean air, productive soils, and transparent farm economics.
            </p>
          </div>

          <div class="footer-links-col">
            <h6>Marketplace</h6>
            <a href="index.html">Home</a>
            <a href="tools.html">Tools & Machinery</a>
            <a href="list-equipment.html">List Your Equipment</a>
            <a href="profile.html">Your Profile</a>
          </div>

          <div class="footer-links-col">
            <h6>Operations & Audit</h6>
            <a href="dispatch.html">Owner Dispatch Board</a>
            <a href="admin.html">Admin & Audit Dashboard</a>
            <a href="tools.html?category=super_seeder">Super Seeders</a>
            <a href="tools.html?category=happy_seeder">Happy Seeders</a>
          </div>

          <div class="footer-links-col">
            <h6>CEEW Policy</h6>
            <a href="#">Custom Hiring Centre Scheme</a>
            <a href="#">Small Farmer Ceiling Tariffs</a>
            <a href="#">Residue Burning Prevention</a>
            <a href="login.html">Login / Register</a>
          </div>
        </div>

        <div class="footer-bottom-row">
          <span>© 2026 YantraShare • Team Code Crafters • All rights reserved.</span>
          <span>In-Situ & Ex-Situ CRM Operations</span>
        </div>
      </div>
    </footer>
  `;
}

function setupPersonaSwitcher() {
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".persona-chip");
    if (!chip) return;

    const personaId = chip.getAttribute("data-persona");
    const user = window.yantraStore.switchPersona(personaId);
    
    // Update chips
    document.querySelectorAll(".persona-chip").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");

    showToast(`Switched persona to ${user.name} (${user.tier})`, "success");

    // Re-render header to update avatar/name
    renderSharedHeader();

    // If on a page that listens for persona change
    if (typeof onPersonaChanged === "function") {
      onPersonaChanged(user);
    } else {
      // Reload page if needed to refresh page state
      window.location.reload();
    }
  });
}

function highlightActiveNav() {
  const currentPath = window.location.pathname.toLowerCase();
  document.querySelectorAll(".pill-nav-item").forEach(item => {
    item.classList.remove("active");
    const page = item.getAttribute("data-page");
    if (page === "home" && (currentPath.endsWith("index.html") || currentPath.endsWith("/") || currentPath === "")) {
      item.classList.add("active");
    } else if (page === "tools" && currentPath.includes("tools")) {
      item.classList.add("active");
    } else if (page === "list" && currentPath.includes("list-equipment")) {
      item.classList.add("active");
    } else if (page === "dispatch" && currentPath.includes("dispatch")) {
      item.classList.add("active");
    } else if (page === "profile" && currentPath.includes("profile")) {
      item.classList.add("active");
    } else if (page === "admin" && currentPath.includes("admin")) {
      item.classList.add("active");
    }
  });
}

function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `clean-toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-dot"></span>
    <span class="toast-msg">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
