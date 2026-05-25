"""
GRC Engineering Platform — LinkedIn Infographic  (v5 — final clean)
- No yellow/amber curves or arcs anywhere
- No 'Built with Claude AI'
- Straight arrows only in flow diagram
- All amber replaced with orange or removed
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import numpy as np

W, H = 16, 22
DPI  = 150
fig  = plt.figure(figsize=(W, H), facecolor="#0D1117")
ax   = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, W)
ax.set_ylim(0, H)
ax.axis("off")

# Palette  — NO amber/yellow
BG      = "#0D1117"
CARD    = "#161B22"
CARD2   = "#21262D"
BLUE    = "#58A6FF"
GREEN   = "#3FB950"
ORANGE  = "#F78166"   # replaces amber — no yellow
RED     = "#F85149"
PURPLE  = "#BC8CFF"
CYAN    = "#39D0D8"
TEAL    = "#2DD4BF"
WHITE   = "#F0F6FC"
GREY    = "#8B949E"
BORDER  = "#30363D"
LGREY   = "#484F58"

def rbox(x, y, w, h, fc=CARD, ec=None, lw=0, r=0.25, alpha=1.0, zorder=2):
    ec = ec or fc
    p = FancyBboxPatch((x, y), w, h,
                       boxstyle=f"round,pad=0,rounding_size={r}",
                       facecolor=fc, edgecolor=ec,
                       linewidth=lw if ec != fc else 0,
                       alpha=alpha, zorder=zorder)
    ax.add_patch(p)

def t(x, y, s, sz=14, c=WHITE, ha="center", va="center", bold=False, zorder=6):
    ax.text(x, y, s, fontsize=sz, color=c, ha=ha, va=va,
            fontweight="bold" if bold else "normal",
            zorder=zorder, fontfamily="DejaVu Sans")

def hr(y, x0=0.4, x1=15.6, c=BORDER, lw=1.0):
    ax.plot([x0, x1], [y, y], color=c, lw=lw, solid_capstyle="round", zorder=3)

def straight_arrow(x1, y1, x2, y2, col=GREY, lw=2.0):
    ax.annotate("",
        xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle="-|>", color=col, lw=lw,
                        connectionstyle="arc3,rad=0.0"),
        zorder=8)


# ══════════════════════════════════════════════════════════════
#  1. HEADER
# ══════════════════════════════════════════════════════════════
rbox(0, 20.6, W, 1.4, fc="#161B22", r=0)

ax.add_patch(plt.Circle((1.1, 21.3), 0.42, color=BLUE, zorder=5))
t(1.1, 21.3, "GRC", sz=11, c=BG, bold=True)

t(8, 21.52, "GRC Engineering Platform", sz=26, bold=True, c=WHITE)
t(8, 21.05, "Automated Governance, Risk & Compliance  |  Powered by AI", sz=13, c=GREY)

rbox(11.6, 21.08, 2.1, 0.56, fc=GREEN, ec=GREEN, r=0.15)
t(12.65, 21.36, "Always Audit-Ready", sz=11, c=BG, bold=True)

rbox(13.85, 21.08, 2.0, 0.56, fc=BLUE, ec=BLUE, r=0.15)
t(14.85, 21.36, "Zero Surprise Fines", sz=11, c=BG, bold=True)


# ══════════════════════════════════════════════════════════════
#  2. PROBLEM vs SOLUTION
# ══════════════════════════════════════════════════════════════
t(8, 20.32, "THE CHALLENGE  &  THE SOLUTION", sz=13, c=GREY, bold=True)

rbox(0.4, 17.82, 7.3, 2.26, fc="#2D1118", ec=RED, lw=2.0, r=0.3)
t(4.05, 19.82, "OLD WAY  —  Annual Audit Trap", sz=15, bold=True, c=RED)
for i, p in enumerate([
    "[X]  Wait 12 months — then panic for weeks",
    "[X]  Compliance gaps found at the worst moment",
    "[X]  Manual evidence from 5 different spreadsheets",
    "[X]  Fines, remediations, reputational damage",
]):
    t(4.05, 19.38 - i * 0.44, p, sz=12.5, c="#FFB3B3")

rbox(8.3, 17.82, 7.3, 2.26, fc="#0E2318", ec=GREEN, lw=2.0, r=0.3)
t(11.95, 19.82, "NEW WAY  —  Continuous Compliance", sz=15, bold=True, c=GREEN)
for i, s in enumerate([
    "[OK]  Automated audit every quarter — zero manual work",
    "[OK]  AI flags every risk before it becomes a violation",
    "[OK]  Evidence auto-collected and always current",
    "[OK]  Always ready for auditors — zero surprise fines",
]):
    t(11.95, 19.38 - i * 0.44, s, sz=12.5, c="#9BE9A8")

hr(17.72)


# ══════════════════════════════════════════════════════════════
#  3. KEY STATS
# ══════════════════════════════════════════════════════════════
stats = [
    ("25+",      "Compliance\nFrameworks",  BLUE),
    ("4x / yr",  "Automated\nAudit Cycles", GREEN),
    ("< 60 sec", "Per Audit\nCycle",        PURPLE),
    ("6",        "AI Providers\nSupported", CYAN),
]
sw, sh = 3.5, 1.72
for i, (val, lbl, col) in enumerate(stats):
    sx = 0.4 + i * (sw + 0.27)
    rbox(sx, 15.8, sw, sh, fc=CARD, ec=col, lw=2.0, r=0.28)
    t(sx + sw/2, 16.94, val, sz=26, bold=True, c=col)
    t(sx + sw/2, 16.44, lbl, sz=12, c=GREY)

hr(15.70)


# ══════════════════════════════════════════════════════════════
#  4. HOW IT WORKS  — straight arrows, no curves
# ══════════════════════════════════════════════════════════════
t(8, 15.48, "HOW IT WORKS  —  Automated Quarterly Compliance Loop",
  sz=15, bold=True, c=WHITE)

nodes = [
    ("CONTROLS\nRegistry",    "#1B3A3A", CYAN),
    ("RISK\nRegister",        "#1B2550", BLUE),
    ("AI\nEngine",            "#2D1F4B", PURPLE),
    ("AUTO\nAudit Run",       "#1B3340", TEAL),
    ("COMPLIANCE\nDashboard", "#1B3B2A", GREEN),
    ("AUDIT\nREADY",          "#163016", GREEN),
]

nw, nh, ng = 2.22, 1.42, 0.30
total_w = len(nodes) * nw + (len(nodes) - 1) * ng
sx0 = (W - total_w) / 2
ny0 = 13.88

for i, (label, bg, col) in enumerate(nodes):
    nx = sx0 + i * (nw + ng)
    rbox(nx, ny0, nw, nh, fc=bg, ec=col, lw=2.0, r=0.22)
    t(nx + nw/2, ny0 + nh/2, label, sz=13, bold=True, c=col)
    if i < len(nodes) - 1:
        straight_arrow(
            nx + nw + 0.03, ny0 + nh/2,
            nx + nw + ng - 0.03, ny0 + nh/2,
            col=LGREY, lw=2.2
        )

# Plain text — no arc, no curve
t(8, 13.44,
  "Every quarter: Controls checked  ->  Risks scored  ->  AI audits  ->  Report ready",
  sz=12, c=GREY)

hr(13.22)


# ══════════════════════════════════════════════════════════════
#  5. PLATFORM MODULES  (4 cards)
# ══════════════════════════════════════════════════════════════
t(8, 13.04, "PLATFORM MODULES", sz=15, bold=True, c=WHITE)

modules = [
    ("VENDOR RISK",   TEAL,   [
        "Tier 1 / 2 / 3 ratings",
        "Risk questionnaires",
        "AI risk assessment",
        "SLA violation alerts",
    ]),
    ("INCIDENT MGMT", RED, [
        "P0 - P4 severity levels",
        "Automated workflows",
        "Full timeline & audit trail",
        "AI root-cause analysis",
    ]),
    ("POLICY ENGINE", PURPLE, [
        "25+ framework templates",
        "Gap analysis & heatmaps",
        "Acknowledgement tracking",
        "Policy version history",
    ]),
    ("AUTH & RBAC",   BLUE, [
        "JWT Bearer token auth",
        "5 role permission layers",
        "Rate limiting per IP",
        "Full activity audit logs",
    ]),
]

mw = (W - 0.8 - 3 * 0.35) / 4
mh = 3.6
my0 = 9.3

for i, (title, col, bullets) in enumerate(modules):
    mx = 0.4 + i * (mw + 0.35)
    rbox(mx, my0, mw, mh, fc=CARD, ec=col, lw=2.0, r=0.28)
    ax.add_patch(FancyBboxPatch(
        (mx, my0 + mh - 0.62), mw, 0.62,
        boxstyle="round,pad=0,rounding_size=0.22",
        facecolor=col, alpha=0.22, edgecolor="none", zorder=3))
    t(mx + mw/2, my0 + mh - 0.31, title, sz=12.5, bold=True, c=col)
    for j, b in enumerate(bullets):
        t(mx + 0.22, my0 + mh - 1.02 - j * 0.66,
          f">>  {b}", sz=12, c=WHITE, ha="left")

hr(9.18)


# ══════════════════════════════════════════════════════════════
#  6. COMPLIANCE FRAMEWORKS
# ══════════════════════════════════════════════════════════════
t(8, 9.0, "SUPPORTED COMPLIANCE FRAMEWORKS", sz=14, bold=True, c=WHITE)

row1 = ["SOC 2", "ISO 27001", "HIPAA", "PCI-DSS", "GDPR",
        "NIST CSF", "FedRAMP", "CCPA", "SOX", "CMMC"]
row2 = ["CIS Controls", "COBIT", "ISO 31000", "DORA", "NIS2",
        "HITRUST", "FISMA", "NERC CIP", "BASEL III", "SWIFT"]

for row_idx, items in enumerate([row1, row2]):
    ry = 8.35 - row_idx * 0.66
    fw = (W - 0.8) / len(items) - 0.12
    for i, f in enumerate(items):
        fx = 0.4 + i * (fw + 0.12)
        rbox(fx, ry, fw, 0.52, fc=CARD2, ec=BORDER, lw=1.0, r=0.14)
        t(fx + fw/2, ry + 0.26, f, sz=11, c=GREY)

hr(7.55)


# ══════════════════════════════════════════════════════════════
#  7. TECH STACK
# ══════════════════════════════════════════════════════════════
t(8, 7.38, "TECH STACK", sz=14, bold=True, c=WHITE)

stack = [
    ("FastAPI",      "#009688"), ("React 18",    "#61DAFB"),
    ("TypeScript",   "#3178C6"), ("Python 3.11", "#4B8BBE"),
    ("SQLAlchemy",   "#D32F2F"), ("JWT Auth",    "#F78166"),
    ("Claude AI",    "#9B59B6"), ("GPT-4",       "#74AA9C"),
    ("Docker",       "#2496ED"), ("Tailwind CSS","#06B6D4"),
]
tw = (W - 0.8 - 9 * 0.18) / 10
for i, (name, col) in enumerate(stack):
    tx = 0.4 + i * (tw + 0.18)
    rbox(tx, 6.74, tw, 0.52, fc=CARD, ec=col, lw=1.8, r=0.14)
    t(tx + tw/2, 7.0, name, sz=11, c=col, bold=True)

hr(6.60)


# ══════════════════════════════════════════════════════════════
#  8. VISION QUOTE
# ══════════════════════════════════════════════════════════════
rbox(0.4, 5.02, W - 0.8, 1.40, fc=CARD2, ec=BLUE, lw=1.5, r=0.3)
t(8, 6.24,
  '"Instead of scrambling once a year, companies run automated quarterly audits.',
  sz=13.5, c=WHITE)
t(8, 5.82,
  '  Every gap is caught early. Every control is evidence-backed. Zero surprise fines."',
  sz=13.5, c=WHITE)
t(8, 5.26,
  "GRC Engineering Platform  |  POC built to become production-ready RegTech",
  sz=11, c=GREY)

hr(4.90)


# ══════════════════════════════════════════════════════════════
#  9. QUARTERLY AUDIT CYCLE
# ══════════════════════════════════════════════════════════════
t(8, 4.74, "AUTOMATED QUARTERLY AUDIT CYCLE", sz=14, bold=True, c=WHITE)

quarters = [
    ("Q1", "Controls Audit",  GREEN,  True),
    ("Q2", "Risk Review",     BLUE,   True),
    ("Q3", "Vendor Check",    PURPLE, True),
    ("Q4", "Full Compliance", CYAN,   False),
]
qw, qh = 3.4, 1.56
qy = 2.92
for i, (q, label, col, done) in enumerate(quarters):
    qx = 0.4 + i * (qw + 0.27)
    rbox(qx, qy, qw, qh, fc=CARD, ec=col, lw=2.0, r=0.25)
    rbox(qx + 0.18, qy + qh - 0.52, 0.88, 0.42, fc=col, ec=col, lw=0, r=0.14)
    t(qx + 0.62, qy + qh - 0.31, q, sz=13, bold=True, c=BG)
    sc = GREEN if done else BLUE
    sl = "DONE" if done else "IN PROGRESS"
    rbox(qx + qw - 1.34, qy + qh - 0.52, 1.16, 0.42, fc=sc, ec=sc, lw=0, r=0.14, alpha=0.9)
    t(qx + qw - 0.76, qy + qh - 0.31, sl, sz=10, bold=True, c=BG)
    t(qx + qw/2, qy + 0.64, label, sz=13, c=col, bold=True)
    t(qx + qw/2, qy + 0.26, "[OK]" if done else "[ >> ]", sz=12,
      c=GREEN if done else BLUE)

hr(2.80)


# ══════════════════════════════════════════════════════════════
#  10. FOOTER  (no 'Built with Claude AI')
# ══════════════════════════════════════════════════════════════
rbox(0, 0, W, 2.66, fc="#080D17", r=0)
hr(2.66, x0=0, x1=W, c=BORDER, lw=0.8)

t(0.5, 2.10, "github.com/Jalendar10/GRC_System",
  sz=13, c=BLUE, ha="left", bold=True)
t(0.5, 1.66, "Open Source  |  MIT License  |  Pull Requests Welcome",
  sz=11, c=GREY, ha="left")

t(8, 1.16,
  "#GRC  #Compliance  #AI  #RegTech  #FinTech  #SOC2  #ISO27001  #OpenSource  #DevSecOps",
  sz=10.5, c=GREY)

t(15.5, 2.10, "FastAPI  +  React  +  AI", sz=11, c=GREY, ha="right")

t(8, 0.56,
  "Instead of waiting for the year-end audit — this system makes every quarter a clean audit.",
  sz=11, c=GREY)


# ── Save ──────────────────────────────────────────────────────
OUT = "/Users/jalendarreddy/Downloads/GRC/grc-platform/GRC_System_Infographic.png"
fig.savefig(OUT, dpi=DPI, bbox_inches="tight", facecolor=BG, edgecolor="none")
plt.close(fig)
print(f"Saved -> {OUT}")
