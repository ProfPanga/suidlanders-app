---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional']
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-suidlanders-app-2026-02-22.md
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/data-models.md
  - docs/api-contracts.md
  - docs/component-inventory.md
  - docs/source-tree-analysis.md
  - docs/development-guide.md
  - docs/lan-sync-testing-guide.md
documentCounts:
  brief: 1
  research: 0
  brainstorming: 0
  projectDocs: 9
  projectContext: 0
workflowType: 'prd'
classification:
  projectType: 'mobile_app'
  domain: 'emergency_management_civic'
  complexity: 'high'
  projectContext: 'brownfield'
  demoDate: '2026-03-06'
  demoCriticalFeatures:
    - 'Triage logic and camp assignment'
    - 'Staff dashboard to view assignments'
    - 'Role-based UI demonstration'
    - 'Step-by-step scenario documentation'
    - 'Pi auto-start backend (backend repo)'
---

# Product Requirements Document - suidlanders-app

**Author:** Corne
**Date:** 2026-02-24

## Success Criteria

### Demo Success (March 6th - The "Holy Shit" Moment)

**The Story That Needs to Work:**
1. **App Distribution** - Person gets APK via WhatsApp/Bluetooth → installs → opens (no tech knowledge needed)
2. **Offline Registration** - Goes offline → fills form → clicks "DIEN VORM IN" → sees confirmation
3. **Auto-Magic Sync** - Joins intranet (manually OR **scans QR code** - IMPRESSIVE for non-tech audience) → data syncs automatically → no user intervention
4. **Simple Triage Assignment** - Staff sees "Green Camp" or "Red Camp" based on simple logic (has medical condition = Red, else Green)
5. **Data Integrity Demo** - Member updates their form → staff dashboard shows updated data → proves sync + data integrity works (evidence that family merge will work in future)

**Demo Success = Audience Reaction:**
- "My grandmother could do this"
- "This actually works without internet"
- "The QR code thing is brilliant - no WiFi password needed"

**Demo Nice-to-Have (Impressive but Not Essential):**
- ✅ QR code provisioning (if time permits, huge wow factor for non-tech folks)
- ✅ Role switcher showing different views (Member vs Staff vs Medic)

### User Success

**Emotional "Aha!" Moments:**

1. **Registration Relief** - *"My family's data is captured, even without signal"*
   - Member fills form offline → sees "Data saved locally" → trusts it worked
   - Parent adds 5 family members → sees each one confirmed → feels prepared

2. **Sync Confidence** - *"The system has our info, camp staff will know what we need"*
   - Arrives at camp → scans QR OR joins WiFi → sees "Data synced successfully"
   - Staff member says "I see you need insulin, head to Red Camp medical tent" → member feels SEEN

3. **Family Reunion Success** - *"We were separated but our data merged correctly"*
   - Spouse registered separately 50km away → both arrive at camp → system shows ONE family unit with all members
   - Zero duplicate records, zero lost data

4. **Help Others Success** - *"I helped a stranger without corrupting my family's data"*
   - Member helps elderly neighbor without smartphone → registers them on own device → both families' data stays separate and syncs correctly

**Measurable User Success:**
- ✅ 95%+ of members can install and register without help
- ✅ **100% of offline registrations sync successfully** when connection available (zero tolerance for data loss)
- ✅ 0% data loss during family merge scenarios
- ✅ Average registration time: < 10 minutes per family

### Business Success

**Suidlanders Organizational Goals:**

**Pre-Emergency Readiness:**
- 🎯 **60% of members have app installed** within 12 months of launch
- 🎯 **1,000 families registered** in pilot phase (first 3 months)
- 🎯 **80% app store rating** (4+ stars)

**Emergency Response Efficiency:**
- 🎯 **Camp staff can triage 100 families per hour** (vs manual: ~20/hour)
- 🎯 **Zero critical medical info missed** - red flags surface automatically
- 🎯 **50% reduction in camp admin workload**

**Field Test Success:**
- 🎯 **3 successful field drills** before declaring "production ready"
- 🎯 **90%+ member satisfaction** in post-drill surveys

### Technical Success

**Reliability Bar (Life-Safety System):**

**Offline Resilience:**
- ✅ **App works 100% offline for 30+ days**
- ✅ **Data persists through device restart, low battery, force quit**
- ✅ **Local database encryption**

**Sync Reliability:**
- ✅ **100% sync success rate** (zero data loss tolerance for life-safety)
- ✅ **Automatic retry on failure** - 3 attempts with exponential backoff
- ✅ **Clear failure logging** - staff can see which records didn't sync and why
- ✅ **Manual USB/Bluetooth fallback** - if network sync fails after 3 attempts

**Data Integrity (Zero Tolerance):**
- ✅ **100% accuracy in family merge scenarios**
- ✅ **Conflict resolution that favors safety** - if medical info conflicts, flag for manual review
- ✅ **Audit trail** - every sync, merge, update logged

**Performance:**
- ✅ **Registration form loads in < 2 seconds**
- ✅ **Sync completes in < 30 seconds** for typical family (5 members)
- ✅ **Backend supports 500 concurrent syncs**

**Disaster Recovery:**
- ✅ **Backend daily backups**
- ✅ **Export full dataset to USB**
- ✅ **Multi-device redundancy** - multiple Pis for failover

### Measurable Outcomes

**3-Month Success (Post-Pilot):**
- 1,000 families registered
- 3 successful field drills completed
- 90%+ member satisfaction in surveys
- Zero critical bugs in production

**12-Month Success (Full Deployment):**
- 60% of Suidlanders members have app installed
- 5,000+ families registered
- System tested in multi-camp scenario
- Integration with national emergency response proven

## Product Scope

### MVP - Minimum Viable Product (Demo + Essential Features)

**Demo-Critical (March 6th - 10 days):**
- ✅ APK distribution (WhatsApp/Bluetooth shareable)
- ✅ Offline registration (all 10 form sections work offline)
- ✅ **Simple triage logic** (has medical condition = Red Camp, else Green Camp)
- ✅ Staff dashboard (see member list + assigned camps)
- ✅ **QR code provisioning** (scan to join intranet - high wow factor, include if time permits)
- ✅ Data update + sync demo (member updates form → staff sees change → proves integrity)
- ✅ Role UI demonstration (show different views for Member vs Staff)
- ✅ Step-by-step scenario docs (how to run the demo)

**Post-Demo MVP (Essential for Field Test):**
- ✅ Family member registration (dependents via "VOEG AFHANKLIKE BY")
- ✅ Distributed family sync (spouse registers separately, data merges)
- ✅ Non-family member registration (help strangers without corrupting your data)
- ✅ Auto-retry sync (3 attempts with clear failure states)
- ✅ i18n support (Afrikaans + English toggle)
- ✅ Pi auto-start backend (non-tech camp staff can start server)
- ✅ Basic RBAC (Member, Staff, Medic roles with different data access)
- ✅ Medical red flags (insulin, heart conditions surface in triage)
- ✅ Code cleanup (remove unused code, enforce standards)
- ✅ Documentation consolidation (dev docs + scenario docs as separate sources of truth)

**Out of Scope for MVP:**
- ❌ Bluetooth/USB manual sync (network-only for MVP)
- ❌ Advanced role permissions (Doctor, Security roles)
- ❌ Real-time presence tracking
- ❌ Complex triage matrix (MVP uses simple rules)

### Growth Features (Post-MVP, Based on Pilot Learnings)

- 📈 Bluetooth/USB offline sync
- 📈 Advanced triage matrix (weighted scoring)
- 📈 Expanded RBAC (Doctor, Security, Admin roles)
- 📈 Real-time camp capacity monitoring
- 📈 Supply donation matching
- 📈 Skill-based assignments
- 📈 Multi-camp federation
- 📈 Offline messaging

### Vision (Future Dream State)

- 🌟 AI triage assistant
- 🌟 Satellite sync fallback
- 🌟 Biometric verification
- 🌟 Geofencing alerts
- 🌟 Supply chain integration
- 🌟 Multi-language support (Zulu, Xhosa)
- 🌟 Desktop/web admin portal
- 🌟 Integration with national emergency services

## User Journeys

### Journey 1: Primary Member (Family Head) - "The Prepared Father"

**Meet Pieter, 42, Mechanical Engineer, Father of 4, Suidlanders Member**

**Opening Scene:**
Pieter has been a Suidlanders member for 3 years. He's done the drills, attended the meetings, knows the emergency plan. He installed the app 6 months ago when it became available and filled out his basic info then.

But today it's REAL. The situation he's been preparing for - civil unrest spreading fast, supply chains collapsing. He knows the protocol: get to the designated camp. Now.

His wife Annelie is packing the car. The kids sense something is wrong but don't ask questions. Power is out in their neighborhood. Cell signal is patchy - sometimes 1 bar, sometimes nothing.

**Rising Action:**
Pieter opens the app. He sees his profile from 6 months ago - but things have changed. He needs to update:
- His diabetes diagnosis from 3 months ago (needs insulin daily)
- Baby Lize wasn't born yet when he first registered
- New vehicle (traded the sedan for a 4x4)
- Current supplies (3 days water, week of food, half tank fuel)

He updates the form, working through the sections. The app doesn't care that there's no cell signal - everything saves locally. When he taps "DIEN VORM IN," he sees:

**"Vorm suksesvol ingedien"**

**Climax:**
They arrive at camp 6 hours later. About 30-40 families already there. Reception tent has a simple setup - Martie (60, retired teacher) at a table with a tablet and a sign: "JOIN WIFI - SUIDLANDERSKAMP"

Pieter's phone auto-connects. He feels the vibration - sync happening. Takes maybe 10 seconds.

Martie's tablet pings. She looks at her screen, then at Pieter. "Pieter van der Merwe, family of 5?"

"Yes, ma'am."

She taps something. "Red Camp area - they're expecting you."

**Resolution:**
Pieter walks to Red Camp with his family. The medical staff already has his info - blood type, diabetic, daily insulin requirement. No clipboard. No repeated questions. They confirm his supply and give him a 2-week backup.

Annelie grips his hand. "This actually works."

Pieter nods. "We're in the system. They know what we need."

---

### Journey 2: Independent Family Member - "The Separated Spouse"

**Meet Annelie, 38, Teacher, Pieter's Wife**

**Opening Scene:**
Annelie is at her parents' farm in the Free State (different province) when everything falls apart. Her father had a stroke last week - she's been helping her mother care for him.

There's no cell service. No internet. The last thing Pieter told her three days ago: "If things go bad, get to your designated camp. I'll take the kids to ours."

They're going to DIFFERENT camps - 400km apart.

**Rising Action:**
Annelie knows the protocol. She opens the Suidlanders app. She has her own profile, but it needs updating:
- Current location (parents' farm, Free State)
- Which camp she's heading to (Free State designated camp, NOT Pieter's camp)
- Who's with her: her parents (Pa is 68, recent stroke; Ma is 65, diabetic)
- She marks herself as part of Pieter van der Merwe's family unit

She sees: **"Is jou familielid teenwoordig?" (Is your family member present?)**
- She selects "NO" for Pieter and the kids
- She adds: "Husband and children at different camp (North West Province)"

**"DIEN VORM IN"** → **"Vorm suksesvol ingedien"**

**Climax:**
Annelie arrives at Free State camp 18 hours later. She syncs with THAT camp's system. The reception staff sees her registration.

Two days later, communications improve. The Free State camp Pi connects to the North West camp Pi (inter-camp sync over satellite link or long-range radio data).

At Pieter's camp in North West, the Communication staff (Thandi) gets a notification: **"Van der Merwe family member synced from Free State camp."**

Thandi radios Pieter. "Your wife and her parents are safe. They're at Free State camp."

**Resolution:**
Pieter can't call her (no cell service), but he KNOWS she made it. The inter-camp sync worked. ONE family unit, TWO camps, TWO separate databases that talk to each other.

Later, when Annelie can travel safely, she moves to Pieter's camp. Her data migrates with her. No re-registration needed.

---

### Journey 3: Helper/Good Samaritan - "The Neighbor"

**Meet Johan, 35, Farmer, Suidlanders Member**

**Opening Scene:**
Johan is loading his bakkie when he hears banging on his gate. It's Ouma Bester from down the road - 78 years old, widow, alone. Her hands are shaking.

"Johan, I don't know what to do. I don't have a phone. Can you help me?"

Johan doesn't hesitate. "Get in, Ouma. I'll get you to camp."

But now he has a problem: how does he register her without mixing her data with his family's?

**Rising Action:**
In the bakkie, Johan opens the Suidlanders app. He sees an option: **"REGISTREER ANDER PERSOON"** (Register Other Person)

He selects it. The app asks: **"Is hierdie persoon deel van jou familie?"** (Is this person part of your family?)
- He selects "NO - Helping someone else"

The app creates a NEW registration, completely separate from his family data. He helps Ouma Bester fill in:
- Her name, age, ID number
- Medical: high blood pressure, heart medication (which she forgot at home)
- No vehicle (passenger in his)
- No supplies

**"DIEN VORM IN"** → **"Vorm suksesvol ingedien"**

**Alternative:** If Ouma Bester HAD a phone but no app, Johan could share the APK via Bluetooth, and she could register on her own device.

**Climax:**
At camp reception, Johan explains: "This is Ouma Bester, my neighbor. I registered her on my phone."

Martie checks her tablet. "I see two registrations from your device - Johan Coetzee family, and Elizabeth Bester. Both synced correctly." She looks at Ouma Bester. "Red Camp area - they're expecting you."

**Resolution:**
Johan walks Ouma Bester to Medical, sees her settled, then returns to find his own family. His phone shows BOTH registrations - his family in Green Camp, Ouma Bester in Red Camp. Completely separate. No data corruption.

Later, Ouma Bester's daughter (who was at work in another city) arrives at camp and finds her mother. The system knew Ouma was there. Safe.

Johan thinks: "I helped someone, and the system handled it. Clean."

---

### Journey 4: Reception Staff - "The Frontline"

**Meet Martie, 60, Retired Teacher, Camp Volunteer**

**Opening Scene:**
Martie volunteered for reception because she's organized and patient. But she's been EXPLICITLY told: **"You don't get to see medical information. That's private. Doctor-patient confidentiality."**

Her grandson set up her tablet with a RESTRICTED VIEW.

**Rising Action:**
The reception dashboard shows:
- **WiFi Name:** SuidlandersCamp
- **Families Synced:** 0
- **Waiting to Arrive:** Unknown (can only track once they sync)

First car pulls up. Pieter van der Merwe.

"Join the WiFi - SuidlandersCamp," she says.

Pieter's phone syncs. Her tablet pings. A new entry appears:
- **Van der Merwe Family** (5 members)
- **Camp Assignment:** RED CAMP
- **Reason:** [MEDICAL - See Medical Staff]

She CANNOT see WHY it's Red Camp. She doesn't see "diabetes" or "insulin." Just that Medical flagged them for Red Camp.

**Climax:**
Over 6 hours, 40 families arrive. Martie processes each one:
- Check tablet for sync confirmation
- Confirm identity (name matches)
- Read camp assignment (Red or Green)
- Direct them to right area

She does NOT see:
- Medical conditions
- Medication lists
- Private family details
- Income or financial info

She ONLY sees:
- Name
- Number of family members
- Camp assignment (Red/Green)
- Sync status

One family's tablet shows: **"RED CAMP - [SECURITY FLAG - See Security Staff]"**

Martie doesn't know WHY. She just radios Security: "Family at reception needs security clearance."

**Resolution:**
Martie hands off to the next volunteer. She explains: "The tablet tells you where to send people. Green or Red. If it says 'See Medical' or 'See Security,' radio them. Don't ask the family questions - the specialists will handle it."

Privacy protected. Role-based access working.

---

### Journey 5: Medical Staff - "The Emergency Responder"

**Meet Dr. Kobus, 52, Retired GP, Camp Medical Lead**

**Opening Scene:**
Dr. Kobus volunteered to run the medical tent. He knows emergencies - 30 years as a rural GP. But he's worried about one thing: **information**.

In a crisis, people forget medication names. They panic and can't explain their conditions. Kids can't tell you their blood type.

"If I don't have accurate medical info fast, people die."

**Rising Action:**
The medical dashboard on his tablet shows:
- **Families in Red Camp:** 12
- **Critical Flags:** 3 (diabetes, heart condition, post-stroke)
- **Medical Needs:** Insulin (2), blood pressure meds (4), heart medication (3)

He taps "Van der Merwe, Pieter" - full medical profile appears:
- **Blood Type:** A+
- **Condition:** Type 2 Diabetes (diagnosed 3 months ago)
- **Medication:** Insulin (daily), Metformin
- **Allergies:** Penicillin
- **Emergency Contact:** Annelie van der Merwe (wife)

Dr. Kobus checks his insulin stock. He has enough for 2 weeks for Pieter.

**Climax:**
A man stumbles into the medical tent - pale, sweating, confused. It's Pieter. Hypoglycemic episode.

Dr. Kobus grabs his tablet. "What's your name?"

"Pieter... van der..."

He types. Full medical record. Blood sugar crash - he needs glucose NOW. Dr. Kobus administers. Pieter stabilizes.

Later, Dr. Kobus checks Pieter's wife's entry. She noted: "Husband recently diagnosed, still learning to manage blood sugar."

He makes a note: **"Schedule diabetes management training for Van der Merwe family."**

**Resolution:**
Dr. Kobus looks at his medical dashboard. 45 families now. 8 in Red Camp with medical needs. He has full medical info on ALL of them:
- Who needs what medication
- Who has chronic conditions
- Who's at risk

He doesn't have to interview 45 people while they're in crisis. The data is ALREADY THERE.

He thinks: "In the old days, we'd be working blind. Now we can ACTUALLY HELP."

---

### Journey 6: Security Staff - "The Gatekeeper"

**Meet Francois, 45, Former SAPS Officer, Camp Security Lead**

**Opening Scene:**
Francois's job is two-fold:
1. **Gate security:** Make sure the camp is safe (screen who enters)
2. **Internal security:** Know who has firearms (in case of attack, or safety concerns within camp)

In a crisis, knowing who's armed is CRITICAL.

**Rising Action:**
The security dashboard shows:
- **Families Registered:** 45
- **Firearms Declared:** 12 families
- **Shooting Experience:** 18 people
- **Security Flags:** 0

Each entry shows:
- Name, ID number
- **Firearms:** Yes/No (if yes, type and license details)
- **Ammunition:** Quantity declared
- **Shooting Experience:** Military, sport, hunting, none
- **Security Concerns:** Flagged by system or manual entry

When Pieter van der Merwe arrives, Francois checks:
- **Firearms:** Yes - 9mm pistol, licensed
- **Ammunition:** 50 rounds
- **Experience:** Sport shooting (5 years)
- **Security Risk:** None

Francois makes a note: **"Van der Merwe - armed, experienced. Potential defense volunteer if camp attacked."**

**Climax:**
A man arrives claiming to be "helping a neighbor." The security dashboard shows:
- **Name:** Unknown (not in system)
- **Firearms:** He claims "no weapons"

Francois does a manual check. Finds a concealed firearm - unlicensed.

"You didn't declare this. You're not in the system. You need to leave."

The man argues. Francois radios backup. The man leaves. Camp stays safe.

Later, the camp is threatened by looters. Francois pulls up his dashboard: **"Firearms declared: 12 families, 18 people with shooting experience."**

He organizes a defense perimeter. Everyone with declared firearms and experience gets a post. The system told him WHO CAN DEFEND THE CAMP.

**Resolution:**
Francois reviews his security list:
- 12 families with firearms (all licensed, all declared)
- 18 people with shooting experience
- 0 security incidents inside camp
- 1 attempted entry by unauthorized person (rejected)

He thinks: "In the old days, I'd have no idea who's armed. Now I can plan defense AND maintain internal safety."

---

### Journey 7: Logistics Staff - "The Resource Manager"

**Meet Maria, 38, Warehouse Manager (Pre-Crisis), Camp Logistics Lead**

**Opening Scene:**
Maria's job is to make sure the camp doesn't run out of critical supplies. That means knowing:
- How many people are here
- What do they need
- What are we running low on

In the old system (paper forms), she'd be guessing. Now she has DATA.

**Rising Action:**
The logistics dashboard shows:
- **Total People:** 187 (45 families)
- **Days of Water (Self-Supplied):** Average 3 days
- **Days of Food (Self-Supplied):** Average 5 days
- **Insulin Required:** 2 people
- **Heart Medication Required:** 3 people
- **Diabetic Medication Required:** 6 people

Maria looks at medical supply inventory:
- **Insulin:** 20 days of stock (enough for 2 people)
- **Heart Meds:** 10 days (not enough for 3 people)
- **Diabetic Meds:** 30 days (plenty)

She radios Admin: "We need more heart medication. Three people need it, we only have 10 days stock."

**Climax:**
A supply truck arrives from another camp. Maria checks her priority list:
1. Heart medication (critical shortage)
2. Insulin backup (adequate but need reserve)
3. Water purification tablets (running low)

She allocates supplies based on REAL DATA, not guesses.

**Resolution:**
End of day, Maria reviews the logistics dashboard. She knows:
- Which families brought extra water (can donate if needed)
- Who has vehicles with fuel (can do supply runs)
- Who has skills (mechanics, medics, farmers)

She thinks: "In the old days, I'd be flying blind. Now I can PLAN."

---

### Journey 8: Communication Staff - "The Family Reunifier"

**Meet Thandi, 32, Radio Operator, Camp Communications Lead**

**Opening Scene:**
Thandi's job is to help families find each other. In chaos, families get separated. Kids with grandparents. Spouses in different cities. Siblings scattered.

Her radio gets constant calls:
- "My daughter is missing, have you seen her?"
- "My husband was supposed to be at camp yesterday, is he there?"
- "My elderly father left his home, I don't know if he made it."

She needs a way to FIND people.

**Rising Action:**
The communications dashboard shows:
- **Families Registered:** 45
- **Search Function:** Name, ID number, vehicle registration

A woman radios in: "My mother, Elizabeth Bester, 78 years old. She lives alone. Have you seen her?"

Thandi types: "Elizabeth Bester"

**MATCH FOUND:**
- **Name:** Elizabeth Bester
- **Registered by:** Johan Coetzee (neighbor, helping someone without phone)
- **Status:** Arrived 6 hours ago
- **Location:** Red Camp, Medical Tent (receiving heart medication)
- **Note:** Neighbor brought her, she forgot her medication at home

**Climax:**
Thandi radios back: "Your mother is here. She's safe. Red Camp, Medical Tent. A neighbor brought her."

The daughter arrives 2 hours later. Reunion. Tears. Relief.

Thandi checks her log: **7 successful family reunifications today**.

**Resolution:**
Thandi looks at her search function. She can find:
- Anyone who arrived (by name, ID, vehicle)
- Anyone who registered but hasn't arrived yet (pending)
- Anyone marked as "family member arriving separately"
- **Inter-camp notifications:** Family members at OTHER camps

She thinks: "We're not just tracking people. We're REUNITING FAMILIES."

---

### Journey 9: Admin (Super User) - "The System Operator"

**Meet Gerhard, 48, IT Manager (Pre-Crisis), Camp System Admin**

**Opening Scene:**
Gerhard is responsible for keeping the ENTIRE system running. That means:
- Making sure the Raspberry Pi stays online
- Monitoring sync status
- Fixing problems when things break
- Managing user access (who can see what data)

He's the ONLY person with full system access.

**Rising Action:**
The admin dashboard shows:
- **System Status:** Online
- **Families Synced:** 45
- **Pending Syncs:** 0
- **Failed Syncs:** 0
- **User Roles Active:** Reception (2), Medical (1), Security (1), Logistics (1), Communication (1)

Everything is green. Good.

Then his tablet pings: **"WARNING: 3 failed sync attempts from device ID: XYZ123"**

Gerhard checks the log. Someone's phone is trying to sync but failing. Network issue? Corrupted data?

He radios Reception: "Did anyone report sync problems?"

Martie: "Yes, a family just arrived. Their phone keeps saying 'Sync failed.'"

**Climax:**
Gerhard walks to reception. The family's phone has a bad WiFi connection - old device, weak antenna.

He pulls out a USB cable. "We'll do a manual USB sync."

He connects their phone to his laptop. The backend accepts the USB data transfer. Manual sync successful.

The family's data appears on Martie's tablet. Crisis averted.

**Resolution:**
Gerhard monitors the system throughout the day. He:
- Restarts the Pi once (routine maintenance)
- Fixes 2 failed syncs (network issues)
- Grants Medical access to a new volunteer doctor who arrived
- Backs up the full database to USB (twice daily backup)
- Initiates inter-camp sync with Free State camp (satellite data link)

At the end of the day, he reviews the system health:
- **187 people registered**
- **100% sync success rate** (after manual interventions)
- **Zero data loss**
- **System uptime: 23 hours**
- **Inter-camp sync: 1 family member location shared**

He thinks: "The system is holding. As long as I'm here, it won't fail."

---

### Journey Requirements Summary

These 9 journeys reveal the following capability requirements:

**Core Registration Capabilities:**
- Offline registration (works without network)
- Family member addition (dependents)
- Independent family member registration (distributed arrivals at different camps)
- Non-family member registration (help others without data corruption)
- Form updates (change info after initial registration)
- APK sharing via Bluetooth (for people without the app)

**Sync Capabilities:**
- Auto-sync when joining camp WiFi
- Sync status visibility ("Syncing..." → "Sync successful")
- Failed sync retry (3 attempts)
- Manual USB sync fallback (when network fails)
- Family data merge (separate registrations → one family unit)
- **Inter-camp sync** (camps communicate family member locations across provinces)

**Triage & Camp Assignment:**
- Simple triage logic (medical condition = Red Camp, else Green Camp)
- Automatic camp assignment based on data
- Medical flag surfacing (insulin, heart conditions, etc.)

**Privacy & Role-Based Access Control (CRITICAL):**
- **Reception:** Name, family size, camp assignment ONLY (no medical, no private data)
- **Medical:** Full medical profiles (blood type, conditions, medications, allergies)
- **Security:** Firearms, ammunition, shooting experience, security flags, identity verification
- **Logistics:** Resource needs, supplies, skills
- **Communication:** Family search, contact info, inter-camp family location
- **Admin:** Full system access (monitoring, troubleshooting, user management, inter-camp sync)

**Security Capabilities:**
- Firearms declaration tracking (type, license, ammunition)
- Shooting experience tracking (military, sport, hunting)
- Defense volunteer identification (who can defend camp if attacked)
- Internal safety monitoring (who's armed inside camp)
- Gate screening (identity verification, system check)

**Data Integrity:**
- Separate registration streams (family vs non-family)
- Distributed family merge (spouse registers separately → links to main family)
- Inter-camp family tracking (family members at different camps)
- Audit trail (who registered when, from which device)
- Zero data loss tolerance

**User Experience:**
- Afrikaans UI ("DIEN VORM IN", "Vorm suksesvol ingedien", "REGISTREER ANDER PERSOON")
- Simple staff interfaces (non-tech friendly)
- Clear status messages (sync success/failure)
- Search functionality (find people by name, ID, vehicle)
- Privacy-first design (staff only see what they NEED to see)

## Domain-Specific Requirements

### Compliance & Regulatory

**Data Protection (POPIA Consideration):**
- **Scope:** Data stored locally only, never shared externally, never goes online
- **Consent:** User consent required during registration (acknowledge data collection and storage)
- **Data Ownership:** Member owns their data
- **Right to Deletion:** Members can request data deletion at any time (admin function)
- **Data Retention:** No automatic deletion - manual cleanup post-emergency by admin
- **Out of Scope:** No POPIA registration required (data not shared with third parties, not stored in cloud)

**Medical Privacy:**
- **Doctor-Patient Confidentiality:** Enforced via role-based access control
- **Medical Data Access:** ONLY Medical role can view full medical profiles
- **Reception/Other Roles:** See "[MEDICAL - See Medical Staff]" flag only, no details
- **Audit Trail:** Login credentials track who accessed what data (admin can review logs)

**Emergency Management Standards:**
- **No Official Integration:** System operates independently of government emergency services
- **No Certifications Required:** Internal Suidlanders system, not public infrastructure
- **Future Consideration:** Potential government integration in Vision phase (not MVP)

### Technical Constraints

**Security Requirements:**

**Mobile Device Security:**
- **Local Encryption:** SQLite database encrypted with CryptoJS (sufficient for MVP)
- **Stolen Device Risk:** Data encrypted at rest - cannot be accessed without app
- **Mitigation:** Consider adding app-level PIN/biometric lock (post-MVP enhancement)

**Backend Security (CRITICAL):**
- **Pi Physical Security:** Must be in secure location (admin tent, locked area)
- **Network Security:** Camp WiFi should be password-protected (not open network)
- **Database Encryption:** Backend database must be encrypted at rest
- **Access Control:** Admin credentials required for backend access (no anonymous access)
- **Backup Security:** USB backups must be encrypted (stored in secure location)

**Firearms Data (ULTRA SENSITIVE):**
- **Extra Protection:** Firearms data accessible ONLY to Security and Admin roles
- **Logging:** All firearms data access must be logged (who viewed, when)
- **Physical Security:** Printed reports containing firearms data must be destroyed after use
- **Legal Liability:** Unauthorized firearms data disclosure could expose Suidlanders to legal risk

**Identity Verification:**
- **Primary:** South African ID number (13-digit unique identifier)
- **Validation:** ID number format validation (checksum algorithm)
- **Duplicate Prevention:** System flags duplicate ID numbers (same person registered twice)
- **Additional Layer (Consideration):** Optional photo capture during registration (future enhancement)
- **Fraud Risk:** Minimal - using someone else's ID number is identity fraud (criminal offense)

### Data Retention & Deletion

**Retention Policy:**
- **During Emergency:** Data retained indefinitely while emergency active
- **Post-Emergency:** Manual data archival/deletion by Admin (no auto-delete)
- **Member Request:** Admin can delete individual member data on request (POPIA right to deletion)
- **Audit Logs:** Access logs retained for 90 days minimum (accountability)

**Data Lifecycle:**
- **Active:** Member registered, data in system
- **Archived:** Emergency ended, data moved to archive (read-only)
- **Deleted:** Admin fulfills deletion request (permanent, unrecoverable)

### Backup & Disaster Recovery

**Backup Strategy:**
- **Frequency:** Automated daily backups to USB (midnight cron job)
- **Manual Backups:** Admin can trigger manual backup anytime
- **Backup Storage:** Encrypted USB drives stored in secure location (Admin responsibility)
- **Redundancy:** Multiple Pis at large camps (failover if primary fails)
- **Restore Process:** Admin can restore from USB backup if Pi fails

**System Failure Mitigation:**
- **Pi Failure:** USB backup allows restore on new Pi within 30 minutes
- **Sync Failure:** Retry logic (3 attempts) + manual USB sync fallback
- **Network Failure:** System designed for 100% offline operation (no dependency)
- **Power Failure:** Pi battery backup (8-hour UPS minimum) + solar charging option

### Risk Mitigations

**Data Integrity Risks:**

**Risk:** Wrong camp assignment due to triage logic error
- **Mitigation:** Simple, conservative triage logic for MVP (medical condition = Red, else Green)
- **Override:** Reception/Medical staff can manually override triage assignment
- **Liability:** System provides recommendation only, final decision is human (staff discretion)
- **Testing:** Comprehensive triage testing before field deployment (100+ test cases)

**Risk:** Duplicate/fake registrations inflating camp numbers
- **Mitigation:** ID number uniqueness check (flags duplicates immediately)
- **Detection:** Admin dashboard shows duplicate ID warnings
- **Manual Review:** Admin investigates flagged duplicates (legitimate family vs fraud)
- **Consequence:** Fake registrations waste resources but don't compromise safety

**Risk:** Sync failure causing data divergence (separate databases at different camps)
- **Mitigation:** Inter-camp sync protocol (satellite/radio data link)
- **Conflict Resolution:** Timestamp-based last-write-wins (documented in Architecture)
- **Manual Reconciliation:** Admin can manually merge divergent records if needed

**Security Risks:**

**Risk:** Unauthorized backend access (someone hacks into Pi)
- **Mitigation:** Admin login required (strong password policy)
- **Physical Security:** Pi in locked admin tent (not publicly accessible)
- **Network Security:** Camp WiFi password-protected (SSID: SuidlandersCamp, WPA2)
- **Detection:** Failed login attempts logged and alerted to Admin

**Risk:** Database leak (entire member database stolen/copied)
- **Mitigation:** Database encryption at rest (Pi database file encrypted)
- **Access Control:** Only Admin can export full database
- **Audit Trail:** All database exports logged (who, when, what data)
- **Physical Security:** USB backups stored in fireproof safe (Admin custody)

**Risk:** Medical data accessed inappropriately (staff curiosity, gossip)
- **Mitigation:** Role-based access (Reception/Logistics CANNOT see medical data)
- **Audit Logging:** Every medical record access logged (timestamp, user, member viewed)
- **Policy Enforcement:** Staff code of conduct (confidentiality agreement signed)
- **Consequence:** Inappropriate access = immediate role revocation + disciplinary action

**Risk:** Firearms data leaked (security risk if attackers know who's armed)
- **Mitigation:** Firearms data ONLY accessible to Security + Admin
- **No Printouts:** Firearms reports must be destroyed after use (shredded)
- **Verbal Communication:** Security uses radio codes, not names, when discussing armed members
- **Physical Security:** Security tablet locked when unattended

### Legal & Liability Considerations

**System Liability:**
- **Recommendation System:** Triage assignments are recommendations, not mandates (human decision final)
- **No Guarantees:** System does not guarantee safety or survival (emergency context)
- **Member Consent:** Members acknowledge system limitations during registration consent
- **Organization Protection:** Suidlanders not liable for system failures (reasonable effort standard)

**Data Privacy Liability:**
- **Confidentiality Breach:** Staff who leak data are personally liable (not organization)
- **Security Standards:** Reasonable security measures implemented (encryption, access control, logging)
- **Compliance:** POPIA compliance not required (data not shared externally)
- **Member Control:** Members can request data deletion at any time (respects autonomy)

**Firearms Data Liability:**
- **Disclosure Risk:** Unauthorized firearms data disclosure could endanger lives
- **Legal Protection:** Strict access controls + audit logging demonstrates reasonable care
- **Staff Accountability:** Firearms data access violations = grounds for criminal charges (identity fraud)

### Out of Scope (Explicitly NOT Required)

**NOT Required for MVP:**
- ❌ POPIA registration (data not shared externally)
- ❌ Government emergency services integration
- ❌ Official certifications or accreditation
- ❌ Cloud storage or internet-based backups
- ❌ Biometric authentication (fingerprint/face ID)
- ❌ Real-time threat intelligence
- ❌ Legal review of triage algorithms

**Future Considerations (Vision Phase):**
- 🌟 Integration with national emergency database
- 🌟 Advanced encryption (hardware security modules)
- 🌟 Blockchain audit trail (immutable logs)
- 🌟 Photo ID verification during registration

## Mobile App Specific Requirements

### Project-Type Overview

**Platform:** Cross-platform mobile application built with Ionic 8 + Angular 19 + Capacitor 7

**Target Platforms:**
- **MVP:** Android only (API level 24+, Android 7.0+)
- **Future:** iOS (post-MVP, pending pilot success)

**Distribution Strategy:**
- **MVP:** Sideload APK distribution (WhatsApp, Bluetooth, USB transfer)
- **Future:** Google Play Store distribution (post-pilot validation)
- **Out of Scope for MVP:** Apple App Store (iOS not in MVP scope)

### Technical Architecture Considerations

**Offline-First Architecture:**
- **Core Principle:** 100% functionality without network connection
- **Offline Duration:** 30+ days operational without sync
- **Local Storage:** SQLite (mobile) via @capacitor-community/sqlite
- **Web Fallback:** IndexedDB (Dexie) for web/desktop testing
- **Data Encryption:** CryptoJS encryption for local database (at-rest encryption)
- **Sync Strategy:** Opportunistic sync when camp WiFi available

**Platform Detection & Fallback:**
- **Primary:** Capacitor platform detection (`platform.is('android')`)
- **Mobile Platform:** SQLite database
- **Web/Desktop Platform:** IndexedDB database (for development/testing)
- **Automatic Fallback:** If SQLite fails, gracefully degrade to IndexedDB

### Device Capabilities & Permissions

**Required Device Features:**

**Camera Access:**
- **Purpose:** QR code scanning (camp provisioning), document photo capture (ID, licenses)
- **Permission:** CAMERA (Android manifest)
- **Fallback:** Manual WiFi connection if QR scan fails, file upload from gallery if camera unavailable

**GPS/Geolocation:**
- **Purpose:** Auto-capture GPS coordinates for address registration
- **Permission:** ACCESS_FINE_LOCATION (Android manifest)
- **Fallback:** Manual lat/lng entry if GPS unavailable

**Filesystem Access:**
- **Purpose:** Document upload (PDF/JPG/PNG), USB encrypted bundle export/import
- **Permission:** READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE (Android manifest)
- **Validation:** Max 10MB per file, PDF/JPG/PNG only

**Network/WiFi:**
- **Purpose:** Camp intranet sync (LAN only, no internet required)
- **Permission:** ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE (Android manifest)
- **Note:** No internet permission required (offline-only architecture)

**Bluetooth:**
- **Purpose:** APK sharing (peer-to-peer app distribution)
- **Permission:** BLUETOOTH (Android manifest)
- **Status:** Already available via Capacitor (no additional implementation needed for MVP)
- **Use Case:** Member shares APK with another member who doesn't have app

**NOT Required for MVP:**
- ❌ Push Notifications (no Firebase Cloud Messaging, no background notifications)
- ❌ NFC (no tap-to-register, no member card tapping)
- ❌ Biometrics (no fingerprint/face ID app lock - post-MVP consideration)
- ❌ Contacts API (no contact import)
- ❌ Calendars (no event creation)

### Platform-Specific Requirements

**Android-Specific:**

**Minimum SDK:**
- **Target SDK:** 33+ (Android 13)
- **Minimum SDK:** 24 (Android 7.0 Nougat)
- **Rationale:** Balance between modern features and device coverage in South Africa

**Build Configuration:**
- **Build Tool:** Gradle 8.x
- **Build Output:** Debug APK for MVP (no release signing for sideload)
- **Build Process:** Custom script handles Angular → Capacitor quirk (www/browser → www/)

**Permissions Manifest:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.BLUETOOTH" />
```

**Storage Considerations:**
- **App Size:** Target < 50MB APK (minimize download via Bluetooth)
- **Local Database:** Unlimited growth (stores member data indefinitely)
- **Cache:** Minimal (no image caching, no web content caching)

### Offline Mode Requirements

**Already Documented (Cross-Reference):**
- 100% offline registration capability
- Local SQLite database with encryption
- Auto-sync when WiFi available
- Manual USB sync fallback
- 30+ day offline operational window

See "Success Criteria → Technical Success → Offline Resilience" for complete offline requirements.

### App Distribution & Installation

**Sideload Distribution (MVP):**

**Distribution Channels:**
1. **WhatsApp:** Share APK file via WhatsApp message/group
2. **Bluetooth:** Direct device-to-device APK transfer
3. **USB Transfer:** Copy APK from laptop to phone
4. **QR Code Download:** Link to APK hosted on local server (camp scenario)

**Installation Process:**
1. User receives APK file
2. Android prompts "Install from Unknown Sources"
3. User enables "Install Unknown Apps" for source (WhatsApp, Files app, etc.)
4. APK installs
5. User opens app (no account creation, direct to registration)

**Security Implications:**
- APK signing with debug key (MVP)
- Users must trust APK source (Suidlanders organization)
- No Play Protect warnings (app not in Play Store)

**Future: Google Play Store Distribution (Post-MVP):**

**Requirements for Play Store:**
- Privacy Policy URL (required by Google)
- Terms of Service (required by Google)
- App Content Rating questionnaire (likely PEGI 3 / Everyone)
- Data Safety disclosure (collect personal/medical data, stored locally)
- Release APK signing (production keystore)
- App icon meeting Play Store guidelines (already generated via resources/)

**Timeline:** Post-pilot validation (after 3 successful field drills)

### Performance Requirements

**Load Time:**
- **App Launch:** < 3 seconds cold start on mid-range Android device
- **Form Load:** < 2 seconds to display registration form
- **Sync Duration:** < 30 seconds for typical family (5 members) over LAN WiFi

**Device Support:**
- **Target Devices:** Mid-range Android phones (2GB+ RAM, quad-core CPU)
- **Low-End Support:** Should work on 1GB RAM devices (degraded performance acceptable)
- **High-End Support:** Optimized for flagship devices (smooth 60fps animations)

**Battery Consumption:**
- **Registration:** Minimal battery impact (form filling doesn't drain battery)
- **Sync:** Brief network activity (< 1% battery per sync)
- **Background:** No background processes (app doesn't run when closed)

### Accessibility Considerations

**Language Support:**
- **Primary:** Afrikaans UI (all labels, buttons, messages)
- **Secondary:** English toggle (post-demo MVP feature)
- **Future:** Zulu, Xhosa (Vision phase)

**Visual Accessibility:**
- **Font Size:** Ionic default (user can increase via Android settings)
- **Color Contrast:** Sufficient for readability (dark mode support via ThemeService)
- **Touch Targets:** Minimum 44x44px (Ionic default)

**NOT Required for MVP:**
- ❌ Screen reader optimization (TalkBack support)
- ❌ Voice input
- ❌ High contrast mode (beyond dark/light theme)

### Testing & QA

**Device Testing Matrix:**
- **Primary Test Device:** Modern Android phone (Android 12+)
- **Compatibility Test:** Older device (Android 7.0, minimum SDK)
- **Emulator Testing:** Android Studio emulator (faster iteration)

**Critical Test Scenarios:**
- Offline registration (airplane mode)
- Sync after 7+ days offline
- Low battery behavior (< 10%)
- Low storage behavior (< 100MB free)
- Poor WiFi signal (weak camp network)

### Implementation Considerations

**Development Environment:**
- **IDE:** VS Code (primary), Android Studio (for native debugging)
- **Build Tools:** Node.js 18+, Ionic CLI, Capacitor CLI
- **Testing:** Jasmine + Karma (unit tests), manual QA (integration)

**Deployment Process:**
1. Build Angular app: `ionic build`
2. Flatten www folder: `mv www/browser/* www/`
3. Sync Capacitor: `npx cap sync android`
4. Build APK: `cd android && ./gradlew assembleDebug`
5. Output: `android/app/build/outputs/apk/debug/app-debug.apk`

**Version Management:**
- **Semantic Versioning:** X.Y.Z (e.g., 1.0.0 for MVP launch)
- **Version Display:** In app settings (user can check current version)
- **Update Mechanism:** Manual APK replacement (no auto-update for sideload)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP (Demo-Focused)

**Goal:** Prove the offline emergency registration + triage concept works in a controlled demo environment (March 6th, 2026)

**Philosophy:**
- **Show, don't tell:** Live demo beats slides
- **Simplicity over completeness:** Basic triage logic, limited roles, happy path only
- **Proof of concept, not production:** Demo quality, not field-test quality
- **Get stakeholder buy-in:** Success = "this could save lives, let's fund the full build"

**Resource Requirements:**
- **Team Size:** 1-2 developers
- **Timeline:** 10 days (Feb 26 → March 6)
- **Tech Stack:** Existing (Ionic/Angular/Capacitor - no new tech)
- **Infrastructure:** 1 Raspberry Pi, 1 Android device, local WiFi router

### MVP Feature Set (Phase 1a - Demo)

**Demo Date:** March 6th, 2026 (10 days)

**Core User Journeys Supported:**

**Primary Journey:**
- **Journey 1:** Primary Member registration (Pieter's story)
  - Install APK → Fill form offline → Sync at camp → Triage to Red/Green

**Secondary Journey:**
- **Journey 4:** Reception staff intake (Martie's story)
  - See synced member → Read camp assignment → Direct to area

**Out of Scope for Demo:**
- ❌ Journey 2: Distributed family sync (too complex for 10 days)
- ❌ Journey 3: Helper registration (nice-to-have, defer)
- ❌ Journeys 5-9: Other staff roles (Medical, Security, Logistics, Communication, Admin)

**Must-Have Capabilities (Demo-Critical):**

1. **APK Distribution** ✅
   - APK available for sideload install
   - Install via WhatsApp/USB (demonstrate one method)
   - **Status:** Already exists (current build process works)

2. **Offline Registration** ✅
   - All 10 form sections accessible offline
   - Data saves locally (SQLite)
   - "Vorm suksesvol ingedien" toast on submit
   - **Status:** Already exists (current form components work)

3. **Simple Triage Logic** ⚠️
   - **Logic:** Has medical condition flagged? → Red Camp, else → Green Camp
   - **Implementation:** Add simple boolean check in database service
   - **Estimate:** 2-4 hours

4. **Staff Dashboard (Reception View)** ⚠️
   - **View:** List of synced members with name, family size, camp assignment
   - **No medical details visible** (privacy-first)
   - **Implementation:** New component + service query
   - **Estimate:** 8-12 hours

5. **QR Code Provisioning (Nice-to-Have)** ⚠️
   - **Feature:** Scan QR → Auto-join WiFi → Sync
   - **Fallback:** Manual WiFi join (if no time for QR)
   - **Priority:** Include if time permits (high wow factor)
   - **Estimate:** 6-8 hours (QR generation + scanning)

6. **Data Update + Sync Demo** ✅
   - Member updates form → Staff sees updated data
   - **Status:** Already works (existing sync logic handles updates)
   - **Demo:** Update medical condition → triage changes Red/Green

7. **Role UI Demonstration** ⚠️
   - **Show:** Different views for Member vs Staff
   - **Implementation:** Role switcher or separate login
   - **Estimate:** 4-6 hours

8. **Step-by-Step Scenario Docs** ⚠️
   - **Document:** Demo script with exact steps
   - **Format:** Markdown with screenshots
   - **Estimate:** 3-4 hours to write

**Already Built (Reuse Existing):**
- ✅ Offline form (10 sections)
- ✅ Local database (SQLite)
- ✅ Sync service (push/pull)
- ✅ QR components (generator + scanner exist in codebase)

**Need to Build (10-Day Sprint):**
- ⚠️ Triage logic (2-4 hours)
- ⚠️ Reception dashboard (8-12 hours)
- ⚠️ Role switcher UI (4-6 hours)
- ⚠️ QR provisioning flow (6-8 hours) - OPTIONAL
- ⚠️ Demo documentation (3-4 hours)

**Total Effort Estimate:** 17-26 hours (achievable in 10 days)

### Post-MVP Features

**Phase 1b: Post-Demo MVP (Field-Test Ready)**

**Timeline:** 3-6 weeks after demo (assuming demo success + funding approval)

**Goal:** Make system production-ready for real field drills

**Additional Journeys:**
- Journey 2: Distributed family sync (separated spouse scenario)
- Journey 3: Helper/non-family registration
- Journey 5: Medical staff full access
- Journey 6: Security firearms tracking
- Journey 7: Logistics resource management
- Journey 8: Communication family search
- Journey 9: Admin system management

**Additional Capabilities:**
- Distributed family sync logic
- Non-family member isolation
- Full RBAC (6 staff roles with different permissions)
- Medical red flags surfacing
- Auto-retry sync (3 attempts with logging)
- i18n support (Afrikaans + English toggle)
- Code cleanup (remove unused code, enforce standards)
- Documentation consolidation (dev + scenario docs)

**Estimate:** 120-160 hours (3-4 weeks full-time, or 6 weeks part-time)

**Phase 2: Growth Features (Post-Pilot)**

**Timeline:** After 3 successful field drills (3-6 months post-demo)

**Trigger:** Pilot validation proves system works in real emergencies

**Features:**
- Bluetooth/USB manual sync fallback
- Advanced triage matrix (weighted scoring)
- Expanded RBAC (Doctor, Security detail roles)
- Real-time camp capacity monitoring
- Supply donation matching
- Skill-based assignments
- Multi-camp federation (inter-camp sync)
- Offline messaging between members

**Estimate:** 200-300 hours (2-3 months development)

**Phase 3: Vision (Future State)**

**Timeline:** 12-24 months post-launch

**Trigger:** System proven at scale (5,000+ families registered)

**Features:**
- AI triage assistant (ML-based camp assignment)
- Satellite sync fallback (Starlink integration)
- Biometric verification (fingerprint/face ID)
- Geofencing alerts ("You're near camp, here's route")
- Supply chain integration (auto-order medical supplies)
- Multi-language support (Zulu, Xhosa, etc.)
- Desktop/web admin portal (HQ oversight)
- Integration with national emergency services

**Estimate:** Ongoing product development

### Risk Mitigation Strategy

**Technical Risks:**

**Risk:** Demo fails due to sync issues or crashes
- **Mitigation:** Test extensively on real device + Pi setup (3 days before demo)
- **Fallback:** Pre-recorded video demo if live demo fails
- **Contingency:** Have backup device + Pi ready

**Risk:** Triage logic doesn't work as expected
- **Mitigation:** Keep logic DEAD SIMPLE (boolean: has_medical_condition → Red, else Green)
- **Testing:** 20+ test cases with different medical conditions
- **Fallback:** Manual triage override (staff can change Red/Green assignment)

**Risk:** QR provisioning doesn't work (device compatibility)
- **Mitigation:** Make QR optional, manual WiFi join works
- **Priority:** Build manual flow FIRST, QR second (if time)

**Market Risks:**

**Risk:** Stakeholders don't see value in demo
- **Mitigation:** Tell compelling story (Pieter's journey), show emotional impact
- **Validation:** Rehearse demo 2-3 times before March 6th
- **Fallback:** Have Vision roadmap ready (show what's possible post-MVP)

**Risk:** Real users find demo MVP too limited
- **Mitigation:** Set expectations - "This is proof of concept, field-test version comes next"
- **Timeline:** Show Phase 1b roadmap (full system in 6 weeks post-demo)

**Resource Risks:**

**Risk:** 10 days isn't enough time
- **Mitigation:** CUT QR provisioning if running behind (manual WiFi is fine)
- **Minimum Viable Demo:** Offline form + sync + basic dashboard (12-15 hours)
- **Team:** If stuck, ask for help on specific technical blockers

**Risk:** Pi hardware fails during demo
- **Mitigation:** Have 2 Pis ready, test both beforehand
- **Backup:** Laptop running backend (NestJS works on laptop, not just Pi)

**Risk:** Android device fails during demo
- **Mitigation:** Have 2 devices with APK installed
- **Testing:** Full dry-run 24 hours before demo

## Functional Requirements

### Purpose & Usage

These functional requirements define the complete capability inventory for the Suidlanders Emergency Plan App. Each requirement is:
- **Testable:** Can be verified as working or not working
- **Implementation-agnostic:** Describes WHAT, not HOW
- **User-focused:** Specifies WHO needs WHAT capability

**How these will be used:**
- UX Designer → Designs interactions for each capability
- Architect → Designs systems to support each capability
- PM/Dev → Creates stories to implement each capability

---

### 1. Member Registration & Data Management

**FR-1.1: Offline Member Registration**
- Members shall be able to register their family information completely offline without any network connection
- Registration form shall include 10 sections: Basic Info, Member Info, Address Info, Medical Info, Vehicle Info, Skills Info, Equipment Info, Other Info, Camp Info, Documents Info
- System shall save registration data locally to device storage
- System shall display "Vorm suksesvol ingedien" confirmation when registration is submitted

**FR-1.2: Family Member Management**
- Members shall be able to add dependents (family members) to their registration
- Each dependent shall have: name, relationship, age/birth date, medical notes
- Members shall be able to add/remove/edit dependent information

**FR-1.3: Non-Family Member Registration**
- Members shall be able to register non-family members (helping strangers) on their device
- Non-family registrations shall be isolated from the member's own family data
- System shall prevent data corruption between family and non-family registrations

**FR-1.4: Registration Updates**
- Members shall be able to update their registration information at any time
- Updates shall be saved locally and queued for synchronization
- Updated data shall replace previous version when synced

**FR-1.5: Document Upload**
- Members shall be able to upload documents (ID, licenses, certificates)
- Supported formats: PDF, JPG, PNG
- Maximum file size: 10MB per document
- Documents shall be captured via camera or selected from device storage

**FR-1.6: GPS Coordinate Capture**
- System shall auto-capture GPS coordinates for address registration
- Members shall be able to manually enter coordinates if GPS unavailable
- Coordinates shall be stored with address data

**FR-1.7: Distributed Family Registration**
- Family members at different locations shall be able to register independently
- System shall link separate registrations to single family unit
- Members shall indicate which family members are present vs absent during registration
- Members shall specify location of absent family members (e.g., "at different camp in Free State")

---

### 2. Camp Staff Operations

**FR-2.1: Reception Dashboard**
- Reception staff shall see list of all synced members
- Each entry shall display: member name, family size, camp assignment (Red/Green)
- Reception staff shall NOT see medical details, private data, or sensitive information
- Reception staff shall see "[MEDICAL - See Medical Staff]" or "[SECURITY FLAG - See Security Staff]" indicators only

**FR-2.2: Medical Staff Access**
- Medical staff shall have full access to medical profiles
- Medical data shall include: blood type, chronic conditions, medications, allergies, medical aid info
- Medical staff shall see critical medical flags (insulin, heart conditions, post-stroke)
- Medical staff shall be able to search members by name or medical condition

**FR-2.3: Security Staff Access**
- Security staff shall see firearms declarations (type, license, ammunition)
- Security staff shall see shooting experience level (military, sport, hunting, none)
- Security staff shall be able to identify potential defense volunteers
- Security staff shall perform identity verification against ID numbers

**FR-2.4: Logistics Staff Access**
- Logistics staff shall see aggregate resource needs (water, food, medical supplies)
- Logistics staff shall see skills inventory (mechanics, medics, farmers)
- Logistics staff shall see vehicle and fuel availability
- Logistics staff shall track supply levels and shortages

**FR-2.5: Communication Staff Access**
- Communication staff shall search for members by name, ID number, or vehicle registration
- Communication staff shall see family member locations (including other camps)
- Communication staff shall facilitate family reunification
- Communication staff shall see inter-camp family notifications

**FR-2.6: Admin Operations**
- Admin shall have full system access (all data, all roles)
- Admin shall monitor system status (sync success, failed attempts, errors)
- Admin shall manage user roles and permissions
- Admin shall perform database backups manually or view automated backup status
- Admin shall troubleshoot failed syncs
- Admin shall delete member data on request (POPIA compliance)

---

### 3. Data Synchronization & Offline Support

**FR-3.1: Automatic Sync on WiFi Connection**
- System shall automatically sync when device joins camp WiFi network
- Sync shall happen in background without user intervention
- System shall display sync status ("Syncing..." → "Sync successful")

**FR-3.2: QR Code Provisioning**
- Members shall be able to scan QR code to auto-join camp WiFi and sync
- QR code shall contain: server URLs, sync credentials, camp ID
- System shall try multiple server URLs until successful connection
- Manual WiFi join shall work as fallback if QR scan unavailable

**FR-3.3: Sync Retry Logic**
- System shall retry failed syncs up to 3 times with exponential backoff
- System shall log failed sync attempts with error details
- System shall alert admin after 3 failed attempts
- Members shall see clear failure messages with next steps

**FR-3.4: Manual USB Sync Fallback**
- Admin shall be able to perform manual USB sync when network unavailable
- System shall support encrypted USB data transfer
- USB sync shall work for both member devices and staff tablets

**FR-3.5: Family Data Merge**
- System shall merge separate family member registrations into single family unit
- Merge shall occur when both family members sync to same or different camps
- System shall preserve all data from both registrations (no data loss)
- Conflicts shall be resolved using timestamp-based last-write-wins

**FR-3.6: Inter-Camp Sync**
- Camps shall be able to sync data with other camps (satellite, radio, physical transfer)
- Communication staff shall receive notifications when family members sync at other camps
- System shall support family member migration between camps
- Inter-camp sync shall preserve data integrity across databases

**FR-3.7: Offline Data Persistence**
- System shall store data locally for 30+ days without sync
- Data shall persist through device restart, low battery, app force-quit
- Local database shall be encrypted at rest

**FR-3.8: Sync Queue Management**
- System shall queue changes when offline
- Queue shall preserve order of changes
- Queue shall clear after successful sync
- System shall display pending sync count to user

---

### 4. Triage & Camp Assignment

**FR-4.1: Automatic Triage Logic**
- System shall automatically assign members to Red Camp or Green Camp based on data
- Demo MVP triage logic: Member has medical condition → Red Camp, else → Green Camp
- Post-MVP: Advanced triage matrix with weighted scoring (medical needs, supplies, skills)
- System shall surface critical medical flags (insulin, heart medication, chronic conditions)

**FR-4.2: Manual Triage Override**
- Reception or Medical staff shall be able to manually override camp assignment
- Overrides shall be logged with staff ID and reason
- Original triage recommendation shall be preserved for audit

**FR-4.3: Camp Assignment Visibility**
- Members shall see their camp assignment after sync
- Staff shall see camp assignment for all members on dashboard
- Camp assignment shall be clearly indicated (Red Camp vs Green Camp)

---

### 5. Privacy & Access Control

**FR-5.1: Role-Based Access Control (RBAC)**
- System shall support 7 roles: Member, Reception, Medical, Security, Logistics, Communication, Admin
- Each role shall have specific data access permissions
- Staff shall only see data required for their role
- System shall enforce role restrictions at all access points

**FR-5.2: Medical Data Privacy**
- Medical data shall ONLY be accessible to Medical staff and Admin
- Reception, Logistics, Security, Communication roles shall NOT see medical details
- Medical data access shall be logged (who accessed what, when)

**FR-5.3: Firearms Data Security**
- Firearms data shall ONLY be accessible to Security staff and Admin
- Firearms data access shall be logged
- No printed reports allowed (or must be destroyed after use)

**FR-5.4: Audit Logging**
- System shall log all data access by staff (timestamp, user, member viewed)
- Logs shall be retained for 90 days minimum
- Admin shall be able to review access logs
- Inappropriate access shall trigger alerts

**FR-5.5: Data Consent**
- Members shall provide consent during registration
- Consent shall acknowledge data collection, storage, and camp usage
- Members shall acknowledge system limitations (no guarantees in emergency)

**FR-5.6: Data Deletion**
- Members shall be able to request data deletion at any time
- Admin shall fulfill deletion requests (permanent, unrecoverable)
- Audit logs shall record deletion requests and fulfillment

---

### 6. System Administration

**FR-6.1: System Monitoring**
- Admin shall see system health dashboard (uptime, sync status, errors)
- Admin shall see active user roles and connected staff
- Admin shall see database size and storage usage
- Admin shall receive alerts for critical issues (failed syncs, errors, security violations)

**FR-6.2: Database Backup & Restore**
- System shall perform automated daily backups to USB (midnight cron job)
- Admin shall trigger manual backup anytime
- Admin shall restore database from USB backup
- Backups shall be encrypted

**FR-6.3: User Role Management**
- Admin shall assign roles to staff (Reception, Medical, Security, etc.)
- Admin shall revoke roles (e.g., after inappropriate access)
- Admin shall view active staff sessions

**FR-6.4: Inter-Camp Administration**
- Admin shall initiate inter-camp sync (satellite, radio link)
- Admin shall monitor inter-camp sync status
- Admin shall resolve inter-camp conflicts manually if needed

**FR-6.5: Identity Verification**
- System shall validate South African ID numbers (13-digit format, checksum)
- System shall flag duplicate ID numbers (same person registered twice)
- System shall detect potential fraud (same ID used multiple times)

**FR-6.6: APK Distribution Support**
- System shall support APK sharing via WhatsApp, Bluetooth, USB
- APK shall be signed for sideload distribution
- System shall track app version (display in settings)

**FR-6.7: Multi-Language Support**
- System shall support Afrikaans (primary) and English (toggle)
- All UI labels, buttons, messages shall be translatable
- Language preference shall be stored per device
- Future: Zulu, Xhosa languages (Vision phase)

---

### Functional Requirements Summary by Phase

**Phase 1a (Demo - March 6th):**
- FR-1.1, FR-1.4, FR-1.5, FR-1.6 (Member registration basics)
- FR-2.1 (Reception dashboard)
- FR-3.1, FR-3.2 (Auto-sync + QR provisioning)
- FR-4.1, FR-4.3 (Simple triage)
- FR-5.1 (Basic RBAC - Member vs Staff)
- FR-6.6 (APK distribution)

**Phase 1b (Post-Demo MVP):**
- FR-1.2, FR-1.3, FR-1.7 (Family + non-family + distributed)
- FR-2.2, FR-2.3, FR-2.4, FR-2.5, FR-2.6 (All staff roles)
- FR-3.3, FR-3.4, FR-3.5, FR-3.6, FR-3.7, FR-3.8 (Full sync capabilities)
- FR-4.2 (Manual override)
- FR-5.2, FR-5.3, FR-5.4, FR-5.5, FR-5.6 (Full privacy + audit)
- FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5, FR-6.7 (Full admin capabilities)

**Phase 2 (Growth):**
- FR-4.1 enhancement (advanced triage matrix)
- Additional FR-6 enhancements (Bluetooth sync, advanced monitoring)

**Phase 3 (Vision):**
- AI-powered features (ML triage, predictive analytics)
- External integrations (national emergency services)
- Advanced capabilities (biometrics, satellite sync, geofencing)

