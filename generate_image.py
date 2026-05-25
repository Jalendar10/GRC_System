"""
GRC Engineering Platform — LinkedIn Infographic (v3, clean redesign)
Output: GRC_System_Infographic.png  (1400 x 1800 px @ 150 DPI, portrait)
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np

# ── Canvas ──────────────────────────────────────────────────────────────────
W, H = 14, 18          # inches  (portrait)
DPI  = 150
fig  = plt.figure(figsize=(W, H), facecolor="#0D1117")
ax   = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, W)
ax.set_ylim(0, H)
ax.axis("off")

# ── Palette ──────────────────────────────────────────────────────────────────
BG       = "#0D1117"
CARD_BG  = "#161B22"
CARD2    = "#1C2330"
ACCENT   = "#58A6FF"
GREEN    = "#3FB950"
AMBER    = "#D29922"
RED      = "#F85149"
PURPLE   = "#BC8CFF"
CYAN     = "#39D0D8"
WHITE    = "#F0F6FC"
GREY     = "#8B949E"
DIVIDER  = "#30363D"
TEAL     = "#00B4D8"

def box(ax, x, y, w, h, color=CARD_BG, radius=0.18, lw=0, edge=None, alpha=1.0):
    ec = edge if edge else color
    lw_ = lw if edge else 0
    p = FancyBboxPatch((x, y), w, h,
                        boxstyle=f"round,pad=0,rounding_size={radius}",
                        facecolor=color, edgecolor=ec, linewidth=lw_, alpha=alpha,
                        zorder=2)
    ax.add_patch(p)
    return p

def txt(ax, x, y, s, size=11, color=WHITE, ha="center", va="center",
        bold=False, alpha=1.0):
    weight = "bold" if bold else "normal"
    ax.text(x, y, s, fontsize=size, color=color, ha=ha, va=va,
            fontweight=weight, alpha=alpha, zorder=5,
            fontfamily="DejaVu Sans")

def hline(ax, y, x0=0.3, x1=13.7, color=DIVIDER, lw=0.8):
    ax.plot([x0, x1], [y, y], color=color, linewidth=lw,
            solid_capstyle="round", zorder=3)


# ═══════════════════════════════════════════════════════════════════════════
# 1  HEADER
# ═══════════════════════════════════════════════════════════════════════════
box(ax, 0, 16.9, W, 1.1, color="#161B22", radius=0)

circle = plt.Circle((0.9, 17.45), 0.34, color=ACCENT, zorder=5)
ax.add_patch(circle)
txt(ax, 0.9, 17.45, "GRC", size=8.5, color=BG, bold=True)

txt(ax, 7, 17.53, "GRC Engineering Platform", size=22, bold=True, color=WHITE)
txt(ax, 7, 17.10, "Automated Governance, Risk & Compliance  |  Powered by AI", size=11, color=GREY)

box(ax, 10.5, 17.2, 1.65, 0.44, color=GREEN, radius=0.12)
txt(ax, 11.32, 17.42, "Always Audit-Ready", size=8.5, color=BG, bold=True)
box(ax, 12.25, 17.2, 1.52, 0.44, color=AMBER, radius=0.12)
txt(ax, 13.01, 17.42, "Zero Surprise Fines", size=8.5, color=BG, bold=True)


# ═══════════════════════════════════════════════════════════════════════════
# 2  PROBLEM vs SOLUTION
# ═══════════════════════════════════════════════════════════════════════════
txt(ax, 7, 16.68, "THE CHALLENGE  &  THE SOLUTION", size=10.5, color=GREY, bold=True)

# Problem
box(ax, 0.3, 14.62, 6.3, 1.82, color="#2D1118", radius=0.22, edge=RED, lw=1.5)
txt(ax, 3.45, 16.23, "OLD WAY  — Annual Audit Trap", size=12, bold=True, color=RED)
probs = [
    "[X]  Wait 12 months, then panic for 3 weeks",
    "[X]  Gaps discovered at the worst moment",
    "[X]  Manual evidence across 5 spreadsheets",
    "[X]  Fines, remediations, reputational damage",
]
for i, p in enumerate(probs):
    txt(ax, 3.45, 15.85 - i * 0.32, p, size=9.5, color="#FFB3B3")

# Solution
box(ax, 7.4, 14.62, 6.3, 1.82, color="#0E2318", radius=0.22, edge=GREEN, lw=1.5)
txt(ax, 10.55, 16.23, "NEW WAY  — Continuous Compliance", size=12, bold=True, color=GREEN)
sols = [
    "[OK]  Automated audit every quarter — no trigger needed",
    "[OK]  AI flags risks before they become violations",
    "[OK]  Evidence auto-collected, always current",
    "[OK]  Always ready, zero fines, zero scramble",
]
for i, s in enumerate(sols):
    txt(ax, 10.55, 15.85 - i * 0.32, s, size=9.5, color="#9BE9A8")

hline(ax, 14.54)


# ═══════════════════════════════════════════════════════════════════════════
# 3  KEY STATS
# ═══════════════════════════════════════════════════════════════════════════
stats = [
    ("25+",      "Compliance\nFrameworks",  ACCENT),
    ("4x / yr",  "Automated\nAudit Cycles", GREEN),
    ("< 60 sec", "Per Audit\nCycle",        PURPLE),
    ("6",        "AI Providers\nSupported",  AMBER),
]
sw = 3.0
for i, (val, label, col) in enumerate(stats):
    sx = 0.3 + i * (sw + 0.23)
    box(ax, sx, 13.30, sw, 1.06, color=CARD_BG, radius=0.2, edge=col, lw=1.2)
    txt(ax, sx + sw / 2, 13.74, val,   size=19, bold=True, color=col)
    txt(ax, sx + sw / 2, 13.42, label, size=8.8, color=GREY)

hline(ax, 13.22)


# ═══════════════════════════════════════════════════════════════════════════
# 4  FLOW DIAGRAM
# ═══════════════════════════════════════════════════════════════════════════
txt(ax, 7, 13.05, "HOW IT WORKS  —  Automated Quarterly Compliance Loop",
    size=12, bold=True, color=WHITE)

nodes = [
    ("CONTROLS\nRegistry",    "#1B3A3A", CYAN),
    ("RISK\nRegister",        "#1B2A4B", ACCENT),
    ("AI\nEngine",            "#2D1F4B", PURPLE),
    ("AUTO\nAudit Run",       "#1B3340", TEAL),
    ("COMPLIANCE\nDashboard", "#1B3B2A", GREEN),
    ("ALERTS &\nNotifs",      "#3B2A00", AMBER),
    ("AUDIT\nREADY",          "#163016", GREEN),
]

nw, nh = 1.56, 1.06
ng = 0.20
total_w = len(nodes) * nw + (len(nodes) - 1) * ng
sx0 = (W - total_w) / 2
ny0 = 11.84

for i, (label, bg, col) in enumerate(nodes):
    nx = sx0 + i * (nw + ng)
    box(ax, nx, ny0, nw, nh, color=bg, radius=0.16, edge=col, lw=1.5)
    txt(ax, nx + nw / 2, ny0 + nh / 2, label, size=8.5, bold=True, color=col)
    if i < len(nodes) - 1:
        ax1 = nx + nw + 0.02
        ax2 = nx + nw + ng - 0.02
        ay  = ny0 + nh / 2
        ax.annotate("", xy=(ax2, ay), xytext=(ax1, ay),
                    arrowprops=dict(arrowstyle="-|>", color=GREY, lw=1.4),
                    zorder=6)

# Feedback curved arrow
end_x   = sx0 + len(nodes) * nw + (len(nodes) - 1) * ng - 0.08
start_x2 = sx0 + nw / 2
fb_y = ny0 - 0.06
ax.annotate("", xy=(start_x2, fb_y), xytext=(end_x, fb_y),
            arrowprops=dict(arrowstyle="-|>", color=AMBER, lw=2.0,
                            connectionstyle="arc3,rad=0.4"),
            zorder=6)
txt(ax, 7, 11.3,
    "Repeats automatically every quarter  -->  Zero manual effort  -->  Always Audit-Ready",
    size=9, color=AMBER)

hline(ax, 11.12)


# ═══════════════════════════════════════════════════════════════════════════
# 5  QUARTERLY TIMELINE  +  GAUGE
# ═══════════════════════════════════════════════════════════════════════════
txt(ax, 7, 10.96, "AUTOMATED QUARTERLY AUDIT TIMELINE", size=12, bold=True, color=WHITE)

# Gauge (left side)
gcx, gcy, gr = 2.2, 9.55, 0.9

# BG arc
for t in np.linspace(np.pi, 0, 300):
    ax.plot([gcx + gr * np.cos(t)], [gcy + gr * np.sin(t)],
            '.', color=DIVIDER, markersize=2.5, zorder=3)
# Filled arc (83%)
for t in np.linspace(np.pi, np.pi - 0.83 * np.pi, 300):
    ax.plot([gcx + gr * np.cos(t)], [gcy + gr * np.sin(t)],
            '.', color=GREEN, markersize=3.2, zorder=4)
# Needle
ang = np.pi - 0.83 * np.pi
ax.annotate("",
            xy=(gcx + (gr - 0.08) * np.cos(ang), gcy + (gr - 0.08) * np.sin(ang)),
            xytext=(gcx, gcy),
            arrowprops=dict(arrowstyle="-|>", color=WHITE, lw=2.2),
            zorder=7)
ax.add_patch(plt.Circle((gcx, gcy), 0.09, color=WHITE, zorder=8))

txt(ax, gcx, gcy - 0.18, "83%",               size=20, bold=True, color=GREEN)
txt(ax, gcx, gcy - 0.52, "Avg Compliance",    size=8.5, color=GREY)
txt(ax, gcx, gcy - 0.75, "Score",             size=8.5, color=GREY)

# Quarter cards
quarters = [
    ("Q1", "Controls\nAudit",   GREEN,  True),
    ("Q2", "Risk\nReview",      ACCENT, True),
    ("Q3", "Vendor\nCheck",     PURPLE, True),
    ("Q4", "Full Year\nAudit",  AMBER,  False),
]
qw, qh = 1.92, 1.65
qx0 = 4.1
for i, (q, label, col, done) in enumerate(quarters):
    qx = qx0 + i * (qw + 0.27)
    qy = 8.85
    box(ax, qx, qy, qw, qh, color=CARD_BG, radius=0.18, edge=col, lw=1.5)
    # top badge row
    box(ax, qx + 0.14, qy + qh - 0.44, 0.76, 0.37, color=col, radius=0.1)
    txt(ax, qx + 0.52, qy + qh - 0.26, q, size=9.5, bold=True, color=BG)
    status_col = GREEN if done else AMBER
    status_lbl = "DONE" if done else "LIVE"
    box(ax, qx + qw - 0.90, qy + qh - 0.44, 0.74, 0.37, color=status_col, radius=0.1)
    txt(ax, qx + qw - 0.53, qy + qh - 0.26, status_lbl, size=8, bold=True, color=BG)
    txt(ax, qx + qw / 2, qy + 0.70, label,  size=10, color=col, bold=True)
    sym = "[OK]" if done else "[ >> ]"
    txt(ax, qx + qw / 2, qy + 0.26, sym, size=9, color=GREEN if done else AMBER)

hline(ax, 8.74)


# ═══════════════════════════════════════════════════════════════════════════
# 6  PLATFORM MODULES (5 cards)
# ═══════════════════════════════════════════════════════════════════════════
txt(ax, 7, 8.57, "PLATFORM MODULES", size=12, bold=True, color=WHITE)

modules = [
    ("VENDOR RISK",   TEAL,   [
        "Tier 1/2/3 rating",
        "Risk questionnaires",
        "AI risk assessment",
        "SLA violation alerts",
    ]),
    ("INCIDENT MGMT", RED,    [
        "P0–P4 severity levels",
        "Automated workflow",
        "Full audit trail",
        "AI root-cause analysis",
    ]),
    ("POLICY ENGINE", PURPLE, [
        "25+ framework templates",
        "Gap analysis & heatmaps",
        "Acknowledgement tracking",
        "Version history",
    ]),
    ("AUTH & RBAC",   ACCENT, [
        "JWT Bearer tokens",
        "5 role layers",
        "Rate limiting per IP",
        "Full activity logs",
    ]),
    ("GRC-AS-CODE",   GREEN,  [
        "CI/CD pipeline ready",
        "Automated compliance",
        "Multi-AI providers",
        "REST API + Swagger",
    ]),
]

mw = (W - 0.6 - 4 * 0.22) / 5
mh = 3.25
my0 = 5.24
for i, (title, col, bullets) in enumerate(modules):
    mx = 0.3 + i * (mw + 0.22)
    box(ax, mx, my0, mw, mh, color=CARD_BG, radius=0.2, edge=col, lw=1.5)
    # title stripe
    ax.add_patch(FancyBboxPatch((mx, my0 + mh - 0.52), mw, 0.52,
                                boxstyle="round,pad=0,rounding_size=0.18",
                                facecolor=col, alpha=0.22, edgecolor="none", zorder=3))
    txt(ax, mx + mw / 2, my0 + mh - 0.26, title, size=9, bold=True, color=col)
    for j, b in enumerate(bullets):
        txt(ax, mx + 0.16, my0 + mh - 0.84 - j * 0.56,
            f">> {b}", size=8.2, color=WHITE, ha="left")

hline(ax, 5.16)


# ═══════════════════════════════════════════════════════════════════════════
# 7  FRAMEWORKS (2 rows)
# ═══════════════════════════════════════════════════════════════════════════
txt(ax, 7, 5.00, "SUPPORTED COMPLIANCE FRAMEWORKS", size=11, bold=True, color=WHITE)

row1 = ["SOC 2","ISO 27001","HIPAA","PCI-DSS","GDPR","NIST CSF",
        "FedRAMP","CCPA","SOX","CIS Controls","CMMC","COBIT"]
row2 = ["ISO 31000","DORA","NIS2","SWIFT","HITRUST","FISMA",
        "NERC CIP","ISO 22301","GLBA","BSA/AML","BASEL III","COSO"]

def fw_row(ax, items, y):
    fw = (W - 0.6) / len(items) - 0.10
    for i, f in enumerate(items):
        fx = 0.3 + i * (fw + 0.10)
        box(ax, fx, y, fw, 0.37, color=CARD2, radius=0.10, edge=DIVIDER, lw=0.8)
        txt(ax, fx + fw / 2, y + 0.185, f, size=7.5, color=GREY)

fw_row(ax, row1, 4.54)
fw_row(ax, row2, 4.10)

hline(ax, 4.02)


# ═══════════════════════════════════════════════════════════════════════════
# 8  TECH STACK
# ═══════════════════════════════════════════════════════════════════════════
txt(ax, 7, 3.88, "TECH STACK", size=11, bold=True, color=WHITE)

stack = [
    ("FastAPI",       "#009688"), ("React 18",     "#61DAFB"),
    ("TypeScript",    "#3178C6"), ("Python 3.11",  "#FFD43B"),
    ("SQLAlchemy",    "#D32F2F"), ("SQLite / PG",  "#336791"),
    ("JWT Auth",      "#FB8C00"), ("Claude AI",    "#CC785C"),
    ("GPT-4",         "#74AA9C"), ("Docker",       "#2496ED"),
    ("Vite",          "#646CFF"), ("Tailwind CSS", "#06B6D4"),
]
tw = (W - 0.6 - 11 * 0.13) / 12
for i, (name, col) in enumerate(stack):
    tx = 0.3 + i * (tw + 0.13)
    box(ax, tx, 3.32, tw, 0.44, color=CARD_BG, radius=0.1, edge=col, lw=1.2)
    txt(ax, tx + tw / 2, 3.54, name, size=7.5, color=col, bold=True)

hline(ax, 3.26)


# ═══════════════════════════════════════════════════════════════════════════
# 9  VISION QUOTE
# ═══════════════════════════════════════════════════════════════════════════
box(ax, 0.3, 1.82, W - 0.6, 1.24, color=CARD2, radius=0.22, edge=ACCENT, lw=1.0)
txt(ax, 7, 2.98,
    '"Instead of scrambling once a year, companies run automated quarterly audits.',
    size=11, color=WHITE)
txt(ax, 7, 2.65,
    '  Every gap is caught early. Every control is evidence-backed. Zero surprise fines."',
    size=11, color=WHITE)
txt(ax, 7, 2.26,
    "  GRC Engineering Platform  |  POC built to become production-ready RegTech",
    size=9.5, color=GREY)


# ═══════════════════════════════════════════════════════════════════════════
# 10  FOOTER
# ═══════════════════════════════════════════════════════════════════════════
box(ax, 0, 0, W, 1.72, color="#080D17", radius=0)
hline(ax, 1.72, x0=0, x1=W, color=DIVIDER, lw=0.6)

txt(ax, 0.5, 1.22, "github.com/Jalendar10/GRC_System",
    size=10, color=ACCENT, ha="left", bold=True)
txt(ax, 0.5, 0.88, "Open Source  |  MIT License  |  Pull Requests Welcome",
    size=8.8, color=GREY, ha="left")

tags = ("#GRC  #Compliance  #AI  #RegTech  #FinTech  "
        "#SOC2  #ISO27001  #OpenSource  #DevSecOps  #AlwaysAuditReady")
txt(ax, 7, 0.45, tags, size=8, color=GREY)

txt(ax, 13.5, 1.22, "FastAPI  +  React  +  AI", size=8.8, color=GREY, ha="right")
txt(ax, 13.5, 0.88, "Built with Claude AI",     size=8.8, color=ACCENT, ha="right")


# ── SAVE ────────────────────────────────────────────────────────────────────
out = "/Users/jalendarreddy/Downloads/GRC/grc-platform/GRC_System_Infographic.png"
fig.savefig(out, dpi=DPI, bbox_inches="tight", facecolor=BG, edgecolor="none")
plt.close(fig)
print(f"Saved -> {out}")
