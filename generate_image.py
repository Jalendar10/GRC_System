"""
GRC Engineering Platform — LinkedIn Infographic  (v4 — CLEAN REBUILD)
Canvas: 16 x 22 inches @ 150 DPI = 2400 x 3300 px
Rule: minimum 14 pt body text, 5–6 sections only, lots of breathing room.
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import matplotlib.patches as mpatches
import numpy as np

# ── Canvas setup ─────────────────────────────────────────────────────────────
W, H = 16, 22
DPI  = 150
fig  = plt.figure(figsize=(W, H), facecolor="#0D1117")
ax   = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, W)
ax.set_ylim(0, H)
ax.axis("off")

# ── Color palette ─────────────────────────────────────────────────────────────
BG      = "#0D1117"
CARD    = "#161B22"
CARD2   = "#21262D"
BLUE    = "#58A6FF"
GREEN   = "#3FB950"
AMBER   = "#D29922"
RED     = "#F85149"
PURPLE  = "#BC8CFF"
CYAN    = "#39D0D8"
WHITE   = "#F0F6FC"
GREY    = "#8B949E"
BORDER  = "#30363D"
TEAL    = "#2DD4BF"

# ── Helper: rounded rectangle ────────────────────────────────────────────────
def rbox(x, y, w, h, fc=CARD, ec=None, lw=0, r=0.25, alpha=1.0, zorder=2):
    ec = ec or fc
    lw_ = lw if ec != fc else 0
    p = FancyBboxPatch((x, y), w, h,
                       boxstyle=f"round,pad=0,rounding_size={r}",
                       facecolor=fc, edgecolor=ec, linewidth=lw_,
                       alpha=alpha, zorder=zorder)
    ax.add_patch(p)

# ── Helper: text ─────────────────────────────────────────────────────────────
def t(x, y, s, sz=14, c=WHITE, ha="center", va="center",
      bold=False, alpha=1.0, zorder=6):
    ax.text(x, y, s, fontsize=sz, color=c, ha=ha, va=va,
            fontweight="bold" if bold else "normal",
            alpha=alpha, zorder=zorder, fontfamily="DejaVu Sans")

# ── Helper: horizontal rule ──────────────────────────────────────────────────
def hr(y, x0=0.4, x1=15.6, c=BORDER, lw=1.0):
    ax.plot([x0, x1], [y, y], color=c, lw=lw, solid_capstyle="round", zorder=3)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 1 — HEADER                                            ║
# ╚══════════════════════════════════════════════════════════════════╝
rbox(0, 20.6, W, 1.4, fc="#161B22", r=0)

# shield circle
ax.add_patch(plt.Circle((1.1, 21.3), 0.42, color=BLUE, zorder=5))
t(1.1, 21.3, "GRC", sz=11, c=BG, bold=True)

t(8,   21.52, "GRC Engineering Platform",                        sz=26, bold=True,  c=WHITE)
t(8,   21.05, "Automated Governance, Risk & Compliance  |  Powered by AI",  sz=13,  c=GREY)

# right badges
rbox(11.8, 21.1, 2.0, 0.55, fc=GREEN,  ec=GREEN,  r=0.15)
t(12.8, 21.38, "Always Audit-Ready",   sz=11, c=BG, bold=True)
rbox(13.9, 21.1, 1.95, 0.55, fc=AMBER, ec=AMBER,  r=0.15)
t(14.88, 21.38, "Zero Surprise Fines", sz=11, c=BG, bold=True)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 2 — PROBLEM vs SOLUTION                               ║
# ╚══════════════════════════════════════════════════════════════════╝
t(8, 20.32, "THE CHALLENGE  &  THE SOLUTION", sz=13, c=GREY, bold=True)

# -- Problem card --
rbox(0.4, 17.8, 7.3, 2.3, fc="#2D1118", ec=RED, lw=2.0, r=0.3)
t(4.05, 19.83, "OLD WAY  — Annual Audit Trap", sz=15, bold=True, c=RED)

probs = [
    "[X]  Wait 12 months — then panic for weeks",
    "[X]  Compliance gaps found at the worst moment",
    "[X]  Manual evidence from 5 different spreadsheets",
    "[X]  Fines, remediations, reputational damage",
]
for i, p in enumerate(probs):
    t(4.05, 19.40 - i * 0.44, p, sz=12.5, c="#FFB3B3")

# -- Solution card --
rbox(8.3,  17.8, 7.3, 2.3, fc="#0E2318", ec=GREEN, lw=2.0, r=0.3)
t(11.95, 19.83, "NEW WAY  — Continuous Compliance", sz=15, bold=True, c=GREEN)

sols = [
    "[OK]  Automated audit every quarter — zero manual work",
    "[OK]  AI flags every risk before it becomes a violation",
    "[OK]  Evidence auto-collected and always current",
    "[OK]  Always ready for auditors — zero surprise fines",
]
for i, s in enumerate(sols):
    t(11.95, 19.40 - i * 0.44, s, sz=12.5, c="#9BE9A8")

hr(17.70)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 3 — KEY STATS (4 big numbers)                        ║
# ╚══════════════════════════════════════════════════════════════════╝
stats = [
    ("25+",       "Compliance\nFrameworks",  BLUE),
    ("4× / yr",   "Automated\nAudit Cycles", GREEN),
    ("< 60 sec",  "Per Audit\nCycle",        PURPLE),
    ("6",         "AI Providers\nSupported", AMBER),
]
sw, sh = 3.5, 1.7
for i, (val, lbl, col) in enumerate(stats):
    sx = 0.4 + i * (sw + 0.27)
    rbox(sx, 15.8, sw, sh, fc=CARD, ec=col, lw=2.0, r=0.28)
    t(sx + sw/2, 16.92, val, sz=26, bold=True, c=col)
    t(sx + sw/2, 16.42, lbl, sz=12, c=GREY)

hr(15.70)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 4 — HOW IT WORKS  (flow diagram)                     ║
# ╚══════════════════════════════════════════════════════════════════╝
t(8, 15.48, "HOW IT WORKS  — Automated Quarterly Compliance Loop",
  sz=15, bold=True, c=WHITE)

nodes = [
    ("CONTROLS\nRegistry",     "#1B3A3A", CYAN),
    ("RISK\nRegister",         "#1B2550", BLUE),
    ("AI\nEngine",             "#2D1F4B", PURPLE),
    ("AUTO\nAudit Run",        "#1B3340", TEAL),
    ("COMPLIANCE\nDashboard",  "#1B3B2A", GREEN),
    ("AUDIT\nREADY",           "#163016", GREEN),
]

nw, nh = 2.22, 1.4
ng = 0.30
total = len(nodes) * nw + (len(nodes) - 1) * ng
sx0 = (W - total) / 2
ny0 = 13.9

for i, (label, bg, col) in enumerate(nodes):
    nx = sx0 + i * (nw + ng)
    rbox(nx, ny0, nw, nh, fc=bg, ec=col, lw=2.0, r=0.22)
    t(nx + nw/2, ny0 + nh/2, label, sz=13, bold=True, c=col)

    if i < len(nodes) - 1:
        ax.annotate("",
            xy=(sx0 + (i+1)*(nw+ng) - 0.03, ny0 + nh/2),
            xytext=(sx0 + i*(nw+ng) + nw + 0.03, ny0 + nh/2),
            arrowprops=dict(arrowstyle="-|>", color=GREY, lw=2.0),
            zorder=8)

# Feedback arc arrow
end_x   = sx0 + len(nodes) * (nw + ng) - ng - 0.05
start_x2 = sx0 + 0.05
arc_y   = ny0 - 0.08
ax.annotate("",
    xy=(start_x2, arc_y), xytext=(end_x, arc_y),
    arrowprops=dict(arrowstyle="-|>", color=AMBER, lw=2.5,
                    connectionstyle="arc3,rad=0.45"),
    zorder=8)

t(8, 13.44,
  "Repeats every quarter automatically  — always audit-ready, zero manual effort",
  sz=12.5, c=AMBER)

hr(13.20)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 5 — PLATFORM MODULES  (4 cards + 1 highlight)        ║
# ╚══════════════════════════════════════════════════════════════════╝
t(8, 13.02, "PLATFORM MODULES", sz=15, bold=True, c=WHITE)

modules = [
    ("VENDOR RISK",   TEAL,   [
        "Tier 1 / 2 / 3 ratings",
        "Risk questionnaires",
        "AI risk assessment",
        "SLA violation alerts",
    ]),
    ("INCIDENT MGMT", RED,    [
        "P0 – P4 severity levels",
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
    ("AUTH & RBAC",   BLUE,   [
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
    # top stripe
    ax.add_patch(FancyBboxPatch((mx, my0 + mh - 0.62), mw, 0.62,
                                boxstyle="round,pad=0,rounding_size=0.22",
                                facecolor=col, alpha=0.25, edgecolor="none", zorder=3))
    t(mx + mw/2, my0 + mh - 0.31, title, sz=12.5, bold=True, c=col)
    for j, b in enumerate(bullets):
        t(mx + 0.22, my0 + mh - 1.02 - j * 0.66,
          f">>  {b}", sz=12, c=WHITE, ha="left")

hr(9.18)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 6 — FRAMEWORKS  (2 clean rows)                       ║
# ╚══════════════════════════════════════════════════════════════════╝
t(8, 9.0, "SUPPORTED COMPLIANCE FRAMEWORKS", sz=14, bold=True, c=WHITE)

row1 = ["SOC 2", "ISO 27001", "HIPAA", "PCI-DSS", "GDPR",
        "NIST CSF", "FedRAMP", "CCPA", "SOX", "CMMC"]
row2 = ["CIS Controls", "COBIT", "ISO 31000", "DORA", "NIS2",
        "HITRUST", "FISMA", "NERC CIP", "BASEL III", "SWIFT"]

def fw_row(items, y):
    fw = (W - 0.8) / len(items) - 0.12
    for i, f in enumerate(items):
        fx = 0.4 + i * (fw + 0.12)
        rbox(fx, y, fw, 0.54, fc=CARD2, ec=BORDER, lw=1.0, r=0.14)
        t(fx + fw/2, y + 0.27, f, sz=11, c=GREY)

fw_row(row1, 8.35)
fw_row(row2, 7.70)

hr(7.55)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 7 — TECH STACK  (single row, bigger tags)            ║
# ╚══════════════════════════════════════════════════════════════════╝
t(8, 7.38, "TECH STACK", sz=14, bold=True, c=WHITE)

stack = [
    ("FastAPI",       "#009688"), ("React 18",   "#61DAFB"),
    ("TypeScript",    "#3178C6"), ("Python 3.11","#FFD43B"),
    ("SQLAlchemy",    "#D32F2F"), ("JWT Auth",   "#FB8C00"),
    ("Claude AI",     "#CC785C"), ("GPT-4",      "#74AA9C"),
    ("Docker",        "#2496ED"), ("Tailwind",   "#06B6D4"),
]
tw = (W - 0.8 - 9 * 0.18) / 10
for i, (name, col) in enumerate(stack):
    tx = 0.4 + i * (tw + 0.18)
    rbox(tx, 6.74, tw, 0.52, fc=CARD, ec=col, lw=1.8, r=0.14)
    t(tx + tw/2, 7.0, name, sz=11, c=col, bold=True)

hr(6.60)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 8 — VISION QUOTE                                     ║
# ╚══════════════════════════════════════════════════════════════════╝
rbox(0.4, 5.0, W - 0.8, 1.42, fc=CARD2, ec=BLUE, lw=1.5, r=0.3)

t(8, 6.23,
  '"Instead of scrambling once a year, companies run automated quarterly audits.',
  sz=13.5, c=WHITE)
t(8, 5.80,
  '  Every gap is caught early. Every control is evidence-backed. Zero surprise fines."',
  sz=13.5, c=WHITE)
t(8, 5.24,
  "GRC Engineering Platform  |  POC built to become production-ready RegTech",
  sz=11, c=GREY)

hr(4.88)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  SECTION 9 — QUARTERLY CYCLE VISUAL  (simple horizontal)      ║
# ╚══════════════════════════════════════════════════════════════════╝
t(8, 4.72, "AUTOMATED QUARTERLY AUDIT CYCLE", sz=14, bold=True, c=WHITE)

quarters = [
    ("Q1", "Controls Audit",   GREEN, True),
    ("Q2", "Risk Review",      BLUE,  True),
    ("Q3", "Vendor Check",     PURPLE,True),
    ("Q4", "Full Compliance",  AMBER, False),
]

qw, qh = 3.4, 1.55
qy = 2.9
for i, (q, label, col, done) in enumerate(quarters):
    qx = 0.4 + i * (qw + 0.27)
    rbox(qx, qy, qw, qh, fc=CARD, ec=col, lw=2.0, r=0.25)
    # quarter badge
    rbox(qx + 0.18, qy + qh - 0.52, 0.88, 0.42, fc=col, r=0.14)
    t(qx + 0.62, qy + qh - 0.31, q, sz=13, bold=True, c=BG)
    # status badge
    sc = GREEN if done else AMBER
    sl = "DONE" if done else "IN PROGRESS"
    rbox(qx + qw - 1.32, qy + qh - 0.52, 1.14, 0.42, fc=sc, r=0.14, alpha=0.9)
    t(qx + qw - 0.75, qy + qh - 0.31, sl, sz=10, bold=True, c=BG)
    # label
    t(qx + qw/2, qy + 0.62, label, sz=13, c=col, bold=True)
    sym = "[OK]" if done else "[ >> ]"
    t(qx + qw/2, qy + 0.26, sym, sz=12, c=GREEN if done else AMBER)

hr(2.78)


# ╔══════════════════════════════════════════════════════════════════╗
# ║  FOOTER                                                        ║
# ╚══════════════════════════════════════════════════════════════════╝
rbox(0, 0, W, 2.65, fc="#080D17", r=0)
hr(2.65, x0=0, x1=W, c=BORDER, lw=0.8)

t(0.5, 2.08, "github.com/Jalendar10/GRC_System",
  sz=13, c=BLUE, ha="left", bold=True)
t(0.5, 1.65, "Open Source  |  MIT License  |  Pull Requests Welcome",
  sz=11, c=GREY, ha="left")

tags = ("#GRC  #Compliance  #AI  #RegTech  #FinTech  "
        "#SOC2  #ISO27001  #OpenSource  #DevSecOps  #AlwaysAuditReady")
t(8, 1.15, tags, sz=10.5, c=GREY)

t(15.5, 2.08, "FastAPI + React + AI", sz=11, c=GREY,  ha="right")
t(15.5, 1.65, "Built with Claude AI", sz=11, c=BLUE,  ha="right")

t(8, 0.55,
  "Instead of waiting for the year-end audit — this system makes every quarter a clean audit.",
  sz=11, c=GREY)


# ── Save ──────────────────────────────────────────────────────────────────────
OUT = "/Users/jalendarreddy/Downloads/GRC/grc-platform/GRC_System_Infographic.png"
fig.savefig(OUT, dpi=DPI, bbox_inches="tight", facecolor=BG, edgecolor="none")
plt.close(fig)
print(f"Saved -> {OUT}")
