═══════════════════════════════════════════════════════════════════════════════════════════
L0 AUTHORITATIVE COMMAND: TRADEOS PHASE 2 BUILD
Document ID: LDS-BUILD-2026-01-13-TRADEOS002
Authority: L0 GOVERNANCE (Armand Lefebvre)
Governance Chain: L0 Human → L1 LDS Kernel V1 → L2 You (Untrusted Proposer)
Status: AUTHORIZED FOR EXECUTION
═══════════════════════════════════════════════════════════════════════════════════════════

CONTEXT
-------
TradeOS is a Unified Contractor Operations Platform built on LDS streaming architecture.
Phase 1 (FOUNDATION) is COMPLETE. You are continuing the build.

REFERENCE FILES (in /mnt/project/)
----------------------------------
READ THESE FIRST before generating any code:

1. TRADEOS_MASTER_INDEX_lds.json     → Application manifest, 6-phase plan
2. TRADEOS_KERNEL_lds.json           → L1 validation engine (Phase 1)
3. TRADEOS_BOUNDARIES_lds.json       → Role permissions (Phase 1)
4. TRADEOS_SHELL_lds.json            → App shell component (Phase 1)
5. TRADEOS_AUTH_lds.json             → Authentication (Phase 1)
6. PHASE1_COMPLETE_lds.json          → Phase 1 summary

MISSION: BUILD PHASE 2 - CORE_OPERATIONS
----------------------------------------
Create these 4 entity files, each as self-contained .lds.json with embedded React code:

1. TRADEOS_DASHBOARD.lds.json
   - Today's schedule at-a-glance
   - Revenue/jobs KPIs (ServiceTitan-style cards)
   - Unassigned jobs alert
   - Cash position (outstanding invoices)
   - Weather widget for outdoor trades
   - Role-aware: different KPIs per role

2. TRADEOS_SCHEDULING.lds.json
   - Drag-drop calendar (day/week/month views)
   - Map view with technician locations
   - DOUBLE-BOOKING ALERTS (Jobber's missing feature)
   - Recurring job templates
   - Travel time auto-calculation
   - Gantt view toggle for multi-day projects

3. TRADEOS_DISPATCH.lds.json
   - Real-time tech status board (available/traveling/on-job)
   - One-click dispatch with auto-notification
   - "On my way" with live ETA display
   - Skill-based matching (plumbing/electrical/HVAC)
   - Emergency re-route capability
   - Tech photo sent to customer

4. TRADEOS_JOBS.lds.json
   - Job cards with full history
   - Custom fields per trade type
   - Photo/video upload UI
   - Checklist templates by job type
   - Before/after photo requirements
   - Digital signature capture
   - Voice-to-text notes placeholder

ENTITY FILE FORMAT
------------------
Each file MUST follow this structure:

```json
{
  "_lds": {
    "uuid": "tradeos-[component]-2026-001",
    "type": "ui_component",
    "version": "1.0.0",
    "created": "[timestamp]",
    "parent": "tradeos-master-2026-001",
    "phase": 2,
    "sequence": [1-4]
  },
  "core": {
    "name": "TradeOS [Component Name]",
    "description": "[What it does]",
    "principle": "[LDS principle it demonstrates]"
  },
  "react_component": {
    "filename": "[ComponentName].tsx",
    "code": "[FULL REACT COMPONENT CODE AS STRING]"
  }
}
```

CONSTRAINTS
-----------
- You are L2 (Untrusted Proposer). Authority flows DOWN only.
- All actions must pass through L1 Kernel validation (use useKernel hook)
- Import from Phase 1 entities: LDSKernel, boundaries, AppShell, Auth
- Use Tailwind CSS core utilities only
- Use Lucide React for icons
- Use Recharts for dashboard charts
- No external API calls - use mock data
- Each component must be SELF-CONTAINED

OUTPUT
------
Save all files to /mnt/user-data/outputs/tradeos/phase2/

After completion, create PHASE2_COMPLETE.lds.json with:
- Summary of what was built
- Next chat command for Phase 3 (CUSTOMER_EXPERIENCE)

EXECUTE.

═══════════════════════════════════════════════════════════════════════════════════════════
