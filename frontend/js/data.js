/**
 * YantraShare - Shared Data Store & State Manager
 * Persists data across multiple pages in localStorage
 */

const DEFAULT_STATE = {
  currentPersona: "farmer_a",
  personas: {
    farmer_a: {
      id: "farmer_a",
      name: "Gurpreet Singh",
      role: "farmer",
      tier: "Small Farmer",
      district: "Ludhiana",
      village: "Raikot",
      farmingYears: 12,
      landSize: 2.5,
      category: "Small",
      priorExperience: true,
      experienceNotes: "Operated Happy Seeder and 50HP tractor for 3 harvest seasons.",
      tractorOwned: "Sonalika DI 50 RX",
      tractorHp: 50,
      avatar: "assets/images/farmer.jpg"
    },
    farmer_b: {
      id: "farmer_b",
      name: "Balwinder Singh",
      role: "farmer",
      tier: "Large Commercial",
      district: "Ludhiana",
      village: "Khanna",
      farmingYears: 24,
      landSize: 22.0,
      category: "Large",
      priorExperience: true,
      experienceNotes: "Manages large acreage with 3 commercial tractors.",
      tractorOwned: "John Deere 55HP & Farmtrac 60",
      tractorHp: 60,
      avatar: "assets/images/farmer.jpg"
    },
    owner: {
      id: "owner",
      name: "Harinder Kaur",
      role: "owner",
      tier: "CHC Secretary",
      district: "Ludhiana",
      village: "Dehlon",
      farmingYears: 15,
      landSize: 12.0,
      category: "CHC Operator",
      priorExperience: true,
      experienceNotes: "Managing 8 subsidized CRM machines under Central CHC scheme.",
      tractorOwned: "John Deere 5310 & Swaraj 855",
      tractorHp: 55,
      avatar: "assets/images/farmer.jpg"
    },
    manager: {
      id: "manager",
      name: "Jaspal Singh",
      role: "manager",
      tier: "Society Staff",
      district: "Patiala",
      village: "Nabha",
      farmingYears: 18,
      landSize: 6.0,
      category: "Society Staff",
      priorExperience: true,
      experienceNotes: "Secretary at Nabha Farmers Cooperative Society.",
      tractorOwned: "New Holland 5620",
      tractorHp: 65,
      avatar: "assets/images/farmer.jpg"
    },
    admin: {
      id: "admin",
      name: "Dr. N. S. Sarao",
      role: "admin",
      tier: "State Admin",
      district: "Chandigarh",
      village: "HQ Commission",
      farmingYears: 20,
      landSize: 0,
      category: "State Admin",
      priorExperience: true,
      experienceNotes: "State Agricultural Research & CRM Equipment Monitor.",
      tractorOwned: "Inspection Fleet",
      tractorHp: 75,
      avatar: "assets/images/farmer.jpg"
    }
  },
  
  machines: [
    {
      id: "MCH-101",
      name: "Shaktiman 7ft Super Seeder Pro",
      category: "super_seeder",
      categoryLabel: "Super Seeder",
      brand: "Shaktiman Agro",
      modelYear: 2024,
      ownerId: "owner",
      ownerName: "Harinder Kaur",
      chcName: "Harinder Kaur Farm Services & CHC",
      location: "Dehlon, Ludhiana",
      district: "Ludhiana",
      status: "available",
      requiredHp: 55,
      ratePerAcre: 1850,
      rateMachineOnly: 450,
      image: "assets/images/super_seeder.jpg",
      subsidized: true,
      breakEvenTarget: 105,
      acresServedSeason: 82,
      conditionRating: 4.9,
      reviewsCount: 84,
      features: [
        "Heavy Duty Multi-speed Gearbox (540 / 1000 RPM)",
        "Nickel Chrome Boron Steel Rotor Blades",
        "Direct seeding in standing paddy stubble up to 14 inches",
        "Precision depth control roller with soil compactor",
        "Includes experienced certified CHC operator and fuel"
      ],
      description: "Direct sowing of wheat into standing paddy stubble without any prior field preparation or stubble burning. Features a multi-speed gearbox, boron steel rotary tines that chop residue into mulch, and spring-loaded coulters for uniform seed placement.",
      specs: {
        "Working Width": "7 Feet (2100 mm)",
        "Tractor Horsepower": "55 HP Minimum",
        "Tillage Depth": "2 to 3.5 Inches",
        "Seed Metering": "Fluted Roller Mechanism",
        "Fertilizer Box Capacity": "65 Kg",
        "Rotor Speed": "220 RPM at 540 PTO",
        "Residue Handling Capacity": "Up to 3.5 Tons / Acre",
        "Owner": "Harinder Kaur (CHC Secretary)",
        "Govt Subsidy Scheme": "Subsidized at 80% under CRM Punjab"
      }
    },
    {
      id: "MCH-102",
      name: "Dasmesh Turbo Happy Seeder 9-Row",
      category: "happy_seeder",
      categoryLabel: "Happy Seeder",
      brand: "Dasmesh Mechanical",
      modelYear: 2023,
      ownerId: "manager",
      ownerName: "Jaspal Singh",
      chcName: "Malwa Farmer Producer Society",
      location: "Nabha, Patiala",
      district: "Patiala",
      status: "available",
      requiredHp: 50,
      ratePerAcre: 1650,
      rateMachineOnly: 400,
      image: "assets/images/happy_seeder.jpg",
      subsidized: true,
      breakEvenTarget: 105,
      acresServedSeason: 64,
      conditionRating: 4.8,
      reviewsCount: 52,
      features: [
        "Flail Type residue cutting blades",
        "Inverted T-type furrow openers",
        "Uniform straw mulch deposition for moisture retention",
        "Low diesel consumption: 6.5 Litres / Acre",
        "Option to rent with or without tractor"
      ],
      description: "Proven zero-burn agricultural implement that cuts paddy straw, creates a narrow seed furrow, places seeds and fertilizer, and deposits uncut straw over the seeded row as protective mulch.",
      specs: {
        "Row Count": "9 Rows (22.5 cm Spacing)",
        "Tractor Horsepower": "50 HP Minimum",
        "Tillage Type": "Strip Tillage / Mulch Direct Drill",
        "Weight": "680 Kg",
        "Seed Hopper Capacity": "50 Kg",
        "Owner": "Jaspal Singh (Society Staff)",
        "Operational Speed": "3.5 - 5.0 Km/h"
      }
    },
    {
      id: "MCH-103",
      name: "Krone High-Density Square Baler",
      category: "baler",
      categoryLabel: "Straw Baler & Rake",
      brand: "Krone / Kartar",
      modelYear: 2024,
      ownerId: "farmer_b",
      ownerName: "Balwinder Singh",
      chcName: "Balwinder Singh Commercial Farm Fleet",
      location: "Khanna, Ludhiana",
      district: "Ludhiana",
      status: "available",
      requiredHp: 65,
      ratePerAcre: 1400,
      rateMachineOnly: 500,
      image: "assets/images/baler.jpg",
      subsidized: true,
      breakEvenTarget: 140,
      acresServedSeason: 112,
      conditionRating: 4.9,
      reviewsCount: 46,
      features: [
        "High-throughput double knotter system",
        "Up to 400 compact straw bales per hour",
        "Ex-situ biomass supply chain linked",
        "Includes hydraulic straw rake implement"
      ],
      description: "Packs loose crop residue into compressed square bales ready for transport to biomass fuel boilers and compressed bio-gas (CBG) facilities.",
      specs: {
        "Bale Dimensions": "14 x 18 Inches",
        "Tractor Horsepower": "65 HP Minimum",
        "Bale Density": "140 - 180 Kg/m³",
        "Knotter Type": "Heavy Duty Double Twine",
        "Owner": "Balwinder Singh (Large Farmer)",
        "Pickup Width": "1.85 Metres"
      }
    },
    {
      id: "MCH-104",
      name: "Farmpower Mulcher & Paddy Straw Chopper",
      category: "chopper",
      categoryLabel: "Paddy Straw Chopper",
      brand: "Farmpower",
      modelYear: 2023,
      ownerId: "farmer_a",
      ownerName: "Gurpreet Singh",
      chcName: "Gurpreet Singh Agro Services",
      location: "Raikot, Ludhiana",
      district: "Ludhiana",
      status: "available",
      requiredHp: 45,
      ratePerAcre: 1200,
      rateMachineOnly: 350,
      image: "assets/images/hero.jpg",
      subsidized: true,
      breakEvenTarget: 100,
      acresServedSeason: 94,
      conditionRating: 4.7,
      reviewsCount: 38,
      features: [
        "Heavy duty serrated counter blades",
        "Uniform 2-inch residue chopping",
        "Wide deflection residue spreader",
        "Pre-inspected gearbox and balanced rotor"
      ],
      description: "Chops combine-harvested paddy straw into fine mulch and spreads it evenly across the soil surface for rapid natural decomposition.",
      specs: {
        "Cutting Width": "6.5 Feet",
        "Required HP": "45 HP",
        "Number of Blades": "28 Serrated Knives",
        "Owner": "Gurpreet Singh (Small Farmer)",
        "Rotor Shaft Speed": "1800 RPM"
      }
    },
    {
      id: "MCH-105",
      name: "Preet 3-Bottom Reversible MB Plough",
      category: "plough",
      categoryLabel: "Reversible MB Plough",
      brand: "Preet Agro",
      modelYear: 2023,
      ownerId: "owner",
      ownerName: "Harinder Kaur",
      chcName: "Harinder Kaur Farm Services & CHC",
      location: "Dehlon, Ludhiana",
      district: "Ludhiana",
      status: "available",
      requiredHp: 55,
      ratePerAcre: 1300,
      rateMachineOnly: 300,
      image: "assets/images/super_seeder.jpg",
      subsidized: false,
      breakEvenTarget: 90,
      acresServedSeason: 52,
      conditionRating: 4.6,
      reviewsCount: 29,
      features: [
        "Hydraulic turnover mechanism",
        "Boron steel wear plates and bar points",
        "Deep 10-inch soil inversion to bury root residue",
        "Trash board attachments"
      ],
      description: "Inverts soil layers to bury residue completely below the seed zone, increasing soil moisture retention and organic matter.",
      specs: {
        "Bottoms": "3 Furrows",
        "Required HP": "55 HP",
        "Ploughing Depth": "8 - 12 Inches",
        "Owner": "Harinder Kaur (CHC Secretary)",
        "Under-beam Clearance": "720 mm"
      }
    },
    {
      id: "MCH-106",
      name: "John Deere 5310 GearPro 4WD (55 HP)",
      category: "tractor",
      categoryLabel: "Heavy Duty Tractor",
      brand: "John Deere",
      modelYear: 2024,
      ownerId: "owner",
      ownerName: "Harinder Kaur",
      chcName: "Harinder Kaur Farm Services & CHC",
      location: "Dehlon, Ludhiana",
      district: "Ludhiana",
      status: "available",
      requiredHp: 55,
      ratePerAcre: 900,
      rateMachineOnly: 850,
      image: "assets/images/happy_seeder.jpg",
      subsidized: true,
      breakEvenTarget: 150,
      acresServedSeason: 135,
      conditionRating: 5.0,
      reviewsCount: 71,
      features: [
        "Turbocharged 55 HP Engine with High Lugging Power",
        "4-Wheel Drive Traction for heavy wet soils",
        "Independent PTO with 540 & 540E economy speeds",
        "Factory-trained certified operator included"
      ],
      description: "High-power 4WD workhorse specifically allocated by Harinder Kaur's Custom Hiring Centre to drive heavy Super Seeders across Punjab fields.",
      specs: {
        "Engine": "3-Cylinder Turbocharged Diesel",
        "Horsepower": "55 HP @ 2400 RPM",
        "Drive": "4WD Mechanical Front Wheel Drive",
        "Lifting Capacity": "2000 Kg at Link Ends",
        "Owner": "Harinder Kaur (CHC Secretary)",
        "PTO Power": "49.5 HP"
      }
    }
  ],

  requests: [
    {
      id: "REQ-802",
      machineId: "MCH-106",
      machineName: "John Deere 5310 GearPro 4WD (55 HP)",
      ownerId: "owner",
      ownerName: "Harinder Kaur",
      farmerId: "farmer_b",
      farmerName: "Balwinder Singh",
      farmerCategory: "Large",
      acres: 18.0,
      urgencyDays: 3,
      tractorOption: "need_both",
      date: "2026-11-05",
      district: "Ludhiana",
      village: "Khanna",
      recentBookings: 1,
      score: 68,
      rankingReason: "Field preparation: 18 acres, 3 days urgency (+30 pts), Large Farmer (+15 pts), Fair-Usage (+20 pts), Request Time (+3 pts). Total: 68 pts.",
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      conditionPre: null,
      conditionPost: null
    },
    {
      id: "REQ-801",
      machineId: "MCH-101",
      machineName: "Shaktiman 7ft Super Seeder Pro",
      ownerId: "owner",
      ownerName: "Harinder Kaur",
      farmerId: "farmer_a",
      farmerName: "Gurpreet Singh",
      farmerCategory: "Small",
      acres: 3.5,
      urgencyDays: 1,
      tractorOption: "need_both",
      date: "2026-11-02",
      district: "Ludhiana",
      village: "Raikot",
      recentBookings: 0,
      score: 92,
      rankingReason: "Field Urgency (1 day before sowing deadline: +40 pts), Small Farmer Tier (+30 pts), Fair-Usage (+20 pts), Request Time (+2 pts). Total: 92 pts.",
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      conditionPre: null,
      conditionPost: null
    },
    {
      id: "REQ-803",
      machineId: "MCH-103",
      machineName: "Krone High-Density Square Baler",
      ownerId: "farmer_b",
      ownerName: "Balwinder Singh",
      farmerId: "farmer_a",
      farmerName: "Gurpreet Singh",
      farmerCategory: "Small",
      acres: 4.0,
      urgencyDays: 2,
      tractorOption: "need_both",
      date: "2026-11-04",
      district: "Ludhiana",
      village: "Raikot",
      recentBookings: 0,
      score: 85,
      rankingReason: "Ex-situ biomass baling: High Urgency (2 days: +30 pts), Small Farmer priority (+30 pts), Fair-usage (+20 pts). Total: 85 pts.",
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      conditionPre: null,
      conditionPost: null
    }
  ],

  auditLogs: [
    {
      id: "AUD-1001",
      timestamp: "2026-10-28 14:15:22",
      actor: "Harinder Kaur (CHC Secretary)",
      action: "BOOKING_APPROVED",
      details: "Approved REQ-803 for Jagtar Singh (Happy Seeder). Validated marginal farmer subsidy tier.",
      reason: "Automated fairness score (88/100) verified. No scheduling conflict."
    },
    {
      id: "AUD-1002",
      timestamp: "2026-10-28 16:40:11",
      actor: "Jaspal Singh (Society Staff)",
      action: "PRE_HANDOVER_INSPECTED",
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

  notifications: [
    {
      id: "NOTIF-1",
      title: "Booking Request Ranked #1",
      message: "Your Super Seeder request at Raikot has scored 92/100 based on field urgency.",
      type: "success",
      time: "10 mins ago",
      unread: true
    },
    {
      id: "NOTIF-2",
      title: "Harvest Window Advisory",
      message: "Optimal moisture window for direct wheat seeding ends in 4 days across Ludhiana.",
      type: "info",
      time: "1 hour ago",
      unread: true
    }
  ]
};

// Global Store
class YantraStore {
  constructor() {
    this.key = "yantrashare_data_v3";
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Storage load error", e);
    }
    this.save(DEFAULT_STATE);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save(dataToSave = null) {
    if (dataToSave) {
      this.data = dataToSave;
    }
    localStorage.setItem(this.key, JSON.stringify(this.data));
  }

  getCurrentUser() {
    return this.data.personas[this.data.currentPersona] || this.data.personas.farmer_a;
  }

  switchPersona(personaId) {
    if (this.data.personas[personaId]) {
      this.data.currentPersona = personaId;
      this.save();
      return this.getCurrentUser();
    }
  }

  getMachines(filter = {}) {
    return this.data.machines.filter(m => {
      if (filter.category && filter.category !== "all" && m.category !== filter.category) return false;
      if (filter.district && filter.district !== "all" && m.district.toLowerCase() !== filter.district.toLowerCase()) return false;
      if (filter.maxHp && m.requiredHp > parseInt(filter.maxHp)) return false;
      return true;
    });
  }

  getMachineById(id) {
    return this.data.machines.find(m => m.id === id);
  }

  addBookingRequest(bookingData) {
    this.data.requests.unshift(bookingData);
    this.data.auditLogs.unshift({
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${bookingData.farmerName} (${bookingData.farmerCategory} Farmer)`,
      action: "BOOKING_REQUEST_CREATED",
      details: `Request placed for ${bookingData.machineName} (${bookingData.acres} acres at ${bookingData.village}).`,
      reason: `Fairness score: ${bookingData.score} pts. Sowing urgency: ${bookingData.urgencyDays} day(s).`
    });
    this.save();
  }

  approveBookingRequest(requestId, approverUser) {
    const req = this.data.requests.find(r => r.id === requestId);
    if (!req) return null;

    req.status = "approved";
    req.approvedBy = approverUser.name;
    req.approvedAt = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Notification for the renter
    this.data.notifications.unshift({
      id: "NOTIF-" + Date.now(),
      targetUserId: req.farmerId,
      title: "Booking Request Approved!",
      message: `Your rental request for ${req.machineName} has been approved by ${approverUser.name}.`,
      type: "success",
      time: "Just now",
      unread: true
    });

    // Audit log
    this.data.auditLogs.unshift({
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${approverUser.name} (Machinery Owner)`,
      action: "OWNER_BOOKING_APPROVED",
      details: `Approved booking ${req.id} for ${req.farmerName} on ${req.machineName} (${req.acres} acres).`,
      reason: `Direct owner approval via profile dashboard.`
    });

    if (window.yantraAPI && window.yantraAPI.isOnline) {
      window.yantraAPI.recordDecision(req.id, "approved", approverUser.id, "Approved by machinery owner in profile");
    }

    this.save();
    return req;
  }

  rejectBookingRequest(requestId, rejecterUser) {
    const req = this.data.requests.find(r => r.id === requestId);
    if (!req) return null;

    req.status = "rejected";
    req.rejectedBy = rejecterUser.name;
    req.rejectedAt = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Notification for renter
    this.data.notifications.unshift({
      id: "NOTIF-" + Date.now(),
      targetUserId: req.farmerId,
      title: "Booking Declined",
      message: `Your rental request for ${req.machineName} was declined by ${rejecterUser.name}.`,
      type: "info",
      time: "Just now",
      unread: true
    });

    // Audit log
    this.data.auditLogs.unshift({
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: `${rejecterUser.name} (Machinery Owner)`,
      action: "OWNER_BOOKING_DECLINED",
      details: `Declined booking ${req.id} for ${req.farmerName} on ${req.machineName}.`,
      reason: `Declined by owner due to operational capacity.`
    });

    if (window.yantraAPI && window.yantraAPI.isOnline) {
      window.yantraAPI.recordDecision(req.id, "rejected", rejecterUser.id, "Declined by machinery owner in profile");
    }

    this.save();
    return req;
  }

  addMachine(machine) {
    this.data.machines.unshift(machine);
    this.data.auditLogs.unshift({
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: this.getCurrentUser().name,
      action: "EQUIPMENT_LISTED",
      details: `New listing: ${machine.name} (${machine.requiredHp} HP) at ${machine.location}.`,
      reason: "Asset published for community crop residue management."
    });
    this.save();
  }

  updateCurrentUser(updates) {
    const cur = this.getCurrentUser();
    Object.assign(cur, updates);
    this.data.personas[this.data.currentPersona] = cur;
    this.data.auditLogs.unshift({
      id: "AUD-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: cur.name,
      action: "FARMER_VERIFICATION_UPDATED",
      details: `Profile updated: ${cur.landSize} Acres, Category: ${cur.category}, Farming: ${cur.farmingYears} years.`,
      reason: "Farmer onboarding verification details saved."
    });
    this.save();
  }

  resetAll() {
    localStorage.removeItem(this.key);
    this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }
}

window.yantraStore = new YantraStore();

// --------------------------------------------------------------------------
// YantraAPI Client — Connects Frontend to FastAPI Backend (workflow_api.py)
// --------------------------------------------------------------------------
const API_BASE = "http://127.0.0.1:8001";

class YantraAPIClient {
  constructor() {
    this.isOnline = false;
    this.checkHealth();
  }

  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/`, { method: "GET" });
      if (res.ok) {
        this.isOnline = true;
        this.updateBadge(true);
        this.syncInitial();
      } else {
        this.updateBadge(false);
      }
    } catch (e) {
      this.isOnline = false;
      this.updateBadge(false);
    }
  }

  updateBadge(isOnline) {
    const badge = document.getElementById("api-status-badge");
    if (badge) {
      if (isOnline) {
        badge.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-right:4px;"></span>API: Online (8001)`;
        badge.style.color = "#10b981";
        badge.style.borderColor = "rgba(16, 185, 129, 0.4)";
      } else {
        badge.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#71717a;margin-right:4px;"></span>API: Local Mode`;
        badge.style.color = "#a1a1aa";
      }
    }
  }

  async syncInitial() {
    try {
      const res = await fetch(`${API_BASE}/requests`);
      if (res.ok) {
        const backendReqs = await res.json();
        if (Array.isArray(backendReqs) && backendReqs.length > 0) {
          backendReqs.forEach(br => {
            const existing = window.yantraStore.data.requests.find(r => r.id === br.id);
            if (!existing) {
              window.yantraStore.data.requests.push({
                id: br.id,
                machineId: br.machine_id,
                machineName: br.resource_name || "CRM Implement",
                farmerId: br.farmer_id,
                farmerName: br.farmer_id === "farmer_a" ? "Gurpreet Singh" : br.farmer_id === "farmer_b" ? "Balwinder Singh" : "Jagtar Singh",
                farmerCategory: br.farmer_category || "Small",
                acres: br.acreage || 3.5,
                urgencyDays: br.days_can_wait || 1,
                tractorOption: "need_both",
                date: br.requested_date,
                district: "Ludhiana",
                village: "Raikot",
                recentBookings: br.recent_uses || 0,
                score: br.score || 92,
                rankingReason: br.explanation || "Algorithm ranked by urgency and farmer category.",
                status: br.status === "requested" ? "pending" : br.status,
                conditionPre: null,
                conditionPost: null
              });
            }
          });
          window.yantraStore.save();
        }
      }

      const auditRes = await fetch(`${API_BASE}/audit`);
      if (auditRes.ok) {
        const auditEvents = await auditRes.json();
        if (Array.isArray(auditEvents) && auditEvents.length > 0) {
          auditEvents.forEach(ae => {
            const existing = window.yantraStore.data.auditLogs.find(al => al.id === "AUD-" + ae.id);
            if (!existing) {
              window.yantraStore.data.auditLogs.unshift({
                id: "AUD-" + ae.id,
                timestamp: ae.created_at,
                actor: ae.actor_id,
                action: ae.action.toUpperCase(),
                details: `Request ${ae.request_id}: Status changed from ${ae.old_status || 'none'} to ${ae.new_status}.`,
                reason: ae.reason
              });
            }
          });
          window.yantraStore.save();
        }
      }
    } catch (e) {
      console.warn("Backend sync notice:", e);
    }
  }

  async postBooking(bookingData) {
    if (!this.isOnline) return null;
    try {
      const payload = {
        farmer_id: bookingData.farmerId,
        machine_id: bookingData.machineId,
        requested_date: bookingData.date,
        start_time: "08:00",
        end_time: "18:00",
        acreage: parseFloat(bookingData.acres),
        days_can_wait: parseInt(bookingData.urgencyDays),
        farmer_category: bookingData.farmerCategory || "Small",
        recent_uses: bookingData.recentBookings || 0,
        eligible: true
      };

      const res = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        try {
          await fetch(`${API_BASE}/allocation/run/${bookingData.machineId}/${bookingData.date}`, {
            method: "POST"
          });
        } catch (_) {}
        return created;
      }
    } catch (e) {
      console.warn("API postBooking fallback to local", e);
    }
    return null;
  }

  async recordDecision(requestId, decision, actorId, reason) {
    if (!this.isOnline) return null;
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor_id: actorId,
          decision: decision,
          reason: reason
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API recordDecision fallback to local", e);
    }
    return null;
  }

  async recordCondition(requestId, stage, actorId, conditionText) {
    if (!this.isOnline) return null;
    try {
      const endpoint = stage === "check-in" ? "check-in" : "return";
      const res = await fetch(`${API_BASE}/requests/${requestId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor_id: actorId,
          condition_text: conditionText,
          photo_note: "Digital verification logged."
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API condition check fallback to local", e);
    }
    return null;
  }

  async getRecoveryOptions(requestId) {
    if (!this.isOnline) return null;
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/recovery-options`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API recovery options fallback", e);
    }
    return null;
  }

  async postRecovery(requestId, replacementId, actorId, reason) {
    if (!this.isOnline) return null;
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor_id: actorId,
          replacement_machine_id: replacementId,
          reason: reason
        })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("API recovery fallback to local", e);
    }
    return null;
  }
}

window.yantraAPI = new YantraAPIClient();

