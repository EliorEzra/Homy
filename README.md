<div align="center">
  <img src="https://raw.githubusercontent.com/gist/assets/homy-logo-placeholder.png" alt="HOMY Logo" width="120" style="border-radius: 20%;">
  <h1>HOMY — Household Management App</h1>

  <img src="https://img.shields.io/badge/React_Native-v0.74+-61DAFB?logo=react&logoColor=black&style=for-the-badge" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-v51+-000020?logo=expo&logoColor=white&style=for-the-badge" alt="Expo">
  <img src="https://img.shields.io/badge/Appwrite-v1.5+-FD366E?logo=appwrite&logoColor=white&style=for-the-badge" alt="Appwrite">
  <img src="https://img.shields.io/badge/TypeScript-Supported-3178C6?logo=typescript&logoColor=white&style=for-the-badge" alt="TypeScript">
</div>

---

**Homy** is a premium, cross-platform mobile application designed to simplify and elevate the experience of managing a shared household. Whether you live with roommates, family members, or partners, Homy seamlessly coordinates your daily life—bringing tasks, shopping lists, shared expenses, and calendars together into one beautiful, real-time interface. 

At the heart of Homy is a robust **role-based access control (RBAC)** hierarchy and real-time WebSocket syncing, ensuring that every household member stays in perfect harmony without manual refreshes.

---

## 📌 Table of Contents

1. [System Overview](#1-system-overview)
2. [Features & Capabilities](#2-features--capabilities)
3. [Role Matrix & User Types](#3-role-matrix--user-types)
4. [Technology Stack](#4-technology-stack)
5. [Architectural Blueprint](#5-architectural-blueprint)
6. [How to Run the Project](#6-how-to-run-the-project)

---

## <a id="1-system-overview"></a>🗺️ 1. System Overview

In Homy, a **"House"** represents a virtual shared home. 

* **The Owner:** The creator (or designated administrator) who possesses full control over settings, custom roles, permission logic, and membership.
* **The Members:** Household members whose capabilities are dynamically bound by the roles assigned to them.
* **Shared Data State:** All data (tasks, shopping items, financial transactions, and events) is automatically scoped to the household and synced instantaneously across all active devices.

[⬆ Back to Top](#-table-of-contents)

---

## <a id="2-features--capabilities"></a>✨ 2. Features & Capabilities

### 🏠 Home Dashboard
* **Dynamic Welcome:** A personalized greeting based on the user's customized profile and active household status.
* **Quick Access Grid:** Seamless, one-tap navigation links pointing to each dedicated module of the application.

### 📋 Smart Tasks Manager
* **Granular Assignments:** Delegate tasks to specific house members or leave them open.
* **Kanban-Style Statuses:** Easily transition states (`To-Do` ➔ `In Progress` ➔ `Done`).
* **Smart Filtering:** Quickly toggle perspectives between **"All Tasks" / "My Tasks"** and **"All" / "Active" / "Completed"**.
* **Bulk Cleanup:** Instantly clear all completed household tasks with a single action.

### 🛒 Organized Shopping List
* **Categorized Items:** Automatically organize grocery and supply lists by category.
* **Quantity Selectors:** Precision tracking for item amounts.
* **Interactive Check-off:** Mark items off as you move through the physical store.
* **Clear Completed:** Wipe out purchased items in one go to keep lists pristine.

### 💳 Split-Expense Finances
* **Flexible Split Engine:** Log shared costs with accurate transaction dates, and split bills **evenly** or via **custom amount allocations**.
* **Live Calculation Feedback:** Real-time visual feedback showing the "Remaining" balance to be allocated as you customize splits.
* **Relational Persistence:** Robust backend structure utilizing stable User IDs instead of usernames. If a roommate changes their display name, historical financial balances remain completely intact.
* **Debts & Balances:** A calculated ledger showing exactly who owes whom, dynamically projected from the active viewer's point of view.
* **One-Tap Settle Up:** Clear outstanding debts between specific members in seconds.

### 📅 Centralized House Calendar
* **Monthly Grid Layout:** Beautiful visual summary of upcoming household events.
* **Daily Schedule Inspect:** Tap any date to reveal scheduled items or instantly add new events.
* **Targeted Visibility:** Assign events to individual household members or to the entire home.
* **High-Contrast Indicators:** Clear, responsive highlights for the current date and user-selected days.

### 🔑 Custom Roles & Hierarchy
* **Custom Roles Engine:** Owners can define custom roles tailored to their home (e.g., *Parent, Child, Guest, Landlord*).
* **Role Hierarchy Matrix:** Set up hierarchical structure determining which roles outrank others.
* **CRUD Granularity:** Fine-grained, tab-specific permission toggles (Create / Edit / Delete) per role.
* **Hierarchy Enforcement:** Optional setting allowing higher-ranked members to modify or delete content created by lower or equal-ranked members.
* **Safe-State Locking:** Newly created roles start completely locked until permissions are actively mapped by the owner.

### ⚡ Real-Time Sync Engine
* **WebSocket Integration:** Powered by **Appwrite Realtime** channels.
* **Instant Propagation:** Changes to tasks, shopping lists, financial transactions, calendar dates, user configurations, and even permission policies update immediately across all connected devices—zero manual pull-to-refresh needed.
* **Optimistic Updates:** Built with custom de-duplication layers to keep user interactions smooth while waiting for network acknowledgement.

### 🎨 Profiles & Deep Personalization
* **Avatar Customization:** Express yourself with 18 high-quality iconography presets combined with responsive background color picks.
* **Identity Management:** Easily update display names and secure passwords natively.
* **True Dark Mode:** System-wide dark mode styling. Preferences are stored safely in the cloud, syncing to your account across all login sessions.

### 📩 Membership & House Management
* **Dual Invite Systems:** Generate custom alphanumeric invite codes or direct email-based invites.
* **Ownership Succession:** Securely transfer owner permissions to any active house member.
* **Safe Exits:** Seamlessly leave a household or, as the owner, securely delete the entire workspace structure.

[⬆ Back to Top](#-table-of-contents)

---

## <a id="3-role-matrix--user-types"></a>👥 3. Role Matrix & User Types

| Feature / Action | Owner | Assigned Role | Unassigned Member |
| :--- | :---: | :---: | :---: |
| **Manage Roles & Permissions** | ✅ Yes | ❌ No | ❌ No |
| **Transfer Ownership / Delete House**| ✅ Yes | ❌ No | ❌ No |
| **Invite & Kick Members** | ✅ Yes | ❌ No | ❌ No |
| **Core App Actions (CRUD)** | ✅ Yes | 🕒 *Configurable* | ❌ Locked |
| **Personal Profile Configs** | ✅ Yes | ✅ Yes | ✅ Yes |

[⬆ Back to Top](#-table-of-contents)

---

## <a id="4-technology-stack"></a>🛠️ 4. Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React Native & Expo (v51+)** | Cross-platform runtime using TypeScript. |
| **Navigation Engine** | **Expo Router v3** | File-system-based native routing. |
| **Backend & Identity** | **Appwrite (Self-Hosted)** | Secure backend for Auth & Sessions. |
| **NoSQL Database** | **Appwrite Databases** | Fast document storage with isolated JSON. |
| **Realtime Protocol** | **Appwrite Realtime** | WebSockets for live data-stream pipelines. |
| **Serverless Logic**| **Appwrite Functions** | Custom backend runtimes (Node.js). |
| **Version Control** | **Git & GitHub** | Source tracking and CI pipeline management. |

[⬆ Back to Top](#-table-of-contents)

---

## <a id="5-architectural-blueprint"></a>🏗️ 5. Architectural Blueprint

* **House Isolation:** Households map directly to **Appwrite Teams**. Each unique team constitutes a self-contained environment. Permissions, roles, and order hierarchies are serialized and stored inside the Team Preferences metadata object.
* **Document Ownership:** All physical database collections (`tasks`, `events`, `shop_items`, `expenses`) reference an indexed `team_id` alongside the creator's `userId`, ensuring robust row-level isolation.
* **Appwrite Microservices:**
  * `join-house`: Secure cloud function handling server-side code-matching and programmatic team additions.
  * `get-members`: Secure wrapper using Admin API credentials to enrich raw user listings with profile avatars and names without exposing sensitive tables.
* **State Management Architecture:** Clean, decoupled UI driven by modular React Context Providers. Separate dedicated contexts control `Auth`, `House/Memberships`, and individual data tables.
* **Universal Permission Hook:** A centralized custom `usePermissions` Hook calculates active capabilities in real-time, enforcing rules consistently across the layout and native components.

[⬆ Back to Top](#-table-of-contents)

---

## <a id="6-how-to-run-the-project"></a>🚀 6. How to Run the Project

Detailed environment parameters can be found inside the `HOW_TO_RUN.txt` file located within your project directory. Follow this quick start to run:

### 1. Prerequisites
* Install **Node.js LTS** (version 18 or 20 recommended) from [nodejs.org](https://nodejs.org).
* Install the physical client **"Expo Go"** on an **Android** phone, or configure an Android Emulator via Android Studio.

### 2. Launch Commands
Clone your repository, open your terminal, and run:

```bash
# Navigate to the project root directory
cd homy-app

# Install all workspace dependencies
npm install

# Initialize the Expo Bundler
npx expo start
```

### 3. Scan & Run
* **On Physical Android Device:** Open the **Expo Go** application, tap "Scan QR Code", and scan the QR displayed in your development terminal.
* **On Android Emulator:** Press `a` in your terminal window to boot and bundle automatically.

> [!WARNING]  
> **TARGET ANDROID PLATFORMS ONLY:** 
> The hosted backend environment communicates over standard HTTP. Apple's strict **App Transport Security (ATS)** blocks insecure connections within the iOS Expo Go client. Please use an Android physical device or emulator to test. The database, authorization modules, and serverless functions are already hosted in the cloud—**no local backend installation is needed!**

[⬆ Back to Top](#-table-of-contents)
