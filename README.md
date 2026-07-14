========================================================================
                     HOMY — Household Management App
========================================================================

Homy is a premium, cross-platform mobile application designed to simplify 
and elevate the experience of managing a shared household. Whether you live 
with roommates, family members, or partners, Homy seamlessly coordinates 
your daily life—bringing tasks, shopping lists, shared expenses, and 
calendars together into one beautiful, real-time interface.

At the heart of Homy is a robust role-based access control (RBAC) hierarchy 
and real-time WebSocket syncing, ensuring that every household member stays 
in perfect harmony without manual refreshes.

========================================================================
TABLE OF CONTENTS
========================================================================
* [1] SYSTEM OVERVIEW .................................... #system-overview
* [2] FEATURES & CAPABILITIES ............................ #features
* [3] ROLE MATRIX & USER TYPES ........................... #role-matrix
* [4] TECHNOLOGY STACK ................................... #tech-stack
* [5] ARCHITECTURAL BLUEPRINT ............................ #architecture
* [6] HOW TO RUN THE PROJECT ............................. #how-to-run


========================================================================
[1] SYSTEM OVERVIEW                                     #system-overview
========================================================================

In Homy, a "House" represents a virtual shared home.

* THE OWNER: 
  The creator (or designated administrator) who possesses full control 
  over settings, custom roles, permission logic, and membership.

* THE MEMBERS: 
  Household members whose capabilities are dynamically bound by the roles 
  assigned to them.

* SHARED DATA STATE: 
  All data (tasks, shopping items, financial transactions, and events) 
  is automatically scoped to the household and synced instantaneously 
  across all active devices.


========================================================================
[2] FEATURES & CAPABILITIES                                    #features
========================================================================

🏠 HOME DASHBOARD
* Dynamic Welcome: 
  A personalized greeting based on the user's customized profile and 
  active household status.
* Quick Access Grid: 
  Seamless, one-tap navigation links pointing to each dedicated module 
  of the application.

📋 SMART TASKS MANAGER
* Granular Assignments: 
  Delegate tasks to specific house members or leave them open.
* Kanban-Style Statuses: 
  Easily transition states (To-Do -> In Progress -> Done).
* Smart Filtering: 
  Quickly toggle perspectives between "All Tasks" / "My Tasks" and 
  "All" / "Active" / "Completed".
* Bulk Cleanup: 
  Instantly clear all completed household tasks with a single action.

🛒 ORGANIZED SHOPPING LIST
* Categorized Items: 
  Automatically organize grocery and supply lists by category.
* Quantity Selectors: 
  Precision tracking for item amounts.
* Interactive Check-off: 
  Mark items off as you move through the physical store.
* Clear Completed: 
  Wipe out purchased items in one go to keep lists pristine.

💳 SPLIT-EXPENSE FINANCES
* Flexible Split Engine: 
  Log shared costs with accurate transaction dates, and split bills 
  evenly or via custom amount allocations.
* Live Calculation Feedback: 
  Real-time visual feedback showing the "Remaining" balance to be 
  allocated as you customize splits.
* Relational Persistence: 
  Robust backend structure utilizing stable User IDs instead of usernames. 
  If a roommate changes their display name, historical financial 
  balances remain completely intact.
* Debts & Balances: 
  A calculated ledger showing exactly who owes whom, dynamically 
  projected from the active viewer's point of view.
* One-Tap Settle Up: 
  Clear outstanding debts between specific members in seconds.

📅 CENTRALIZED HOUSE CALENDAR
* Monthly Grid Layout: 
  Beautiful visual summary of upcoming household events.
* Daily Schedule Inspect: 
  Tap any date to reveal scheduled items or instantly add new events.
* Targeted Visibility: 
  Assign events to individual household members or to the entire home.
* High-Contrast Indicators: 
  Clear, responsive highlights for the current date and user-selected days.

🔑 CUSTOM ROLES & HIERARCHY
* Custom Roles Engine: 
  Owners can define custom roles tailored to their home (e.g., Parent, 
  Child, Guest, Landlord).
* Role Hierarchy Matrix: 
  Set up hierarchical structure determining which roles outrank others.
* CRUD Granularity: 
  Fine-grained, tab-specific permission toggles (Create / Edit / Delete) 
  per role.
* Hierarchy Enforcement: 
  Optional setting allowing higher-ranked members to modify or delete 
  content created by lower or equal-ranked members.
* Safe-State Locking: 
  Newly created roles start completely locked until permissions are 
  actively mapped by the owner.

⚡ REAL-TIME SYNC ENGINE
* WebSocket Integration: 
  Powered by Appwrite Realtime channels.
* Instant Propagation: 
  Changes to tasks, shopping lists, financial transactions, calendar 
  dates, user configurations, and even permission policies update 
  immediately across all connected devices—zero manual pull-to-refresh 
  needed.
* Optimistic Updates: 
  Built with custom de-duplication layers to keep user interactions 
  smooth while waiting for network acknowledgement.

🎨 PROFILES & DEEP PERSONALIZATION
* Avatar Customization: 
  Express yourself with 18 high-quality iconography presets combined 
  with responsive background color picks.
* Identity Management: 
  Easily update display names and secure passwords natively.
* True Dark Mode: 
  System-wide dark mode styling. Preferences are stored safely in the 
  cloud, syncing to your account across all login sessions.

📩 MEMBERSHIP & HOUSE MANAGEMENT
* Dual Invite Systems: 
  Generate custom alphanumeric invite codes or direct email-based invites.
* Ownership Succession: 
  Securely transfer owner permissions to any active house member.
* Safe Exits: 
  Seamlessly leave a household or, as the owner, securely delete the 
  entire workspace structure.


========================================================================
[3] ROLE MATRIX & USER TYPES                                 #role-matrix
========================================================================

------------------------------------------------------------------------
ACTION                           | OWNER | ASSIGNED ROLE | UNASSIGNED
------------------------------------------------------------------------
Manage Roles & Permissions       |  YES  |      NO       |     NO
Transfer Ownership/Delete House  |  YES  |      NO       |     NO
Invite & Kick Members            |  YES  |      NO       |     NO
Core App Actions (CRUD)          |  YES  | Configurable  |   LOCKED
Personal Profile Configs         |  YES  |      YES      |     YES
------------------------------------------------------------------------


========================================================================
[4] TECHNOLOGY STACK                                         #tech-stack
========================================================================

* MOBILE APP FRONTEND:
  React Native + Expo (v51+) utilizing TypeScript.

* NAVIGATION ENGINE:
  Expo Router v3 (file-system-based native routing with deep-linking).

* BACKEND & AUTHENTICATION:
  Appwrite (Self-Hosted platform managing identity and active sessions).

* DATABASE:
  Appwrite Databases (fast NoSQL document storage).

* REAL-TIME SYSTEM:
  Appwrite Realtime (high-performance WebSockets).

* SERVERLESS RUNTIME:
  Appwrite Functions (custom serverless backend logic running on Node.js).

* VERSION CONTROL:
  Git + GitHub.


========================================================================
[5] ARCHITECTURAL BLUEPRINT                                 #architecture
========================================================================

* HOUSE ISOLATION: 
  Households map directly to Appwrite Teams. Each unique team constitutes 
  a self-contained environment. Permissions, roles, and order hierarchies 
  are serialized and stored inside the Team Preferences metadata.

* DOCUMENT OWNERSHIP: 
  All physical database collections (tasks, events, shop_items, expenses) 
  reference an indexed team_id alongside the creator's userId, ensuring 
  robust row-level isolation.

* APPWRITE MICROSERVICES:
  - join-house: 
    Secure cloud function handling server-side code-matching and 
    programmatic team additions.
  - get-members: 
    Secure wrapper using Admin API credentials to enrich raw user listings 
    with profile avatars and names without exposing sensitive tables.

* STATE MANAGEMENT: 
  Clean, decoupled UI driven by modular React Context Providers. Separate 
  dedicated contexts control Auth, House/Memberships, and individual 
  data tables.

* UNIVERSAL PERMISSION HOOK: 
  A centralized custom usePermissions Hook calculates active capabilities 
  in real-time, enforcing rules consistently across the layout and 
  native components.


========================================================================
[6] HOW TO RUN THE PROJECT                                     #how-to-run
========================================================================

Detailed environment parameters can be found inside the "HOW_TO_RUN.txt" 
file located within your project directory.

1. PREREQUISITES:
   * Install Node.js LTS (version 18 or 20 recommended) from nodejs.org.
   * Install the physical client "Expo Go" on an Android phone, or 
     configure an Android Emulator via Android Studio.

2. LAUNCH COMMANDS:
   Open your terminal in the project root directory and run:

   $ npm install
   $ npx expo start

3. SCAN & RUN:
   * On Physical Android Device: 
     Open the "Expo Go" application, tap "Scan QR Code", and scan the 
     QR displayed in your development terminal.
   * On Android Emulator: 
     Press 'a' in your terminal window to boot and bundle automatically.

!!! WARNING / NOTICE !!!
------------------------------------------------------------------------
TARGET ANDROID PLATFORMS ONLY: 
The hosted backend environment communicates over standard HTTP. Apple's 
strict App Transport Security (ATS) blocks insecure connections within 
the iOS Expo Go client. Please use an Android physical device or 
emulator to test. 

The database, authorization modules, and serverless functions are 
already hosted in the cloud—no local backend installation is needed!
------------------------------------------------------------------------
