/**
 * YantraShare - Core Application Logic
 * Implements full frontend functionality based on CEEW Research & Hackathon Project Doc
 * Dual listing/renting, explainable urgency allocation, owner dispatch board, 
 * pre/post condition inspections, admin fairness audit, and demo role switcher.
 */

// Initial Seed Data
const DEFAULT_SEED_DATA = {
  currentUser: {
    id: "farmer_a",
    name: "Gurpreet Singh",
    role: "farmer", // 'farmer', 'owner', 'manager', 'admin'
    district: "Ludhiana",
    village: "Raikot",
    farmingYears: 12,
    landSize: 2.5, // acres (Small farmer)
    category: "Small", // Marginal, Small, Medium, Large
    hasPriorExperience: true,
    experienceNotes: "Operated Happy Seeder and 50HP tractor for 3 harvest seasons.",
    tractorOwned: "Sonalika DI 50 RX (50 HP)",
    tractorHp: 50,
    phone: "+91 98765-43210",
    email: "gurpreet@punjabfarms.in",
    avatar: "assets/images/farmer.jpg"
  },
  
  // Available Machinery
  machines: [
    {
      id: "MCH-101",
      name: "Shaktiman 7ft Super Seeder Pro",
      category: "super_seeder",
      categoryLabel: "Super Seeder",
      brand: "Shaktiman",
      modelYear: 2024,
      chcName: "Ludhiana Central Cooperative CHC",
      location: "Ludhiana (Dehlon)",
      district: "Ludhiana",
      status: "available", // available, rented, maintenance
      requiredHp: 55,
      ratePerAcre: 1850,
      rateMachineOnly: 450,
      image: "assets/images/super_seeder.jpg",
      subsidized: true,
      breakEvenAcresTarget: 105,
      acresServedSeason: 82,
      conditionRating: 4.9,
      features: ["Heavy Duty Multi-speed Gearbox", "Nickel Chrome Rotor Blades", "Spring Loaded Seed Coulters", "Operator Included"],
      description: "Direct sowing of wheat into standing paddy stubble without prior field tillage. Saves 3-4 days of crucial harvest window."
    },
    {
      id: "MCH-102",
      name: "Dasmesh Turbo Happy Seeder 9-Row",
      category: "happy_seeder",
      categoryLabel: "Happy Seeder",
      brand: "Dasmesh",
      modelYear: 2023,
      chcName: "Malwa Farmer Producer Society",
      location: "Patiala (Nabha)",
      district: "Patiala",
      status: "available",
      requiredHp: 50,
      ratePerAcre: 1650,
      rateMachineOnly: 400,
      image: "assets/images/happy_seeder.jpg",
      subsidized: true,
      breakEvenAcresTarget: 105,
      acresServedSeason: 64,
      conditionRating: 4.8,
      features: ["Flail Type Cutting Blades", "Inverted T-Type Furrow Openers", "Zero Tillage Stubble Mulching", "Low Fuel Burn"],
      description: "Proven in-situ residue management. Cuts stubble, places seeds, and deposits straw as uniform moisture-retaining mulch."
    },
    {
      id: "MCH-103",
      name: "Krone High-Density Square Baler",
      category: "baler",
      categoryLabel: "Straw Baler & Rake",
      brand: "Krone / Kartar",
      modelYear: 2024,
      chcName: "Sangrur Progressive Agri Hub",
      location: "Sangrur (Sunam)",
      district: "Sangrur",
      status: "available",
      requiredHp: 65,
      ratePerAcre: 1400,
      rateMachineOnly: 500,
      image: "assets/images/baler.jpg",
      subsidized: true,
      breakEvenAcresTarget: 140,
      acresServedSeason: 112,
      conditionRating: 4.9,
      features: ["Automatic Knotter System", "400 Bales/Hour Throughput", "Ex-Situ Straw Collection", "Biomass Supply Linked"],
      description: "High speed baling for ex-situ stubble supply to local bio-CNG and biomass power plants. Completely clears field."
    },
    {
      id: "MCH-104",
      name: "Farmpower Mulcher & Paddy Straw Chopper",
      category: "chopper",
      categoryLabel: "Paddy Straw Chopper",
      brand: "Farmpower",
      modelYear: 2023,
      chcName: "Bathinda Kisan Seva Kendra",
      location: "Bathinda (Talwandi)",
      district: "Bathinda",
      status: "available",
      requiredHp: 45,
      ratePerAcre: 1200,
      rateMachineOnly: 350,
      image: "assets/images/hero.jpg",
      subsidized: true,
      breakEvenAcresTarget: 100,
      acresServedSeason: 94,
      conditionRating: 4.7,
      features: ["Serrated Straw Chopping Knives", "Serrated Counter Blades", "Broad Residue Spreader", "Quick Hitch"],
      description: "Chops combine harvested paddy straw into fine 2-inch pieces and spreads evenly for swift biological decomposition."
    },
    {
      id: "MCH-105",
      name: "Preet 3-Bottom Reversible MB Plough",
      category: "plough",
      categoryLabel: "Reversible MB Plough",
      brand: "Preet Agro",
      modelYear: 2022,
      chcName: "Ludhiana Central Cooperative CHC",
      location: "Ludhiana (Samrala)",
      district: "Ludhiana",
      status: "available",
      requiredHp: 55,
      ratePerAcre: 1300,
      rateMachineOnly: 300,
      image: "assets/images/super_seeder.jpg",
      subsidized: false,
      breakEvenAcresTarget: 90,
      acresServedSeason: 52,
      conditionRating: 4.6,
      features: ["Hydraulic Turnover Mechanism", "High Carbon Boron Steel Shears", "Deep Soil Inversion", "Trash Board Attached"],
      description: "Inverts upper soil layer and buries residue 10 inches below the surface, enriching soil carbon content."
    },
    {
      id: "MCH-106",
      name: "John Deere 5310 GearPro 4WD (55 HP)",
      category: "tractor",
      categoryLabel: "Heavy Duty Tractor",
      brand: "John Deere",
      modelYear: 2024,
      chcName: "Guru Nanak Custom Hiring Centre",
      location: "Patiala (Rajpura)",
      district: "Patiala",
      status: "available",
      requiredHp: 55,
      ratePerAcre: 900,
      rateMachineOnly: 850,
      image: "assets/images/happy_seeder.jpg",
      subsidized: true,
      breakEvenAcresTarget: 150,
      acresServedSeason: 135,
      conditionRating: 5.0,
      features: ["Dual Clutch with Independent PTO", "4-Wheel Drive Traction", "High Torque for Heavy CRM Implements", "AC Cab"],
      description: "Powerful 55HP 4WD workhorse specifically allocated to power 7ft & 8ft Super Seeders on marginal farmer holdings."
    }
  ],

  // Competing Requests (for Owner Dispatch Board & Explainable Allocation Engine)
  requests: [
    {
      id: "REQ-801",
      machineId: "MCH-101",
      machineName: "Shaktiman 7ft Super Seeder Pro",
      farmerId: "farmer_a",
      farmerName: "Gurpreet Singh",
      farmerCategory: "Small", // 2.5 - 5 acres
      acres: 3.5,
      urgencyDays: 1, // Days field can wait (Critical!)
      tractorOption: "need_both", // machine + tractor + driver
      date: "2026-11-02",
      district: "Ludhiana",
      village: "Raikot",
      recentBookingsThisSeason: 0,
      score: 92,
      rankingReason: "Critical Urgency (1 day before sowing deadline: +40 pts), Small Farmer Priority (+30 pts), Zero previous bookings (+20 pts), Request Time (+2 pts). Total: 92 pts.",
      status: "pending", // pending, approved, waitlisted, rejected, in_use, completed
      conditionPre: null,
      conditionPost: null
    },
    {
      id: "REQ-802",
      machineId: "MCH-101",
      machineName: "Shaktiman 7ft Super Seeder Pro",
      farmerId: "farmer_b",
      farmerName: "Balwinder Singh",
      farmerCategory: "Large", // > 25 acres
      acres: 18.0,
      urgencyDays: 5, // Field can wait 5 days
      tractorOption: "machine_only",
      date: "2026-11-02",
      district: "Ludhiana",
      village: "Khanna",
      recentBookingsThisSeason: 2,
      score: 48,
      rankingReason: "Moderate Urgency (5 days wait window: +15 pts), Large Farmer Tier (+10 pts), Usage Cap Penalty (2 prior bookings: +15 pts), Request Time (+8 pts). Total: 48 pts.",
      status: "waitlisted",
      conditionPre: null,
      conditionPost: null
    },
    {
      id: "REQ-803",
      machineId: "MCH-102",
      machineName: "Dasmesh Turbo Happy Seeder 9-Row",
      farmerId: "farmer_c",
      farmerName: "Jagtar Singh",
      farmerCategory: "Marginal",
      acres: 2.0,
      urgencyDays: 2,
      tractorOption: "need_both",
      date: "2026-11-03",
      district: "Patiala",
      village: "Samana",
      recentBookingsThisSeason: 0,
      score: 88,
      rankingReason: "High Urgency (2 days wait: +30 pts), Marginal Farmer top priority (+35 pts), Fair-usage cap zero bookings (+20 pts). Total: 88 pts.",
      status: "approved",
      conditionPre: {
        checkedAt: "2026-10-29 09:30 AM",
        bladesIntact: true,
        ptoGuardFitted: true,
        gearboxOilNormal: true,
        depthWheelsFunctional: true,
        notes: "Machine handed over in pristine condition. Full tank diesel supplied."
      },
      conditionPost: null
    }
  ],

  // Immutable Audit Trail (from PDF spec 10)
  auditLogs: [
    {
      id: "AUD-1001",
      timestamp: "2026-10-28 14:15:22",
      actor: "Harinder Kaur (CHC Operator)",
      action: "BOOKING_APPROVED",
      details: "Approved REQ-803 for Jagtar Singh (Happy Seeder). Validated small farmer subsidy tier.",
      reason: "Automated fairness score (88/100) verified. No conflict."
    },
    {
      id: "AUD-1002",
      timestamp: "2026-10-28 16:40:11",
      actor: "Jaspal Singh (Manager)",
      action: "HANDOVER_INSPECTION_RECORDED",
      details: "Check-in condition report logged for Dasmesh Happy Seeder. 4 safety points checked.",
      reason: "Mandatory pre-dispatch condition verification completed."
    },
    {
      id: "AUD-1003",
      timestamp: "2026-10-29 11:20:05",
      actor: "Dr. N. S. Sarao (Admin)",
      action: "FAIRNESS_AUDIT_CHECK",
      details: "Reviewed Ludhiana CHC monopolization index. Private member booking cap at 42%.",
      reason: "Compliant with Punjab 80% subsidy public-service guideline."
    }
  ],

  // Notifications
  notifications: [
    {
      id: "NOTIF-1",
      title: "Booking Request Ranked #1",
      message: "Your Super Seeder request at Raikot has scored 92/100 due to field urgency.",
      type: "success",
      time: "10 mins ago",
      unread: true
    },
    {
      id: "NOTIF-2",
      title: "Harvest Window Alert",
      message: "Optimal moisture window for wheat direct-drilling ends in 4 days across Ludhiana.",
      type: "info",
      time: "1 hour ago",
      unread: true
    },
    {
      id: "NOTIF-3",
      title: "Break-even Benchmark Reached",
      message: "CHC Shaktiman Super Seeder has crossed 80 acres (Target: 105 acres).",
      type: "warning",
      time: "Yesterday",
      unread: false
    }
  ]
};

// Application State Store
class AppStore {
  constructor() {
    this.storageKey = "yantrashare_data_v1";
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Local storage parse error, restoring default state", e);
    }
    this.saveState(DEFAULT_SEED_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
  }

  saveState(stateToSave = null) {
    if (stateToSave) {
      this.state = stateToSave;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  resetToDefault() {
    localStorage.removeItem(this.storageKey);
    this.state = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    this.saveState();
  }

  // Role switching
  switchRole(roleId) {
    const roles = {
      farmer_a: {
        id: "farmer_a",
        name: "Gurpreet Singh",
        role: "farmer",
        district: "Ludhiana",
        village: "Raikot",
        farmingYears: 12,
        landSize: 2.5,
        category: "Small",
        hasPriorExperience: true,
        experienceNotes: "Experienced with Super Seeder & Happy Seeder.",
        tractorOwned: "Sonalika 50HP",
        tractorHp: 50,
        avatar: "assets/images/farmer.jpg"
      },
      farmer_b: {
        id: "farmer_b",
        name: "Balwinder Singh",
        role: "farmer",
        district: "Ludhiana",
        village: "Khanna",
        farmingYears: 24,
        landSize: 22.0,
        category: "Large",
        hasPriorExperience: true,
        experienceNotes: "Runs large commercial farm with 3 heavy tractors.",
        tractorOwned: "John Deere 55HP & Farmtrac 60",
        tractorHp: 60,
        avatar: "assets/images/farmer.jpg"
      },
      owner: {
        id: "owner",
        name: "Harinder Kaur",
        role: "owner",
        district: "Ludhiana",
        village: "Dehlon",
        farmingYears: 15,
        landSize: 12.0,
        category: "CHC Operator",
        hasPriorExperience: true,
        experienceNotes: "Managing 8 subsidized CRM machines under Central CHC scheme.",
        tractorOwned: "John Deere 5310 & Swaraj 855",
        tractorHp: 55,
        avatar: "assets/images/farmer.jpg"
      },
      manager: {
        id: "manager",
        name: "Jaspal Singh",
        role: "manager",
        district: "Patiala",
        village: "Nabha",
        farmingYears: 18,
        landSize: 6.0,
        category: "Society Staff",
        hasPriorExperience: true,
        experienceNotes: "Secretary at Nabha Farmers Cooperative Society.",
        tractorOwned: "New Holland 5620",
        tractorHp: 65,
        avatar: "assets/images/farmer.jpg"
      },
      admin: {
        id: "admin",
        name: "Dr. N. S. Sarao",
        role: "admin",
        district: "Chandigarh",
        village: "HQ",
        farmingYears: 20,
        landSize: 0,
        category: "State Admin",
        hasPriorExperience: true,
        experienceNotes: "State Agricultural Research & CRM Equipment Monitor.",
        tractorOwned: "State Fleet Inspection Unit",
        tractorHp: 75,
        avatar: "assets/images/farmer.jpg"
      }
    };

    if (roles[roleId]) {
      this.state.currentUser = roles[roleId];
      this.saveState();
      return this.state.currentUser;
    }
  }

  // Add audit log
  addAuditLog(action, details, reason) {
    const log = {
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${this.state.currentUser.name} (${this.state.currentUser.role.toUpperCase()})`,
      action,
      details,
      reason
    };
    this.state.auditLogs.unshift(log);
    this.saveState();
  }

  // Add notification
  addNotification(title, message, type = "info") {
    const notif = {
      id: "NOTIF-" + Date.now(),
      title,
      message,
      type,
      time: "Just now",
      unread: true
    };
    this.state.notifications.unshift(notif);
    this.saveState();
    showToast(title, type);
  }
}

// Global store instance
const store = new AppStore();

// UI Routing & Controller
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  updateUserUI();
  setupNavigation();
  setupRoleSwitcher();
  setupFilters();
  renderMachinesGrid();
  renderDispatchBoard();
  renderAdminDashboard();
  renderProfileView();
  setupNotificationBell();
  setupModals();
  setupFormSubmissions();
  
  // Handle URL hash routing if present
  window.addEventListener("hashchange", handleHashRouting);
  handleHashRouting();
}

// Hash Routing Handler
function handleHashRouting() {
  const hash = window.location.hash.substring(1) || "home";
  navigateToPage(hash);
}

function navigateToPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page-view").forEach(p => p.classList.remove("active"));
  
  // Show target page
  const target = document.getElementById("page-" + pageId) || document.getElementById("page-home");
  if (target) {
    target.classList.add("active");
  }

  // Update navigation pill active states
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("data-page") === pageId) {
      link.classList.add("active");
    }
  });

  // Re-render relevant view if needed
  if (pageId === "tools") renderMachinesGrid();
  if (pageId === "dispatch") renderDispatchBoard();
  if (pageId === "admin") renderAdminDashboard();
  if (pageId === "profile") renderProfileView();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setupNavigation() {
  document.querySelectorAll("[data-navigate]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const page = el.getAttribute("data-navigate");
      window.location.hash = page;
      navigateToPage(page);
    });
  });
}

// Role Switcher Setup (Top demo bar)
function setupRoleSwitcher() {
  const chips = document.querySelectorAll(".role-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      
      const roleId = chip.getAttribute("data-role-id");
      const user = store.switchRole(roleId);
      
      updateUserUI();
      renderDispatchBoard();
      renderAdminDashboard();
      renderProfileView();
      
      showToast(`Switched active persona to ${user.name} (${user.category})`, "success");
      
      // Auto redirect to relevant tab for role convenience
      if (user.role === "admin") {
        navigateToPage("admin");
      } else if (user.role === "owner" || user.role === "manager") {
        navigateToPage("dispatch");
      }
    });
  });
}

function updateUserUI() {
  const user = store.state.currentUser;
  
  // Navbar user badge
  const avatarEl = document.getElementById("header-user-avatar");
  const nameEl = document.getElementById("header-user-name");
  const roleEl = document.getElementById("header-user-role");
  
  if (avatarEl) avatarEl.src = user.avatar;
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = `${user.category} • ${user.district}`;

  // Role visibility for hidden pages (Admin & Dispatch)
  const adminPill = document.getElementById("nav-admin-link");
  const dispatchPill = document.getElementById("nav-dispatch-link");
  
  if (adminPill) {
    if (user.role === "admin" || user.role === "manager") {
      adminPill.style.display = "flex";
    } else {
      adminPill.style.display = "none";
    }
  }

  if (dispatchPill) {
    if (user.role === "owner" || user.role === "manager" || user.role === "admin") {
      dispatchPill.style.display = "flex";
    } else {
      // Still show for demo if user wants to inspect how dispatching works
      dispatchPill.style.display = "flex";
    }
  }

  // Active role chip sync
  document.querySelectorAll(".role-chip").forEach(chip => {
    if (chip.getAttribute("data-role-id") === user.id) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });

  // Notification count
  const unreadCount = store.state.notifications.filter(n => n.unread).length;
  const notifDot = document.getElementById("header-notif-dot");
  if (notifDot) {
    notifDot.style.display = unreadCount > 0 ? "block" : "none";
  }
}

// Notification Bell Dropdown
function setupNotificationBell() {
  const btn = document.getElementById("notif-bell-btn");
  const dropdown = document.getElementById("notifications-dropdown");
  
  if (!btn || !dropdown) return;
  
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
    renderNotificationsList();
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove("show");
    }
  });
}

function renderNotificationsList() {
  const container = document.getElementById("notifications-list-container");
  if (!container) return;

  const notifs = store.state.notifications;
  if (notifs.length === 0) {
    container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No new notifications</div>`;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div class="notification-item ${n.unread ? 'unread' : ''}">
      <div class="notif-icon ${n.type}">
        ${n.type === 'success' ? '✓' : n.type === 'warning' ? '!' : 'ℹ'}
      </div>
      <div>
        <div style="font-weight: 700; color: var(--primary-900);">${n.title}</div>
        <div style="color: var(--text-muted); font-size: 0.8rem; margin: 0.2rem 0;">${n.message}</div>
        <div style="font-size: 0.7rem; color: #94a3b8;">${n.time}</div>
      </div>
    </div>
  `).join('');
}

// --------------------------------------------------------------------------
// Machinery Marketplace Grid & Filtering (Tools Tab)
// --------------------------------------------------------------------------
let currentCategoryFilter = "all";
let currentDistrictFilter = "all";
let currentHpFilter = "all";

function setupFilters() {
  // Category pills click
  document.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      currentCategoryFilter = pill.getAttribute("data-category");
      renderMachinesGrid();
    });
  });

  // District select filter
  const distSelect = document.getElementById("filter-district-select");
  if (distSelect) {
    distSelect.addEventListener("change", (e) => {
      currentDistrictFilter = e.target.value;
      renderMachinesGrid();
    });
  }

  // Tractor HP select filter
  const hpSelect = document.getElementById("filter-hp-select");
  if (hpSelect) {
    hpSelect.addEventListener("change", (e) => {
      currentHpFilter = e.target.value;
      renderMachinesGrid();
    });
  }

  // Home search bar execute
  const homeSearchBtn = document.getElementById("home-search-btn");
  if (homeSearchBtn) {
    homeSearchBtn.addEventListener("click", () => {
      const type = document.getElementById("home-search-type")?.value || "all";
      const dist = document.getElementById("home-search-district")?.value || "all";
      currentCategoryFilter = type;
      currentDistrictFilter = dist;
      
      // Update pills
      document.querySelectorAll(".cat-pill").forEach(p => {
        if (p.getAttribute("data-category") === type) p.classList.add("active");
        else p.classList.remove("active");
      });
      
      navigateToPage("tools");
    });
  }
}

function renderMachinesGrid() {
  const container = document.getElementById("machines-cards-container");
  if (!container) return;

  const machines = store.state.machines.filter(m => {
    const matchCat = (currentCategoryFilter === "all" || m.category === currentCategoryFilter);
    const matchDist = (currentDistrictFilter === "all" || m.district.toLowerCase() === currentDistrictFilter.toLowerCase());
    const matchHp = (currentHpFilter === "all" || m.requiredHp <= parseInt(currentHpFilter));
    return matchCat && matchDist && matchHp;
  });

  if (machines.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3.5rem; text-align: center; background: white; border-radius: var(--radius-lg); border: 1px dashed var(--light-border);">
        <h3>No CRM Machinery matches your filter criteria</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem;">Try selecting all districts or reducing tractor horsepower requirement.</p>
        <button class="btn btn-secondary" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = machines.map(m => `
    <div class="machine-card" id="card-${m.id}">
      <div class="machine-card-image-wrap">
        <img src="${m.image}" alt="${m.name}" loading="lazy" />
        <span class="machine-status-badge badge ${m.status === 'available' ? 'badge-status-avail' : m.status === 'rented' ? 'badge-status-busy' : 'badge-status-maint'}">
          ● ${m.status === 'available' ? 'Available Now' : m.status === 'rented' ? 'In Field' : 'Maintenance'}
        </span>
        <div class="machine-rating-pill">
          ★ ${m.conditionRating}
        </div>
      </div>
      
      <div class="machine-card-body">
        <div class="machine-owner-meta">
          <span>🏛 ${m.chcName}</span>
          <span>📍 ${m.location}</span>
        </div>
        
        <h3 class="machine-title">${m.name}</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">${m.description}</p>
        
        <div class="machine-specs-row">
          <span class="spec-pill badge-hp">⚡ ${m.requiredHp} HP Required</span>
          ${m.subsidized ? '<span class="spec-pill badge-subsidy">🛡 80% Govt Subsidy Certified</span>' : ''}
          <span class="spec-pill">⚙ Model ${m.modelYear}</span>
        </div>
        
        <div class="machine-pricing-row">
          <div class="price-box">
            <span class="price-main">₹${m.ratePerAcre} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">/ acre</span></span>
            <span class="price-unit">Full Package (Machine + Fuel + Driver)</span>
            <span style="font-size: 0.75rem; color: var(--primary-600); font-weight: 600;">₹${m.rateMachineOnly}/acre implement only</span>
          </div>
          
          <div class="machine-card-actions">
            <button class="btn btn-secondary btn-sm" onclick="openMachineDetailModal('${m.id}')">Details</button>
            <button class="btn btn-primary btn-sm" onclick="openBookingModal('${m.id}')" ${m.status !== 'available' ? 'disabled' : ''}>
              ${m.status === 'available' ? 'Rent Machine' : 'Waitlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function resetFilters() {
  currentCategoryFilter = "all";
  currentDistrictFilter = "all";
  currentHpFilter = "all";
  document.querySelectorAll(".cat-pill").forEach(p => {
    if (p.getAttribute("data-category") === "all") p.classList.add("active");
    else p.classList.remove("active");
  });
  renderMachinesGrid();
}

// --------------------------------------------------------------------------
// Machine Details Modal
// --------------------------------------------------------------------------
function openMachineDetailModal(machineId) {
  const machine = store.state.machines.find(m => m.id === machineId);
  if (!machine) return;

  const modal = document.getElementById("machine-detail-modal");
  const content = document.getElementById("machine-detail-content");
  
  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
      <div style="border-radius: var(--radius-lg); overflow: hidden; height: 260px;">
        <img src="${machine.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${machine.name}" />
      </div>
      
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div>
            <span class="badge badge-chc">${machine.chcName}</span>
            <h2 style="font-size: 1.6rem; color: var(--primary-900); margin-top: 0.4rem;">${machine.name}</h2>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-900);">₹${machine.ratePerAcre} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">/ acre</span></div>
            <div style="font-size: 0.75rem; color: var(--primary-600);">Fixed Govt Punjab CRM Ceiling Tariff</div>
          </div>
        </div>
        
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem;">${machine.description}</p>
        
        <h5 style="margin-bottom: 0.5rem; font-size: 0.95rem;">Technical Specifications</h5>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--light-border); margin-bottom: 1.25rem;">
          <div><strong>Implement Type:</strong> ${machine.categoryLabel}</div>
          <div><strong>Tractor HP Needed:</strong> ${machine.requiredHp} HP minimum</div>
          <div><strong>Model Year:</strong> ${machine.modelYear}</div>
          <div><strong>Condition Score:</strong> ★ ${machine.conditionRating} / 5.0</div>
          <div><strong>District / Tehsil:</strong> ${machine.location}</div>
          <div><strong>CHC Subsidy Status:</strong> ${machine.subsidized ? '80% Scheme Subsidized' : 'Private Hub'}</div>
        </div>

        <h5 style="margin-bottom: 0.5rem; font-size: 0.95rem;">Key Engineering Features</h5>
        <ul style="margin-left: 1.25rem; font-size: 0.88rem; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; margin-bottom: 1.5rem;">
          ${machine.features.map(f => `<li>${f}</li>`).join('')}
        </ul>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 700; color: #065f46; font-size: 0.9rem;">CHC Break-Even Utilization Tracker</div>
            <div style="font-size: 0.8rem; color: #047857;">Season coverage: <strong>${machine.acresServedSeason} acres</strong> (Target: ${machine.breakEvenAcresTarget} acres to break even)</div>
          </div>
          <div style="width: 120px; background: #d1fae5; border-radius: var(--radius-pill); height: 10px; overflow: hidden;">
            <div style="width: ${Math.min(100, (machine.acresServedSeason / machine.breakEvenAcresTarget) * 100)}%; background: var(--primary-600); height: 100%;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Rent action
  const modalRentBtn = document.getElementById("modal-detail-rent-btn");
  if (modalRentBtn) {
    modalRentBtn.onclick = () => {
      closeModal("machine-detail-modal");
      openBookingModal(machineId);
    };
  }

  openModal("machine-detail-modal");
}

// --------------------------------------------------------------------------
// Request / Booking Modal with Explainable Urgency Scoring
// --------------------------------------------------------------------------
let activeBookingMachineId = null;

function openBookingModal(machineId) {
  activeBookingMachineId = machineId;
  const machine = store.state.machines.find(m => m.id === machineId);
  const user = store.state.currentUser;
  
  if (!machine) return;

  document.getElementById("booking-machine-name").textContent = machine.name;
  document.getElementById("booking-machine-hp").textContent = `${machine.requiredHp} HP Required`;
  document.getElementById("booking-machine-rate").textContent = `₹${machine.ratePerAcre}/acre`;
  
  // Prefill farmer details from current session
  document.getElementById("booking-farmer-name").value = user.name;
  document.getElementById("booking-farmer-acres").value = user.landSize || 3;
  document.getElementById("booking-field-location").value = `${user.village}, ${user.district}`;
  
  // Check tractor compatibility warning
  const tractorWarning = document.getElementById("booking-tractor-warning");
  if (user.tractorHp < machine.requiredHp) {
    tractorWarning.style.display = "block";
    tractorWarning.innerHTML = `⚠️ Your registered tractor (${user.tractorOwned || 'No tractor'}) provides <strong>${user.tractorHp} HP</strong>, but this machine requires <strong>${machine.requiredHp} HP</strong>. We strongly recommend selecting the <em>"Machine + Tractor + Driver Package"</em>.`;
  } else {
    tractorWarning.style.display = "none";
  }

  updateLiveScorePreview();
  openModal("booking-modal");
}

function updateLiveScorePreview() {
  const urgencyDays = parseInt(document.getElementById("booking-urgency-days")?.value || 2);
  const user = store.state.currentUser;
  
  // Calculate scoring breakdown based on CEEW model
  let urgencyPts = urgencyDays === 1 ? 40 : urgencyDays <= 3 ? 28 : 12;
  let categoryPts = user.category === "Marginal" ? 35 : user.category === "Small" ? 28 : user.category === "Medium" ? 15 : 8;
  let usageCapPts = 20; // zero previous bookings in default
  let totalScore = urgencyPts + categoryPts + usageCapPts + 4; // 4 pts base request time

  const scoreEl = document.getElementById("live-score-preview");
  const explanationEl = document.getElementById("live-score-explanation");
  
  if (scoreEl) scoreEl.textContent = totalScore + " / 100";
  if (explanationEl) {
    explanationEl.innerHTML = `
      <strong>Transparent Fairness Breakdown:</strong><br/>
      • Urgency (${urgencyDays} day(s) before stubble burn risk): +${urgencyPts} pts<br/>
      • Farmer Scale (${user.category} farmer protection): +${categoryPts} pts<br/>
      • Fair-Usage Cap (No prior monopolized bookings): +${usageCapPts} pts
    `;
  }
}

// --------------------------------------------------------------------------
// Owner Dispatch Board (PDF Requirement: Competing Requests & Conflict Resolving)
// --------------------------------------------------------------------------
function renderDispatchBoard() {
  const container = document.getElementById("dispatch-requests-container");
  if (!container) return;

  const requests = store.state.requests;
  const user = store.state.currentUser;

  // Header stats
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const activeCount = requests.filter(r => r.status === "approved" || r.status === "in_use").length;
  const waitlistCount = requests.filter(r => r.status === "waitlisted").length;

  document.getElementById("dispatch-stat-pending").textContent = pendingCount;
  document.getElementById("dispatch-stat-active").textContent = activeCount;
  document.getElementById("dispatch-stat-waitlisted").textContent = waitlistCount;

  if (requests.length === 0) {
    container.innerHTML = `<div style="padding: 2.5rem; text-align: center; color: var(--text-muted); background: white; border-radius: var(--radius-lg);">No rental requests currently logged in dispatch board.</div>`;
    return;
  }

  // Sort by score descending (explainable ranking order)
  const sortedRequests = [...requests].sort((a, b) => b.score - a.score);

  container.innerHTML = sortedRequests.map((req, index) => `
    <div class="dispatch-request-card ${req.urgencyDays <= 2 ? 'urgent' : ''} ${req.status === 'waitlisted' ? 'waitlisted' : ''}">
      <div class="rank-badge">
        #${index + 1}
        <span>Rank</span>
      </div>

      <div>
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.35rem;">
          <h4 style="font-size: 1.15rem; color: var(--primary-900);">${req.farmerName}</h4>
          <span class="badge ${req.farmerCategory === 'Marginal' || req.farmerCategory === 'Small' ? 'badge-subsidy' : 'badge-chc'}">
            ${req.farmerCategory} Farmer
          </span>
          <span class="score-pill-tag">Score: ${req.score} pts</span>
          <span class="badge ${req.status === 'approved' ? 'badge-status-avail' : req.status === 'waitlisted' ? 'badge-hp' : 'badge-status-busy'}">
            Status: ${req.status.toUpperCase()}
          </span>
        </div>

        <div style="font-size: 0.95rem; font-weight: 600; color: #1e293b;">
          Requested: ${req.machineName} (${req.acres} acres at ${req.village}, ${req.district})
        </div>

        <div class="request-details-grid">
          <div>📅 Date: <strong>${req.date}</strong></div>
          <div>⏱ Days field can wait: <strong style="color: ${req.urgencyDays <= 2 ? 'var(--danger)' : 'var(--text-main)'};">${req.urgencyDays} day(s)</strong></div>
          <div>🚜 Package: <strong>${req.tractorOption === 'need_both' ? 'Implement + Tractor + Operator' : 'Implement Only'}</strong></div>
          <div>📊 Prior Season Bookings: <strong>${req.recentBookingsThisSeason}</strong></div>
        </div>

        <div style="margin-top: 0.75rem; background: #f8fafc; border-left: 3px solid var(--primary-500); padding: 0.5rem 0.85rem; font-size: 0.82rem; color: #475569; border-radius: 4px;">
          <strong>Explainable Allocation Reason:</strong> ${req.rankingReason}
        </div>
      </div>

      <div class="request-actions-col">
        ${req.status === 'pending' ? `
          <button class="btn btn-primary btn-sm" onclick="approveRequest('${req.id}')">✓ Approve Request</button>
          <button class="btn btn-secondary btn-sm" onclick="waitlistRequest('${req.id}')">Waitlist</button>
          <button class="btn btn-outline-primary btn-sm" onclick="openOverrideModal('${req.id}')">Human Override</button>
        ` : req.status === 'approved' ? `
          <button class="btn btn-primary btn-sm" onclick="openHandoverCheckModal('${req.id}', 'pre')">📋 Record Handover</button>
          <button class="btn btn-danger btn-sm" onclick="triggerBreakdownRecovery('${req.machineId}')">Report Breakdown</button>
        ` : req.status === 'in_use' ? `
          <button class="btn btn-accent btn-sm" onclick="openHandoverCheckModal('${req.id}', 'post')">🔁 Record Return</button>
        ` : `
          <button class="btn btn-secondary btn-sm" disabled>Completed</button>
        `}
      </div>
    </div>
  `).join('');
}

function approveRequest(reqId) {
  const req = store.state.requests.find(r => r.id === reqId);
  if (!req) return;

  req.status = "approved";
  
  // Also update corresponding machine status
  const machine = store.state.machines.find(m => m.id === req.machineId);
  if (machine) machine.status = "rented";

  store.addAuditLog(
    "BOOKING_APPROVED",
    `Approved allocation of ${req.machineName} to ${req.farmerName} (${req.acres} acres).`,
    `Standard algorithmic rank #1 match based on highest urgency and small farmer priority.`
  );

  store.addNotification(
    "Booking Approved!",
    `Machine ${req.machineName} has been confirmed for ${req.farmerName}. Prepare for handover inspection.`,
    "success"
  );

  store.saveState();
  renderDispatchBoard();
  renderMachinesGrid();
}

function waitlistRequest(reqId) {
  const req = store.state.requests.find(r => r.id === reqId);
  if (!req) return;

  req.status = "waitlisted";
  store.addAuditLog("REQUEST_WAITLISTED", `Waitlisted ${req.farmerName} for ${req.machineName}`, "Competing request with higher urgency prioritized.");
  store.saveState();
  renderDispatchBoard();
  showToast("Request moved to waitlist queue", "info");
}

// --------------------------------------------------------------------------
// Human Override with Mandatory Reason (PDF Trust & Safety Requirement)
// --------------------------------------------------------------------------
let activeOverrideReqId = null;

function openOverrideModal(reqId) {
  activeOverrideReqId = reqId;
  const req = store.state.requests.find(r => r.id === reqId);
  if (!req) return;

  document.getElementById("override-farmer-name").textContent = req.farmerName;
  document.getElementById("override-machine-name").textContent = req.machineName;
  document.getElementById("override-reason-input").value = "";
  
  openModal("override-modal");
}

function submitHumanOverride() {
  const reason = document.getElementById("override-reason-input").value.trim();
  if (!reason || reason.length < 10) {
    showToast("Please provide a detailed recorded reason (minimum 10 characters) as required by audit guidelines.", "error");
    return;
  }

  const req = store.state.requests.find(r => r.id === activeOverrideReqId);
  if (req) {
    req.status = "approved";
    req.rankingReason = `MANUAL OVERRIDE: ${reason} (Approved by ${store.state.currentUser.name})`;

    store.addAuditLog(
      "HUMAN_OVERRIDE_RECORDED",
      `Operator manually bypassed score ranking for ${req.farmerName} on ${req.machineName}`,
      reason
    );

    store.addNotification(
      "Operator Override Executed",
      `Request REQ-${req.id} approved via logged operator override: "${reason}"`,
      "warning"
    );

    store.saveState();
    closeModal("override-modal");
    renderDispatchBoard();
    showToast("Human override recorded with audit trace", "success");
  }
}

// --------------------------------------------------------------------------
// Handover & Return Condition Checklists (Side-by-Side Comparison from PDF)
// --------------------------------------------------------------------------
let activeHandoverReqId = null;
let activeHandoverType = "pre"; // 'pre' or 'post'

function openHandoverCheckModal(reqId, type) {
  activeHandoverReqId = reqId;
  activeHandoverType = type;
  const req = store.state.requests.find(r => r.id === reqId);
  if (!req) return;

  document.getElementById("handover-title").textContent = type === "pre" 
    ? "Pre-Dispatch Handover Condition Checklist" 
    : "Post-Usage Return Condition & Damage Inspection";

  document.getElementById("handover-subtitle").textContent = type === "pre"
    ? `Verify implement safety and mechanical status before handing over to ${req.farmerName}.`
    : `Compare return condition against initial handover for ${req.farmerName}. Detect any breakage or mishandling.`;

  // If type is post and pre-condition exists, show side-by-side comparison
  const comparisonView = document.getElementById("handover-comparison-view");
  if (type === "post" && req.conditionPre) {
    comparisonView.style.display = "block";
    comparisonView.innerHTML = `
      <div style="background: #f1f5f9; padding: 1rem; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1rem; border: 1px solid var(--light-border);">
        <strong>Initial Handover Checklist Record (${req.conditionPre.checkedAt}):</strong><br/>
        ✓ Blades Intact & Sharp: ${req.conditionPre.bladesIntact ? 'YES' : 'NO'}<br/>
        ✓ Safety PTO Guard in place: ${req.conditionPre.ptoGuardFitted ? 'YES' : 'NO'}<br/>
        ✓ Gearbox Oil level verified: ${req.conditionPre.gearboxOilNormal ? 'YES' : 'NO'}<br/>
        ✓ Depth Control Wheels functional: ${req.conditionPre.depthWheelsFunctional ? 'YES' : 'NO'}<br/>
        <em>Notes: ${req.conditionPre.notes}</em>
      </div>
    `;
  } else {
    comparisonView.style.display = "none";
  }

  openModal("handover-modal");
}

function submitHandoverCheck() {
  const req = store.state.requests.find(r => r.id === activeHandoverReqId);
  if (!req) return;

  const blades = document.getElementById("chk-blades").checked;
  const pto = document.getElementById("chk-pto").checked;
  const gearbox = document.getElementById("chk-gearbox").checked;
  const depth = document.getElementById("chk-depth").checked;
  const notes = document.getElementById("handover-notes").value || "All mechanical checks passed.";

  const record = {
    checkedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    bladesIntact: blades,
    ptoGuardFitted: pto,
    gearboxOilNormal: gearbox,
    depthWheelsFunctional: depth,
    notes: notes
  };

  if (activeHandoverType === "pre") {
    req.conditionPre = record;
    req.status = "in_use";
    store.addAuditLog(
      "CHECK_IN_RECORDED",
      `Handover inspection logged for ${req.machineName} to ${req.farmerName}.`,
      notes
    );
    store.addNotification(
      "Handover Completed",
      `${req.machineName} is now in field with ${req.farmerName}.`,
      "info"
    );
  } else {
    req.conditionPost = record;
    req.status = "completed";
    
    // Free up machine
    const machine = store.state.machines.find(m => m.id === req.machineId);
    if (machine) {
      machine.status = "available";
      machine.acresServedSeason += req.acres;
    }

    store.addAuditLog(
      "RETURN_INSPECTION_RECORDED",
      `Final return verification for ${req.machineName}. Machine marked Available.`,
      notes
    );
    store.addNotification(
      "Equipment Returned Safely",
      `Return checklist verified for ${req.machineName}. Total ${req.acres} acres recorded.`,
      "success"
    );
  }

  store.saveState();
  closeModal("handover-modal");
  renderDispatchBoard();
  renderMachinesGrid();
  renderAdminDashboard();
  showToast("Condition inspection record saved to permanent audit log", "success");
}

// --------------------------------------------------------------------------
// Breakdown & Overdue Auto-Recovery (Key Differentiator from PDF)
// --------------------------------------------------------------------------
function triggerBreakdownRecovery(machineId) {
  const machine = store.state.machines.find(m => m.id === machineId);
  if (!machine) return;

  // Mark machine broken
  machine.status = "maintenance";

  // Find affected bookings
  const affectedReqs = store.state.requests.filter(r => r.machineId === machineId && (r.status === "approved" || r.status === "pending" || r.status === "waitlisted"));

  // Find nearest alternate machine from other CHC
  const alternate = store.state.machines.find(m => m.id !== machineId && m.category === machine.category && m.status === "available");

  let message = `Machine ${machine.name} reported in breakdown.`;
  if (alternate) {
    message += ` Nearest replacement located: ${alternate.name} at ${alternate.chcName} (${alternate.location}). Competing queue re-ranked automatically!`;
  }

  store.addAuditLog(
    "BREAKDOWN_RECOVERY_TRIGGERED",
    `Machine ${machine.name} put into maintenance mode. ${affectedReqs.length} farmer request(s) re-allocated.`,
    `Auto-recovery suggested alternate: ${alternate ? alternate.name : 'Waitlist notified'}`
  );

  store.addNotification("⚠️ Machine Breakdown Recovery Alert", message, "warning");

  store.saveState();
  renderDispatchBoard();
  renderMachinesGrid();
  renderAdminDashboard();
  showToast("Breakdown logged! Automatic recovery and re-ranking executed.", "warning");
}

// --------------------------------------------------------------------------
// Admin & Manager Dashboard (Fairness, Stubble Metrics, Audit Trail)
// --------------------------------------------------------------------------
function renderAdminDashboard() {
  const tableBody = document.getElementById("admin-audit-table-body");
  if (!tableBody) return;

  // Calculate live aggregate stats
  const totalMachines = store.state.machines.length;
  const totalAcresCovered = store.state.machines.reduce((acc, m) => acc + (m.acresServedSeason || 0), 0);
  const stubbleAvertedTons = Math.round(totalAcresCovered * 2.5); // ~2.5 tonnes paddy residue per acre
  const activeDisputes = 0;

  document.getElementById("admin-stat-machines").textContent = totalMachines;
  document.getElementById("admin-stat-acres").textContent = totalAcresCovered.toLocaleString();
  document.getElementById("admin-stat-stubble").textContent = stubbleAvertedTons.toLocaleString() + " MT";
  document.getElementById("admin-stat-disputes").textContent = activeDisputes;

  // Populate immutable audit logs table
  tableBody.innerHTML = store.state.auditLogs.map(log => `
    <tr>
      <td style="font-family: monospace; font-size: 0.8rem; color: #64748b;">${log.timestamp}</td>
      <td><strong>${log.actor}</strong></td>
      <td><span class="badge ${log.action.includes('APPROVED') ? 'badge-status-avail' : log.action.includes('OVERRIDE') ? 'badge-hp' : 'badge-chc'}">${log.action}</span></td>
      <td>${log.details}</td>
      <td style="color: #475569; font-style: italic;">${log.reason}</td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// Farmer Profile View & Details Filling / Onboarding
// --------------------------------------------------------------------------
function renderProfileView() {
  const user = store.state.currentUser;

  // Populate profile info
  const nameEl = document.getElementById("profile-name");
  const metaEl = document.getElementById("profile-meta");
  const districtEl = document.getElementById("profile-district");
  const yearsEl = document.getElementById("profile-years");
  const acresEl = document.getElementById("profile-acres");
  const categoryEl = document.getElementById("profile-category");
  const tractorEl = document.getElementById("profile-tractor");
  const expEl = document.getElementById("profile-experience");
  const avatarEl = document.getElementById("profile-avatar");

  if (nameEl) nameEl.textContent = user.name;
  if (metaEl) metaEl.textContent = `${user.category} Farmer • Member ID: ${user.id.toUpperCase()}`;
  if (districtEl) districtEl.textContent = `${user.village}, ${user.district}, Punjab`;
  if (yearsEl) yearsEl.textContent = `${user.farmingYears} Years Active Farming`;
  if (acresEl) acresEl.textContent = `${user.landSize} Acres Landholding`;
  if (categoryEl) categoryEl.textContent = `${user.category} Farmer (< 5 Acres Priority)`;
  if (tractorEl) tractorEl.textContent = `${user.tractorOwned || 'No own tractor'} (${user.tractorHp || 0} HP)`;
  if (expEl) expEl.textContent = user.experienceNotes || "Standard crop residue management experience.";
  if (avatarEl) avatarEl.src = user.avatar;

  // Populate user bookings history
  const bookingsContainer = document.getElementById("profile-bookings-container");
  if (bookingsContainer) {
    const userReqs = store.state.requests.filter(r => r.farmerId === user.id);
    if (userReqs.length === 0) {
      bookingsContainer.innerHTML = `<p style="color: var(--text-muted); padding: 1.5rem 0;">No active or past machinery bookings found.</p>`;
    } else {
      bookingsContainer.innerHTML = userReqs.map(r => `
        <div style="background: white; border: 1px solid var(--light-border); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; color: var(--primary-900); font-size: 1.05rem;">${r.machineName}</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Acreage: ${r.acres} acres • Scheduled: ${r.date}</div>
            <div style="font-size: 0.8rem; color: var(--primary-700); margin-top: 0.25rem;">Urgency: ${r.urgencyDays} day(s) wait • Score: ${r.score} pts</div>
          </div>
          <div>
            <span class="badge ${r.status === 'approved' ? 'badge-status-avail' : r.status === 'waitlisted' ? 'badge-hp' : 'badge-status-busy'}">
              ${r.status.toUpperCase()}
            </span>
          </div>
        </div>
      `).join('');
    }
  }

  // Populate user's listed equipment (since one user can list AND rent!)
  renderUserListedEquipment();
}

function renderUserListedEquipment() {
  const container = document.getElementById("profile-listings-container");
  if (!container) return;

  const user = store.state.currentUser;
  // User can be an owner who listed machines
  const listed = store.state.machines.filter(m => m.chcName.includes(user.name) || (user.role === 'owner' && m.district === user.district));

  if (listed.length === 0) {
    container.innerHTML = `
      <div style="padding: 2rem; background: #f8fafc; border-radius: var(--radius-md); text-align: center; border: 1px dashed var(--light-border);">
        <p style="color: var(--text-muted); margin-bottom: 1rem;">You have not listed any machinery yet. You can list your tractor or crop residue implement for other farmers to rent!</p>
        <button class="btn btn-primary btn-sm" onclick="navigateToPage('list-equipment')">+ List Your Equipment Now</button>
      </div>
    `;
    return;
  }

  container.innerHTML = listed.map(m => `
    <div style="display: flex; gap: 1rem; align-items: center; background: white; border: 1px solid var(--light-border); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 0.75rem;">
      <img src="${m.image}" style="width: 70px; height: 50px; border-radius: 6px; object-fit: cover;" />
      <div style="flex-grow: 1;">
        <div style="font-weight: 700; color: var(--primary-900);">${m.name}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Rate: ₹${m.ratePerAcre}/acre • Season coverage: ${m.acresServedSeason} acres</div>
      </div>
      <div>
        <span class="badge ${m.status === 'available' ? 'badge-status-avail' : 'badge-status-busy'}">
          ${m.status.toUpperCase()}
        </span>
      </div>
    </div>
  `).join('');
}

// --------------------------------------------------------------------------
// Form Submissions (List Equipment, Onboarding Verification, Auth)
// --------------------------------------------------------------------------
function setupFormSubmissions() {
  // 1. List Equipment Form
  const listForm = document.getElementById("list-equipment-form");
  if (listForm) {
    listForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("list-name").value.trim();
      const category = document.getElementById("list-category").value;
      const brand = document.getElementById("list-brand").value.trim();
      const hp = parseInt(document.getElementById("list-hp").value);
      const ratePackage = parseInt(document.getElementById("list-rate-package").value);
      const rateMachine = parseInt(document.getElementById("list-rate-machine").value);
      const district = document.getElementById("list-district").value;
      const location = document.getElementById("list-location").value.trim();
      const desc = document.getElementById("list-desc").value.trim();
      const subsidized = document.getElementById("list-subsidized").checked;

      const newMachine = {
        id: "MCH-" + (100 + store.state.machines.length + 1),
        name: `${brand} ${name}`,
        category: category,
        categoryLabel: category.replace('_', ' ').toUpperCase(),
        brand: brand,
        modelYear: 2024,
        chcName: `${store.state.currentUser.name} Farm Hub`,
        location: `${location} (${district})`,
        district: district,
        status: "available",
        requiredHp: hp,
        ratePerAcre: ratePackage,
        rateMachineOnly: rateMachine,
        image: category.includes('seeder') ? "assets/images/super_seeder.jpg" : category.includes('baler') ? "assets/images/baler.jpg" : "assets/images/happy_seeder.jpg",
        subsidized: subsidized,
        breakEvenAcresTarget: 105,
        acresServedSeason: 0,
        conditionRating: 5.0,
        features: ["Verified Private & CHC Fleet", "Includes PTO Drive Linkage", "Pre-Dispatch Inspected"],
        description: desc
      };

      store.state.machines.unshift(newMachine);
      
      store.addAuditLog(
        "EQUIPMENT_LISTED",
        `New machinery listed: ${newMachine.name} (${newMachine.requiredHp} HP) at ${newMachine.location}.`,
        `Direct listing by user ${store.state.currentUser.name}.`
      );

      store.addNotification(
        "Equipment Listed Successfully!",
        `Your ${newMachine.name} is now visible across the Punjab rental marketplace.`,
        "success"
      );

      store.saveState();
      listForm.reset();
      showToast("Machinery successfully listed on YantraShare!", "success");
      navigateToPage("tools");
    });
  }

  // 2. Farmer Onboarding & Details Filling Form
  const onboardingForm = document.getElementById("onboarding-form");
  if (onboardingForm) {
    onboardingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const district = document.getElementById("onboard-district").value;
      const village = document.getElementById("onboard-village").value.trim();
      const years = parseInt(document.getElementById("onboard-years").value);
      const acres = parseFloat(document.getElementById("onboard-acres").value);
      const hasExp = document.getElementById("onboard-has-exp").value === "yes";
      const expNotes = document.getElementById("onboard-exp-notes").value.trim();
      const tractor = document.getElementById("onboard-tractor").value.trim();
      const tractorHp = parseInt(document.getElementById("onboard-tractor-hp").value || 0);

      // Determine category automatically
      let category = "Large";
      if (acres <= 2.5) category = "Marginal";
      else if (acres <= 5.0) category = "Small";
      else if (acres <= 25.0) category = "Medium";

      // Update current user
      const user = store.state.currentUser;
      user.district = district;
      user.village = village;
      user.farmingYears = years;
      user.landSize = acres;
      user.category = category;
      user.hasPriorExperience = hasExp;
      user.experienceNotes = expNotes;
      user.tractorOwned = tractor;
      user.tractorHp = tractorHp;

      store.addAuditLog(
        "FARMER_VERIFICATION_UPDATED",
        `Farmer profile updated for ${user.name}. Assigned category: ${category} (${acres} acres).`,
        `Self-declared farming details submitted and validated.`
      );

      store.addNotification(
        "Profile & Verification Updated",
        `Your details have been saved. Priority ranking tier set to: ${category} Farmer.`,
        "success"
      );

      store.saveState();
      closeModal("onboarding-modal");
      updateUserUI();
      renderProfileView();
      showToast("Farmer details verified & priority score updated!", "success");
    });
  }

  // 3. Rent Request Submission
  const bookingForm = document.getElementById("booking-request-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const machine = store.state.machines.find(m => m.id === activeBookingMachineId);
      if (!machine) return;

      const user = store.state.currentUser;
      const acres = parseFloat(document.getElementById("booking-farmer-acres").value);
      const urgencyDays = parseInt(document.getElementById("booking-urgency-days").value);
      const tractorOption = document.getElementById("booking-tractor-option").value;
      const bookingDate = document.getElementById("booking-target-date").value || "2026-11-04";
      const location = document.getElementById("booking-field-location").value;

      // Urgency calculation
      let urgencyPts = urgencyDays === 1 ? 40 : urgencyDays <= 3 ? 28 : 12;
      let categoryPts = user.category === "Marginal" ? 35 : user.category === "Small" ? 28 : user.category === "Medium" ? 15 : 8;
      let usageCapPts = 20;
      let totalScore = urgencyPts + categoryPts + usageCapPts + Math.floor(Math.random() * 5);

      const newReq = {
        id: "REQ-" + Math.floor(810 + Math.random() * 800),
        machineId: machine.id,
        machineName: machine.name,
        farmerId: user.id,
        farmerName: user.name,
        farmerCategory: user.category,
        acres: acres,
        urgencyDays: urgencyDays,
        tractorOption: tractorOption,
        date: bookingDate,
        district: user.district,
        village: location,
        recentBookingsThisSeason: 0,
        score: totalScore,
        rankingReason: `Field urgency (${urgencyDays} day(s) wait: +${urgencyPts} pts), ${user.category} farmer tier (+${categoryPts} pts), Fair-usage cap (+${usageCapPts} pts). Total: ${totalScore} pts.`,
        status: "pending",
        conditionPre: null,
        conditionPost: null
      };

      store.state.requests.unshift(newReq);

      store.addAuditLog(
        "BOOKING_REQUEST_CREATED",
        `Request ${newReq.id} created by ${user.name} for ${machine.name} (${acres} acres).`,
        `Automated scoring ranked request at ${totalScore} points.`
      );

      store.addNotification(
        "Request Submitted to CHC Dispatch",
        `Your request for ${machine.name} has been placed. Transparent score: ${totalScore} pts.`,
        "success"
      );

      store.saveState();
      closeModal("booking-modal");
      renderDispatchBoard();
      renderProfileView();
      showToast("Rental request placed! CHC Operator will confirm dispatch.", "success");
      navigateToPage("profile");
    });
  }

  // 4. Auth Modal Form
  const authForm = document.getElementById("auth-form");
  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("auth-name").value.trim() || "Progressive Farmer";
      const phone = document.getElementById("auth-phone").value.trim() || "+91 98765-11223";
      
      store.state.currentUser.name = name;
      store.state.currentUser.phone = phone;
      store.saveState();
      
      closeModal("auth-modal");
      updateUserUI();
      renderProfileView();
      showToast(`Welcome to YantraShare, ${name}!`, "success");
    });
  }
}

// --------------------------------------------------------------------------
// Modal Helpers & UI Toasts
// --------------------------------------------------------------------------
function setupModals() {
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("show");
      }
    });
  });

  document.querySelectorAll(".modal-close-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-overlay");
      if (modal) modal.classList.remove("show");
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
  }
}

function openAuthModal(mode = 'login') {
  const title = document.getElementById("auth-modal-title");
  const submitBtn = document.getElementById("auth-submit-btn");
  const signupFields = document.getElementById("auth-signup-fields");
  
  if (mode === 'signup') {
    if (title) title.textContent = "Create Farmer / CHC Account";
    if (submitBtn) submitBtn.textContent = "Complete Sign Up";
    if (signupFields) signupFields.style.display = "block";
  } else {
    if (title) title.textContent = "Sign In to YantraShare";
    if (submitBtn) submitBtn.textContent = "Sign In with OTP / Password";
    if (signupFields) signupFields.style.display = "none";
  }
  
  openModal("auth-modal");
}

function openOnboardingModal() {
  const user = store.state.currentUser;
  
  // Fill inputs
  const dist = document.getElementById("onboard-district");
  const vill = document.getElementById("onboard-village");
  const yrs = document.getElementById("onboard-years");
  const acr = document.getElementById("onboard-acres");
  const expNotes = document.getElementById("onboard-exp-notes");
  const tr = document.getElementById("onboard-tractor");
  const trHp = document.getElementById("onboard-tractor-hp");
  
  if (dist) dist.value = user.district;
  if (vill) vill.value = user.village;
  if (yrs) yrs.value = user.farmingYears;
  if (acr) acr.value = user.landSize;
  if (expNotes) expNotes.value = user.experienceNotes;
  if (tr) tr.value = user.tractorOwned;
  if (trHp) trHp.value = user.tractorHp;
  
  openModal("onboarding-modal");
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="font-size: 1.1rem;">
      ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
    </div>
    <div style="flex-grow: 1;">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// FAQ Accordion Toggle
function toggleFaq(item) {
  item.classList.toggle("open");
}
