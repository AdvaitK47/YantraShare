# YantraShare (यंत्रशेयर)

> **Fair, accountable sharing of idle crop-residue machinery at Custom Hiring Centres (CHCs)**  
> **Team:** Code Crafters  
> **Problem Statement:** Unlock Underused Equipment and Spaces  
> **Primary Evidence:** Council on Energy, Environment and Water (CEEW) Report — *Custom Hiring Centres for Better Crop Residue Management: Insights from Punjab* (September 2025)

---

## 🌾 Overview

During the short 3-week harvest window (October–November) in Punjab, farmers must sow wheat immediately after harvesting paddy. Without timely access to Crop Residue Management (CRM) machinery—such as **Super Seeders**, **Happy Seeders**, and **Straw Balers**—farmers face immense pressure to burn stubble, causing severe regional air pollution and soil degradation.

India has subsidized over **1.37 lakh CRM machines** and created **25,400+ Custom Hiring Centres (CHCs)** across Punjab. However, as documented by CEEW research:
- Over **53% of renting CHCs have at least one underutilized machine**.
- Roughly half of private CHCs allocate machines only to their own in-group despite receiving an **80% government subsidy**.
- Allocation has historically been handled by phone calls, personal relationships, and handwritten registers with no transparent conflict resolution or damage logs.

**YantraShare** provides a clean, fair, and accountable operations and sharing platform that connects smallholders, cooperative societies, and equipment owners with explainable urgency allocation and verified condition handovers.

---

## 🎨 Design Aesthetics & Architecture

Designed with a high-end minimalist precision agriculture aesthetic (inspired by *LuckyCharm* and *ByDrive*):
- **Monotone, Clean & Uncluttered**: No unnecessary emojis; uses crisp monochrome typography, sleek badges, and minimal SVG icons.
- **Seamless White-to-Landscape Transition**: The hero section starts pure white with delicate cross accents (`+`) and merges smoothly into wide, high-resolution Punjab agricultural landscapes.
- **Black Capsule Nav**: Aesthetic black pill navigation capsule (`background: #09090b`) with refined padding and compact typography.
- **Amazon-Style Product Pages**: Dedicated full-page view (`machine.html?id=...`) with photo gallery, technical specifications table, break-even target meter, and sticky buy/rent box with real-time fairness scoring.

---

## 📂 Project Hierarchy

```
farmer Renting service/
├── README.md                                 # Project documentation & walkthrough
├── Code_Crafters_Project_Document_Final.pdf  # Source specification document
├── backend/                                  # Allocation & Workflow FastAPI Backend
│   ├── Allocation_README.md                  # Detailed backend design & testing guide
│   ├── workflow_api.py                       # Persistent SQLite booking workflow & audit API (Port 8001)
│   ├── allocation.py                         # Urgency ranking, usage caps & recovery engine
│   ├── allocation_api.py                     # Allocation recommendation service (Port 8000)
│   ├── test_allocation.py                    # Automated allocation unit tests (10 tests)
│   ├── test_competition.py                   # Multi-resource competition tests (2 tests)
│   ├── demo.py                               # Demonstration script for allocation scoring
│   ├── integration_demo.py                   # Multi-stage workflow demo
│   └── yantrashare.db                        # SQLite persistent workflow database
└── frontend/                                 # Complete modular web application
    ├── index.html                            # Home page (LuckyCharm aesthetic, search, stats)
    ├── tools.html                            # Tools & Machinery catalog (all items rendered)
    ├── machine.html                          # Amazon-style full product & rental page
    ├── profile.html                          # User profile & farmer verification details
    ├── list-equipment.html                   # Equipment listing with photo upload & preview
    ├── dispatch.html                         # Owner dispatch board & conflict resolution
    ├── admin.html                            # Hidden Admin fairness & audit dashboard
    ├── login.html                            # Authentication & 1-click judge shortcuts
    ├── css/
    │   └── style.css                         # Unified minimalist design system
    ├── js/
    │   ├── data.js                           # Shared persistent state store & API connector
    │   └── nav.js                            # Shared navigation, toast alerts & persona bar
    └── assets/
        └── images/                           # High-resolution agricultural imagery
            ├── hero.jpg                      # Aerial farmland landscape
            ├── super_seeder.jpg              # Tractor with Super Seeder implement
            ├── happy_seeder.jpg              # Happy Seeder direct drilling
            ├── baler.jpg                     # High-density square baler
            └── farmer.jpg                    # Progressive Indian farmer portrait
```


---

## ⚡ Key Features

### 1. Universal Dual Role (Rent & List from One Account)
Any user can switch between renting machinery for their fields and listing their idle tractors or implements to earn rental income during off-peak windows.

### 2. Equipment Photo Upload with Live Preview
When listing equipment on [`list-equipment.html`](frontend/list-equipment.html), users can upload custom photos from their device with immediate thumbnail previews or select verified stock CRM photos.

### 3. Amazon-Style Dedicated Machinery Pages
Clicking **Details & Rent →** opens [`machine.html`](frontend/machine.html) with:
- **Image Gallery & Zoom**: High-resolution implement views.
- **Technical Specifications**: HP requirements, model year, rotor speed, and tillage depth.
- **ICAR-NDRI Break-Even Tracker**: Progress bar tracking annual acreage against the 105-acre benchmark required to break even.
- **Sticky Buy/Rent Box**: Date picker, acreage input, urgency selector, and live fairness score.

### 4. Explainable Urgency-Based Allocation
When multiple farmers need a machine on the same date:
$$\text{Score} = \text{Field Urgency (up to 40 pts)} + \text{Small Farmer Tier (up to 35 pts)} + \text{Fair Usage (20 pts)} + \text{Request Time}$$
Every farmer sees a transparent plain-language breakdown explaining their queue rank.

### 5. Owner Dispatch Board & Human Overrides
On [`dispatch.html`](frontend/dispatch.html), CHC operators review competing requests with conflicts highlighted. If an operator overrides the automated rank, state compliance requires a **mandatory recorded written reason** permanently stored in the audit trail.

### 6. Breakdown & Overdue Auto-Recovery
If a machine breaks down, the platform re-ranks the queue and automatically suggests substitute machinery from neighboring Custom Hiring Centres.

### 7. Hidden Admin Fairness & Audit Trail
Accessible on [`admin.html`](frontend/admin.html) for state agricultural auditors:
- Tracks total acres direct-seeded and stubble burning emissions averted (in metric tons).
- Monitors compliance with small/marginal farmer quotas (>50%).
- Full immutable chronological log of state transitions (`BOOKING_APPROVED`, `HUMAN_OVERRIDE_RECORDED`, etc.).

---

## 🔑 Demo & Testing Personas

Use the persistent demo bar at the top of any page to test user journeys with 1 click:

| Role | Username | Password | Profile | Testing Highlight |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer A** | `farmer_a` | `Demo@1234` | Gurpreet Singh (Small, 2.5 ac) | 1-day critical urgency, ranked #1 (92 pts) |
| **Farmer B** | `farmer_b` | `Demo@1234` | Balwinder Singh (Large, 22 ac) | 5-day wait window, waitlisted with explanation |
| **CHC Owner** | `owner` | `Demo@1234` | Harinder Kaur (Dehlon CHC) | Dispatch board, approvals, manual override modal |
| **Society Manager** | `manager` | `Demo@1234` | Jaspal Singh (Nabha Coop) | Day-to-day approvals, handover condition logs |
| **Administrator** | `admin` | `Demo@1234` | Dr. N. S. Sarao (State CRM) | Full audit trail, anti-monopolization metrics |

---

## 🚀 How to Run Locally

### 1. Start the Backend Workflow API (FastAPI)
```bash
# In the backend directory
cd backend
python -m uvicorn workflow_api:app --host 127.0.0.1 --port 8001 --reload

# Swagger API docs available at:
# http://127.0.0.1:8001/docs
```

### 2. Start the Frontend Web App
```bash
# In the project root (separate terminal)
python -m http.server 5173 --directory frontend

# Open in browser:
# http://localhost:5173/index.html
```

### 3. Run Backend Unit Tests
```bash
cd backend
python -m unittest discover -v
# Ran 12 tests in 0.003s — OK
```


---

## 📜 References
- **CEEW Report (2025):** Jain, S., Kemanth, K. and Sarao, N. S. *Custom Hiring Centres for Better Crop Residue Management: Insights from Punjab*. New Delhi: Council on Energy, Environment and Water.
- **ICAR-NDRI (2020):** *Mitigation of Stubble Burning through Custom Hiring Centres in Punjab*.
- **Government of India:** Department of Agriculture and Farmers Welfare, *Crop Residue Management Scheme Guidelines*.
