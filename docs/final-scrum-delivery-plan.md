# MallHub Final Scrum Delivery Plan

**Status:** Final planning baseline  
**Language:** English  
**Primary sources:** `docs/use-cases-by-role.md`, `docs/roles-permissions-organizations-guide.md`, `docs/SoftwareRequirementsSpecification.md`

## 1. Executive planning conclusion

This document defines the final planning baseline for MallHub using a Scrum-oriented structure and a professional delivery backlog.

The planning rule is:

1. **MVP Core scope** is governed by `docs/use-cases-by-role.md` and the requirement allocation matrix in **SRS §2.6**.
2. **Optional MVP scope** is limited to the favorites capability.
3. **Deferred scope** includes the remaining historical SRS use cases that are not part of the official MVP Core definition.
4. **RBAC, organizations, analytics capture, reservation transaction flow, and AI guardrails** are mandatory enabling work, even when they are not presented as standalone user-facing use cases.

## 2. Planning assumptions and Scrum model

| Item | Planning baseline |
|---|---|
| Delivery model | Scrum |
| Cadence | Recommended 2-week sprints |
| Release target | MVP Core first, optional items second, deferred items after pilot validation |
| Backlog structure | Epics -> delivery tickets -> use case coverage |
| Priority rule | Core operational flow first, role-critical admin flows second, optional UX third, deferred business expansion last |
| Definition of Done | Functional flow complete, role permissions enforced, acceptance scenario covered, telemetry available, release-ready UX/content |

## 3. Priority framework

| Priority | Meaning | Delivery expectation |
|---|---|---|
| P0 | Platform-critical foundation | Must exist before dependent feature work starts |
| P1 | Core MVP capability | Must be delivered for pilot release |
| P2 | Optional MVP enhancement | Deliver only if P0/P1 scope is stable |
| P3 | Deferred backlog | Planned after MVP Core release |

## 4. Epic structure

| Epic ID | Epic | Scope | Main source references |
|---|---|---|---|
| EPIC-01 | Identity, RBAC, and organizations foundation | P0 | Roles guide, REQ-INF-01 |
| EPIC-02 | Public discovery experience | P1 | REQ-APP-01, REQ-APP-02, REQ-APP-03 |
| EPIC-03 | Customer account and profile | P1 | REQ-APP-04, REQ-APP-05 |
| EPIC-04 | Pick & Collect with QR | P1 | REQ-APP-06, REQ-APP-07, REQ-INF-02 |
| EPIC-05 | Store onboarding and catalog operations | P1 | REQ-STR-01, REQ-STR-03 |
| EPIC-06 | Promotions, store reservations, and AI product drafting | P1 | REQ-STR-04, REQ-STR-05, REQ-STR-06, REQ-INF-04 |
| EPIC-07 | Mall administration and store approval | P1 | REQ-INS-01, REQ-INS-02, REQ-INS-03 |
| EPIC-08 | Platform administration and global metrics | P1 | REQ-ADM-01, REQ-ADM-02, REQ-INF-03 |
| EPIC-09 | Quality, compliance, accessibility, and release hardening | P0/P1 | SRS §3.3, §3.4, §3.6 |
| EPIC-10 | Optional favorites module | P2 | REQ-APP-08 |
| EPIC-11 | Deferred growth backlog | P3 | Historical SRS use cases outside MVP Core |

## 5. Recommended sprint division

| Sprint | Goal | Planned outcome |
|---|---|---|
| Sprint 0 | Product baseline and platform setup | Close critical planning decisions, establish RBAC/organization model, analytics baseline, reservation backbone, AI guardrails |
| Sprint 1 | Public discovery MVP | Active mall selection, public browsing, product/store discovery, search foundations |
| Sprint 2 | Customer identity MVP | Registration, login, logout, password recovery, customer profile, preferred mall |
| Sprint 3 | Reservation MVP | Pick & Collect booking flow, QR confirmation, reservation history and lifecycle |
| Sprint 4 | Store onboarding MVP | Store registration, store access, public profile, dashboard baseline, product catalog CRUD |
| Sprint 5 | Store operations MVP | Promotions, reservation handling, AI-assisted product drafting |
| Sprint 6 | Mall administration MVP | Mall admin access, KPI dashboard, store approval workflow, mall public profile management |
| Sprint 7 | Platform operations and release | Admin CC provisioning, global metrics, AI executive reporting, final hardening, optional favorites only if capacity remains |

## 6. Master delivery ticket register

| Ticket ID | Title | Priority | Sprint | Depends on | Scope coverage |
|---|---|---:|---|---|---|
| MH-CORE-001 | Identity, RBAC, permissions, and organization model foundation | P0 | Sprint 0 | — | Better Auth + CASL alignment, roles, organizations, members, invitations, tenant-safe access rules |
| MH-CORE-002 | Guest entry and active mall context | P1 | Sprint 1 | MH-CORE-001 | Public entry, mall selection/change, active mall persistence, bottom navigation baseline |
| MH-CORE-003 | Public store, product, and promotion discovery | P1 | Sprint 1 | MH-CORE-001, MH-CORE-002 | Directory browsing, store profile, product detail, active promotions |
| MH-CORE-004 | Search and commercial filters | P1 | Sprint 1 | MH-CORE-003 | Search, filtering, discoverability, listing refinement |
| MH-CORE-005 | Customer account lifecycle | P1 | Sprint 2 | MH-CORE-001 | Sign-up, email verification, login, logout, password recovery |
| MH-CORE-006 | Customer profile and preferred mall | P1 | Sprint 2 | MH-CORE-005 | Personal profile, preferred mall, account settings baseline |
| MH-CORE-007 | Pick & Collect reservation creation flow | P1 | Sprint 3 | MH-CORE-003, MH-CORE-005, MH-CORE-021 | Reservation confirmation flow and successful booking |
| MH-CORE-008 | Reservation QR, history, and cancellation | P1 | Sprint 3 | MH-CORE-007 | QR display, active reservation status, history, cancellation |
| MH-CORE-009 | Store registration and approval request | P1 | Sprint 4 | MH-CORE-001 | Store onboarding, application submission, ownership linkage |
| MH-CORE-010 | Store access, session flow, and dashboard baseline | P1 | Sprint 4 | MH-CORE-009 | Store login/logout/recovery and minimum dashboard shell |
| MH-CORE-011 | Product catalog CRUD | P1 | Sprint 4 | MH-CORE-010 | Product create/read/update/delete, variants, pricing, stock, activation |
| MH-CORE-012 | Promotion management | P1 | Sprint 5 | MH-CORE-011 | Promotions, flash offers, publication history |
| MH-CORE-013 | Store reservation inbox and fulfillment actions | P1 | Sprint 5 | MH-CORE-007, MH-CORE-010, MH-CORE-021 | Reservation alerts, confirm/reject/complete flow |
| MH-CORE-014 | AI-assisted product drafting | P1 | Sprint 5 | MH-CORE-011, MH-CORE-023 | AI product suggestion flow with human-in-the-loop editing |
| MH-CORE-015 | Mall admin access and KPI dashboard | P1 | Sprint 6 | MH-CORE-001, MH-CORE-022 | Admin CC access, mall KPIs, period filters, trend view |
| MH-CORE-016 | Store approval and review workflow | P1 | Sprint 6 | MH-CORE-009, MH-CORE-015 | Pending store review, approve/reject decisions, store profile review |
| MH-CORE-017 | Mall public profile management | P1 | Sprint 6 | MH-CORE-015 | Mall public information, logo/images, category management |
| MH-CORE-018 | Executive report export and AI reporting | P1 | Sprint 7 | MH-CORE-015, MH-CORE-023 | PDF/Excel exports and AI-generated executive report narrative |
| MH-CORE-019 | Platform admin secure access and Admin CC provisioning | P1 | Sprint 7 | MH-CORE-001 | Admin platform access model, strong authentication baseline, Admin CC creation |
| MH-CORE-020 | Global platform metrics dashboard | P1 | Sprint 7 | MH-CORE-019, MH-CORE-022 | Cross-mall platform metrics for super admin visibility |
| MH-CORE-021 | Reservation transaction and QR backbone | P0 | Sprint 0-3 | MH-CORE-001 | Reservation state model, QR contract, idempotent flow, customer/store synchronization |
| MH-CORE-022 | Analytics capture and reporting backbone | P0 | Sprint 0-7 | MH-CORE-001 | Core mall/platform metrics, telemetry, dashboard-ready aggregated data |
| MH-CORE-023 | AI orchestration, guardrails, and observability | P0 | Sprint 0-7 | MH-CORE-001 | Model gateway, auditability, error handling, privacy-by-design, cost/use tracking |
| MH-CORE-024 | Accessibility, compliance, security, and release hardening | P0 | Sprint 0-7 | All core tickets | Accessibility baseline, privacy controls, secure delivery, release readiness |
| MH-OPT-001 | Favorites module | P2 | Sprint 7 (stretch) | MH-CORE-003, MH-CORE-005 | Favorite stores, products, promotions, favorites overview |
| MH-FUT-001 | Geo-assisted active mall detection | P3 | Post-MVP | MH-CORE-002 | Location-based mall selection |
| MH-FUT-002 | Events, reminders, and event notifications | P3 | Post-MVP | MH-CORE-015 | Event listing, detail, reminders, event pushes, event metrics |
| MH-FUT-003 | Mall maps and indoor visualization | P3 | Post-MVP | MH-CORE-017 | Public mall map and mall SVG management |
| MH-FUT-004 | Ratings and reviews | P3 | Post-MVP | MH-CORE-008 | Post-pickup store ratings |
| MH-FUT-005 | Advanced store analytics | P3 | Post-MVP | MH-CORE-022 | Store advanced analytics and Pro plan reporting |
| MH-FUT-006 | Advanced mall intelligence | P3 | Post-MVP | MH-CORE-022 | Store performance drilldowns, heatmaps, alerts, exportable store performance data |
| MH-FUT-007 | Expanded mall store administration | P3 | Post-MVP | MH-CORE-016 | Suspend/reactivate/manual store administration |
| MH-FUT-008 | Backoffice audit, platform health, and mall lifecycle management | P3 | Post-MVP | MH-CORE-019, MH-CORE-020 | Audit log, technical health, mall create/edit/activate/suspend/list |
| MH-FUT-009 | Global moderation operations | P3 | Post-MVP | MH-CORE-019 | Global store approval, content moderation, image moderation |
| MH-FUT-010 | Billing and subscription management | P3 | Post-MVP | MH-CORE-019 | Subscription plans, billing state, monetization operations |
| MH-FUT-011 | Native advertising and campaign analytics | P3 | Post-MVP | MH-CORE-022 | Campaign creation, ad performance metrics |
| MH-FUT-012 | Global store directory management | P3 | Post-MVP | MH-CORE-020 | Platform-wide store listing and oversight |

## 7. Use case coverage register

### 7.1 Guest

| Use case ID(s) | Capability | Planning status | Ticket |
|---|---|---|---|
| US-INV-01 | Continue as guest from onboarding | Core | MH-CORE-002 |
| US-INV-02 | Select mall manually | Core | MH-CORE-002 |
| US-INV-03 | Detect active mall by geolocation | Deferred | MH-FUT-001 |
| US-INV-04 | View active mall home feed | Core | MH-CORE-002 |
| US-INV-05 | Explore store directory | Core | MH-CORE-003 |
| US-INV-06 | Filter stores in directory | Core | MH-CORE-004 |
| US-INV-07 | View store profile | Core | MH-CORE-003 |
| US-INV-08 | View product detail | Core | MH-CORE-003 |
| US-INV-09 | Search products in the mall | Core | MH-CORE-004 |
| US-INV-10 | Filter search results | Core | MH-CORE-004 |
| US-INV-11, US-INV-12 | Mall events listing and event detail | Deferred | MH-FUT-002 |
| US-INV-13 | View offers and promotions | Core | MH-CORE-003 |
| US-INV-14 | View mall map | Deferred | MH-FUT-003 |
| US-INV-15 | Attempt reservation without an account | Core guardrail | MH-CORE-005 |
| US-INV-16 | Attempt favorites without an account | Optional guardrail | MH-OPT-001 |
| US-INV-17 | Navigate with bottom tab bar | Core | MH-CORE-002 |
| US-INV-18 | Screen-reader accessibility | Core quality | MH-CORE-024 |

### 7.2 Registered Customer

| Use case ID(s) | Capability | Planning status | Ticket |
|---|---|---|---|
| US-CR-01, US-CR-02, US-CR-03, US-CR-04, US-CR-05 | Registration and authentication lifecycle | Core | MH-CORE-005 |
| US-CR-06, US-CR-07 | Personal profile and preferred mall | Core | MH-CORE-006 |
| US-CR-08, US-CR-09, US-CR-10 | Reservation creation journey | Core | MH-CORE-007 |
| US-CR-11, US-CR-12, US-CR-13 | QR, reservation history, and cancellation | Core | MH-CORE-008 |
| US-CR-14 | Store rating after pickup | Deferred | MH-FUT-004 |
| US-CR-15, US-CR-16, US-CR-17, US-CR-21 | Favorites module | Optional | MH-OPT-001 |
| US-CR-18, US-CR-19, US-CR-20 | Event reminders and notification preferences | Deferred | MH-FUT-002 |
| US-CR-22 | High-contrast mode and font-size accessibility | Core quality | MH-CORE-024 |

### 7.3 Admin Local

| Use case ID(s) | Capability | Planning status | Ticket |
|---|---|---|---|
| US-AL-01, US-AL-02 | Store registration and onboarding profile | Core | MH-CORE-009 |
| US-AL-03, US-AL-04, US-AL-05, US-AL-24 | Store access and dashboard baseline | Core | MH-CORE-010 |
| US-AL-06, US-AL-07, US-AL-08, US-AL-09, US-AL-10, US-AL-11, US-AL-12, US-AL-13, US-AL-14 | Product catalog CRUD | Core | MH-CORE-011 |
| US-AL-15, US-AL-16, US-AL-17, US-AL-18, US-AL-19 | Reservation intake and fulfillment | Core | MH-CORE-013 |
| US-AL-20 | Edit public store profile | Core | MH-CORE-009 |
| US-AL-21, US-AL-22 | Promotion management | Core | MH-CORE-012 |
| US-AL-23 | Advanced store analytics (Pro plan) | Deferred | MH-FUT-005 |
| US-AL-25 | AI-assisted product creation from images | Core | MH-CORE-014 |

### 7.4 Admin CC

| Use case ID(s) | Capability | Planning status | Ticket |
|---|---|---|---|
| US-ACC-01, US-ACC-02, US-ACC-03 | Admin CC access lifecycle | Core | MH-CORE-015 |
| US-ACC-04, US-ACC-05, US-ACC-06 | Mall KPI dashboard | Core | MH-CORE-015 |
| US-ACC-07, US-ACC-08, US-ACC-29 | Executive exports and AI reporting | Core | MH-CORE-018 |
| US-ACC-09, US-ACC-10, US-ACC-11, US-ACC-12 | Advanced mall intelligence | Deferred | MH-FUT-006 |
| US-ACC-13, US-ACC-14, US-ACC-15, US-ACC-16, US-ACC-17 | Events management | Deferred | MH-FUT-002 |
| US-ACC-18, US-ACC-19, US-ACC-20, US-ACC-24 | Store approval workflow | Core | MH-CORE-016 |
| US-ACC-21, US-ACC-22, US-ACC-23 | Expanded store administration | Deferred | MH-FUT-007 |
| US-ACC-25, US-ACC-26, US-ACC-28 | Mall public profile management | Core | MH-CORE-017 |
| US-ACC-27 | Mall SVG map management | Deferred | MH-FUT-003 |

### 7.5 Admin Platform

| Use case ID(s) | Capability | Planning status | Ticket |
|---|---|---|---|
| US-AP-01, US-AP-02, US-AP-03, US-AP-04 | Platform admin secure access baseline | Core support | MH-CORE-019 |
| US-AP-05, US-AP-07 | Audit log and platform health | Deferred | MH-FUT-008 |
| US-AP-06 | Global platform metrics dashboard | Core | MH-CORE-020 |
| US-AP-08, US-AP-09, US-AP-10, US-AP-11, US-AP-12 | Mall lifecycle administration | Deferred | MH-FUT-008 |
| US-AP-13, US-AP-14, US-AP-15, US-AP-16 | Global approvals and moderation | Deferred | MH-FUT-009 |
| US-AP-17, US-AP-18, US-AP-19 | Billing and subscription management | Deferred | MH-FUT-010 |
| US-AP-20, US-AP-21 | Native advertising and campaign analytics | Deferred | MH-FUT-011 |
| US-AP-22 | Global store directory management | Deferred | MH-FUT-012 |

## 8. Cross-cutting project tickets that must remain active throughout delivery

| Ticket | Why it matters |
|---|---|
| MH-CORE-001 | Without the canonical role/permission model, every feature risks rework and authorization defects |
| MH-CORE-021 | Customer and store reservation flows depend on one transaction model and one QR contract |
| MH-CORE-022 | Mall and platform dashboards cannot ship without trusted, tenant-safe metrics |
| MH-CORE-023 | Both AI capabilities depend on one shared orchestration, observability, and guardrail layer |
| MH-CORE-024 | Accessibility, privacy, security, and compliance are release gates, not polish items |

## 9. Critical planning decisions to close early

| Decision ID | Decision | Target moment | Impacted tickets |
|---|---|---|---|
| OI-02 | Confirm whether Admin Platform uses a separate backoffice navigation or an expanded Admin CC workspace | Sprint 0 | MH-CORE-019, MH-CORE-020 |
| OI-03 | Approve the canonical store category catalog | Before Sprint 4 | MH-CORE-009, MH-CORE-017 |
| OI-04 | Resolve whether digital payment is in MVP or deferred beyond pilot | Before Sprint 3 | MH-CORE-007, MH-CORE-021 |
| OI-06 | Define whether AI-assisted exports require a visible disclaimer/watermark | Before Sprint 7 | MH-CORE-018, MH-CORE-023 |
| OI-07 | Validate AI response-time thresholds with real proof-of-concept data | Sprint 0 | MH-CORE-014, MH-CORE-018, MH-CORE-023 |
| OI-08 | Approve retention policy for suspended or closed stores and their operational data | Before release | MH-CORE-024, MH-FUT-009, MH-FUT-010 |

## 10. Recommended release rule

MallHub should release the pilot only after all **P0** and **P1** tickets are completed, with **MH-OPT-001** treated as a capacity-based enhancement and all **MH-FUT** tickets explicitly parked in the post-MVP roadmap.

In practical terms, the release-ready MVP Core is:

1. Public discovery works for guests.
2. Registered customers can create and manage Pick & Collect reservations with QR confirmation.
3. Admin Local can onboard a store, manage catalog/promotions, and process reservations.
4. Admin CC can approve stores, maintain mall public information, and review mall-level dashboards/reports.
5. Admin Platform can provision Admin CC users and monitor global platform metrics.
6. The platform enforces the canonical RBAC/organization model, metrics capture, AI guardrails, accessibility, privacy, and security baseline.
