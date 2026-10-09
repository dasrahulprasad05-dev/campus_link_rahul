"""
CAMPUSLINK — Professional Widescreen 16:9 PowerPoint Presentation Generator
Generates a 7-slide pitch deck for BPUT Hackathon 2026 | PS10.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path="CAMPUSLINK_BPUT_Hackathon_2026.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # ---- Color Palette (CampusLink Dark Theme) ----
    COLOR_BG = RGBColor(15, 23, 42)          # Deep Slate #0F172A
    COLOR_CARD = RGBColor(30, 41, 59)        # Card Surface #1E293B
    COLOR_CARD_BORDER = RGBColor(51, 65, 85) # Border #334155
    COLOR_ACCENT = RGBColor(59, 130, 246)    # Electric Blue #3B82F6
    COLOR_CYAN = RGBColor(6, 182, 212)       # Cyan #06B6D4
    COLOR_GREEN = RGBColor(16, 185, 129)     # Emerald #10B981
    COLOR_AMBER = RGBColor(245, 158, 11)     # Amber #F59E0B
    COLOR_ROSE = RGBColor(244, 63, 94)       # Rose #F43F5E
    COLOR_WHITE = RGBColor(248, 250, 252)    # Slate 50 #F8FAFC
    COLOR_MUTED = RGBColor(148, 163, 184)    # Slate 400 #94A3B8
    COLOR_DARK = RGBColor(10, 15, 30)

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, title, eyebrow="CAMPUSLINK • BPUT HACKATHON 2026 | PS10"):
        # Eyebrow
        tx_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf = tx_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = eyebrow.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = COLOR_ACCENT

        # Title
        tx_box2 = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.7))
        tf2 = tx_box2.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = title
        p2.font.size = Pt(26)
        p2.font.bold = True
        p2.font.color.rgb = COLOR_WHITE

    def add_card(slide, left, top, width, height, fill_color=COLOR_CARD, border_color=COLOR_CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = fill_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1)
        else:
            card.line.fill.background()
        return card

    # ========================================================
    # SLIDE 1: Title & Vision
    # ========================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Decorative background card
    add_card(s1, Inches(0.8), Inches(0.8), Inches(11.733), Inches(5.9), COLOR_CARD, COLOR_CARD_BORDER)

    # Brand pill
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(1.3), Inches(3.2), Inches(0.45))
    pill.fill.solid()
    pill.fill.fore_color.rgb = COLOR_ACCENT
    pill.line.fill.background()
    p_pill = pill.text_frame.paragraphs[0]
    p_pill.text = "⚡ BPUT HACKATHON 2026 | PS10"
    p_pill.font.size = Pt(11)
    p_pill.font.bold = True
    p_pill.font.color.rgb = COLOR_WHITE
    p_pill.alignment = PP_ALIGN.CENTER

    # Main Title
    t_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.9), Inches(10.5), Inches(2.2))
    tf = t_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CAMPUSLINK"
    p.font.size = Pt(48)
    p.font.bold = True
    p.font.color.rgb = COLOR_WHITE

    p_sub = tf.add_paragraph()
    p_sub.text = "From Placement Management to Placement Intelligence"
    p_sub.font.size = Pt(22)
    p_sub.font.bold = True
    p_sub.font.color.rgb = COLOR_CYAN
    p_sub.space_before = Pt(8)

    p_tag = tf.add_paragraph()
    p_tag.text = "AI-Powered Campus-to-Corporate Placement Platform • One Platform. Five Stakeholders. Smarter Decisions."
    p_tag.font.size = Pt(14)
    p_tag.font.color.rgb = COLOR_MUTED
    p_tag.space_before = Pt(8)

    # 5 Stakeholder Badges
    roles = [
        ("🎓 Student", COLOR_ACCENT),
        ("🏛️ TPO / Admin", COLOR_CYAN),
        ("💼 Recruiter", COLOR_GREEN),
        ("🧑‍🏫 Mentor", COLOR_AMBER),
        ("🛡️ Super Admin", COLOR_ROSE),
    ]
    badge_w = Inches(2.05)
    for i, (role_name, role_color) in enumerate(roles):
        b = add_card(s1, Inches(1.3 + i * 2.15), Inches(4.5), badge_w, Inches(0.55), COLOR_DARK, role_color)
        pb = b.text_frame.paragraphs[0]
        pb.text = role_name
        pb.font.size = Pt(12)
        pb.font.bold = True
        pb.font.color.rgb = role_color
        pb.alignment = PP_ALIGN.CENTER

    # Footer Team Metadata
    f_box = s1.shapes.add_textbox(Inches(1.3), Inches(5.4), Inches(10.7), Inches(0.8))
    tff = f_box.text_frame
    pf = tff.paragraphs[0]
    pf.text = "Team: CAMPUSLINK Innovators  •  Enterprise AI Placement Architecture  •  Live at campuslink-rahul.vercel.app"
    pf.font.size = Pt(12)
    pf.font.color.rgb = COLOR_MUTED

    # ========================================================
    # SLIDE 2: The Problem
    # ========================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "The Problem: Placement Challenges Are Handled in Silos", "02 • THE PROBLEM STATEMENT")

    cards_data = [
        ("01", "READINESS GAP", "Students lack continuous, explainable feedback on role-specific requirements until after failing corporate interviews.", COLOR_ACCENT, "🎓"),
        ("02", "MATCHING GAP", "Recruiters drown in hundreds of unvetted, mismatched resumes with zero transparent, merit-aligned ranking.", COLOR_CYAN, "💼"),
        ("03", "COORDINATION GAP", "Concurrent multi-company drives create venue double-bookings, panel overlaps, and logistical delays.", COLOR_AMBER, "📅"),
        ("04", "VISIBILITY GAP", "Placement cells and faculty mentors lack early telemetry to identify and support at-risk students in time.", COLOR_ROSE, "📊"),
    ]

    card_w = Inches(2.75)
    card_h = Inches(3.6)
    for i, (num, title, desc, col, icon) in enumerate(cards_data):
        c = add_card(s2, Inches(0.8 + i * 2.98), Inches(1.8), card_w, card_h)
        tf = c.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.TOP

        p_num = tf.paragraphs[0]
        p_num.text = f"{icon}  {num}"
        p_num.font.size = Pt(20)
        p_num.font.bold = True
        p_num.font.color.rgb = col

        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.size = Pt(15)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_WHITE
        p_title.space_before = Pt(8)

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(12)
        p_desc.font.color.rgb = COLOR_MUTED
        p_desc.space_before = Pt(10)

    # Bottom Insight Callout
    bot = add_card(s2, Inches(0.8), Inches(5.7), Inches(11.733), Inches(0.9), COLOR_DARK, COLOR_ACCENT)
    btf = bot.text_frame
    btf.word_wrap = True
    bp = btf.paragraphs[0]
    bp.text = "💡 OUR CORE INSIGHT: Placement systems should help people decide what to do next — not just record what happened."
    bp.font.size = Pt(13)
    bp.font.bold = True
    bp.font.color.rgb = COLOR_CYAN
    bp.alignment = PP_ALIGN.CENTER

    bp2 = btf.add_paragraph()
    bp2.text = "Shift from Legacy: [ Record → Track ]  ➔  To CAMPUSLINK: [ Assess → Recommend → Coordinate → Monitor ]"
    bp2.font.size = Pt(11)
    bp2.font.color.rgb = COLOR_WHITE
    bp2.alignment = PP_ALIGN.CENTER
    bp2.space_before = Pt(4)

    # ========================================================
    # SLIDE 3: Our Solution
    # ========================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Our Solution: One Connected Placement Intelligence Platform", "03 • THE UNIFIED SOLUTION")

    # Left: Platform Centerpiece Card
    center_c = add_card(s3, Inches(0.8), Inches(1.8), Inches(5.8), Inches(4.8), COLOR_DARK, COLOR_ACCENT)
    ctf = center_c.text_frame
    ctf.word_wrap = True

    cp1 = ctf.paragraphs[0]
    cp1.text = "🏛️ TPO Placement Command Center"
    cp1.font.size = Pt(18)
    cp1.font.bold = True
    cp1.font.color.rgb = COLOR_WHITE

    cp2 = ctf.add_paragraph()
    cp2.text = "Single pane of glass unifying university recruitment operations with explainable AI models."
    cp2.font.size = Pt(12)
    cp2.font.color.rgb = COLOR_MUTED
    cp2.space_before = Pt(6)

    kpis = [
        ("20 Students", "Active Cohort", COLOR_ACCENT),
        ("8 Active Jobs", "Partner Roles", COLOR_GREEN),
        ("₹10.25L Avg CTC", "Audited Offers", COLOR_CYAN),
        ("0 Conflicts", "Conflict Engine", COLOR_AMBER),
    ]
    for k_val, k_sub, k_col in kpis:
        kp = ctf.add_paragraph()
        kp.text = f"• {k_val} — {k_sub}"
        kp.font.size = Pt(13)
        kp.font.bold = True
        kp.font.color.rgb = k_col
        kp.space_before = Pt(6)

    cp_note = ctf.add_paragraph()
    cp_note.text = "Integrated: Live Drive Scheduling • At-Risk Intervention Radar • Offer Lifecycle Tracking"
    cp_note.font.size = Pt(11)
    cp_note.font.color.rgb = COLOR_WHITE
    cp_note.space_before = Pt(14)

    # Right: 5 Role Workflows Stack
    role_boxes = [
        ("STUDENT PORTAL", "Readiness score (0-100) • Skill-gap analysis • Adaptive mock interview • What-if twin", COLOR_ACCENT),
        ("RECRUITER PORTAL", "Candidate ranking • Bias-free evaluation • Multi-stage Kanban pipeline • Offer dispatch", COLOR_GREEN),
        ("TPO / ADMIN PORTAL", "Institutional macro analytics • Conflict-aware drive scheduler • Joining verification", COLOR_CYAN),
        ("FACULTY MENTOR PORTAL", "Assigned mentee tracking • Early-warning risk triggers • 1-click clinical counseling", COLOR_AMBER),
        ("SUPER ADMIN PORTAL", "Staff verification security • Institutional governance • Immutable system audit log", COLOR_ROSE),
    ]
    box_h = Inches(0.88)
    for i, (r_title, r_desc, r_col) in enumerate(role_boxes):
        rc = add_card(s3, Inches(6.8), Inches(1.8 + i * 0.98), Inches(5.733), box_h, COLOR_CARD, r_col)
        rtf = rc.text_frame
        rtf.word_wrap = True
        rp1 = rtf.paragraphs[0]
        rp1.text = r_title
        rp1.font.size = Pt(12)
        rp1.font.bold = True
        rp1.font.color.rgb = r_col
        rp2 = rtf.add_paragraph()
        rp2.text = r_desc
        rp2.font.size = Pt(10.5)
        rp2.font.color.rgb = COLOR_WHITE
        rp2.space_before = Pt(2)

    # ========================================================
    # SLIDE 4: Innovation and Unique Features
    # ========================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Our Differentiator: From Prediction to Action", "04 • INNOVATION & DIFFERENTIATION")

    # 5 Horizontal Process Steps
    steps = [
        ("01 PREDICT", "NumPy Ridge ML estimates readiness (0-100) with confidence intervals.", COLOR_ACCENT),
        ("02 EXPLAIN", "256-dim NLP embeddings extract matched vs missing skills across 60+ synonyms.", COLOR_CYAN),
        ("03 SIMULATE", "Interactive What-If Twin projects score delta & unlocks corporate roles.", COLOR_GREEN),
        ("04 INTERVENE", "1-Click mentor check-ins & STAR mock interview feedback rubrics.", COLOR_AMBER),
        ("05 MONITOR", "Mathematical scheduler eliminates venue overlaps across concurrent drives.", COLOR_ROSE),
    ]
    step_w = Inches(2.26)
    for i, (stitle, sdesc, scol) in enumerate(steps):
        sc = add_card(s4, Inches(0.8 + i * 2.37), Inches(1.8), step_w, Inches(1.8), COLOR_CARD, scol)
        stf = sc.text_frame
        stf.word_wrap = True
        sp1 = stf.paragraphs[0]
        sp1.text = stitle
        sp1.font.size = Pt(13)
        sp1.font.bold = True
        sp1.font.color.rgb = scol
        sp2 = stf.add_paragraph()
        sp2.text = sdesc
        sp2.font.size = Pt(10.5)
        sp2.font.color.rgb = COLOR_WHITE
        sp2.space_before = Pt(6)

    # Lower Two Showcase Cards
    # Left Card: What-If Simulator
    w_card = add_card(s4, Inches(0.8), Inches(3.85), Inches(5.75), Inches(2.75), COLOR_DARK, COLOR_GREEN)
    wtf = w_card.text_frame
    wtf.word_wrap = True
    wp1 = wtf.paragraphs[0]
    wp1.text = "🔮 Feature Highlight: Placement What-If Simulator"
    wp1.font.size = Pt(15)
    wp1.font.bold = True
    wp1.font.color.rgb = COLOR_GREEN

    wp2 = wtf.add_paragraph()
    wp2.text = "• Interactive Digital Twin: Students tweak hypothetical CGPA, DSA, Cloud, or Project milestones."
    wp2.font.size = Pt(11.5)
    wp2.font.color.rgb = COLOR_WHITE
    wp2.space_before = Pt(6)

    wp3 = wtf.add_paragraph()
    wp3.text = "• Instant Score Simulation: Displays estimated readiness jump (e.g., 62% ➔ 84%) in real time."
    wp3.font.size = Pt(11.5)
    wp3.font.color.rgb = COLOR_CYAN
    wp3.space_before = Pt(4)

    wp4 = wtf.add_paragraph()
    wp4.text = "• Unlocked Opportunity Radar: Reveals specific corporate jobs that become unlocked."
    wp4.font.size = Pt(11.5)
    wp4.font.color.rgb = COLOR_MUTED
    wp4.space_before = Pt(4)

    wp5 = wtf.add_paragraph()
    wp5.text = "*(Note: directional learning estimates, not deterministic placement guarantees)*"
    wp5.font.size = Pt(9.5)
    wp5.font.color.rgb = COLOR_AMBER
    wp5.space_before = Pt(6)

    # Right Card: Recruiter Explainable Ranking
    r_card = add_card(s4, Inches(6.78), Inches(3.85), Inches(5.75), Inches(2.75), COLOR_DARK, COLOR_CYAN)
    rtf = r_card.text_frame
    rtf.word_wrap = True
    rp1 = rtf.paragraphs[0]
    rp1.text = "⚖️ Feature Highlight: Fairness-Guarded Candidate Ranking"
    rp1.font.size = Pt(15)
    rp1.font.bold = True
    rp1.font.color.rgb = COLOR_CYAN

    rp2 = rtf.add_paragraph()
    rp2.text = "• 100% Explainable Attribution: Skill match (40%), Readiness (30%), Academics (20%), Project evidence (10%)."
    rp2.font.size = Pt(11.5)
    rp2.font.color.rgb = COLOR_WHITE
    rp2.space_before = Pt(6)

    rp3 = rtf.add_paragraph()
    rp3.text = "• Demographically Blind: Excludes photos, names, gender, and socioeconomic proxies."
    rp3.font.size = Pt(11.5)
    rp3.font.color.rgb = COLOR_GREEN
    rp3.space_before = Pt(4)

    rp4 = rtf.add_paragraph()
    rp4.text = "• Zero Black-Box Decisions: Recruiters inspect exact matched skills and verified evidence drawers."
    rp4.font.size = Pt(11.5)
    rp4.font.color.rgb = COLOR_MUTED
    rp4.space_before = Pt(4)

    # ========================================================
    # SLIDE 5: Technical Architecture
    # ========================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Technical Architecture: Clean Monorepo Microservices", "05 • ENGINEERING EXCELLENCE")

    arch_boxes = [
        ("FRONTEND SPA", "HTML5 • Vanilla CSS • ES6+ JS\n\n• Zero framework bloat\n• Sub-50ms instant load\n• Dark glassmorphic design\n• Role-based router guards", COLOR_ACCENT),
        ("API GATEWAY", "Node.js 20 • Express.js REST\n\n• JWT Bearer Authentication\n• Strict RBAC authorizer\n• Automated DB migrations\n• Fault-tolerant AI proxy", COLOR_CYAN),
        ("POSTGRESQL DB", "PostgreSQL 15 Relational Schema\n\n• 15 Production relational tables\n• UUID PKs, JSONB factors\n• Relational integrity constraints\n• Dual-mode memory fallback", COLOR_GREEN),
        ("AI / ML SERVICE", "Python 3.11 • FastAPI Microservice\n\n• Pure NumPy ML (Ridge/Logistic)\n• <1s training, 0 MB GPU bloat\n• Custom BM25 RAG on bylaws\n• Groq LLM STAR coach", COLOR_AMBER),
    ]

    ab_w = Inches(2.75)
    for i, (atitle, adesc, acol) in enumerate(arch_boxes):
        ac = add_card(s5, Inches(0.8 + i * 2.98), Inches(1.8), ab_w, Inches(3.7), COLOR_CARD, acol)
        atf = ac.text_frame
        atf.word_wrap = True
        ap1 = atf.paragraphs[0]
        ap1.text = atitle
        ap1.font.size = Pt(14)
        ap1.font.bold = True
        ap1.font.color.rgb = acol

        ap2 = atf.add_paragraph()
        ap2.text = adesc
        ap2.font.size = Pt(11)
        ap2.font.color.rgb = COLOR_WHITE
        ap2.space_before = Pt(8)

    # Architecture Bottom Badges
    bcard = add_card(s5, Inches(0.8), Inches(5.8), Inches(11.733), Inches(0.8), COLOR_DARK, COLOR_CARD_BORDER)
    btf = bcard.text_frame
    btf.word_wrap = True
    bp = btf.paragraphs[0]
    bp.text = "✅ 38 / 38 Automated Test Suites Passing (100% Coverage)  •  Render (API + AI)  •  Vercel (Edge SPA)  •  SendGrid (Email Auth)"
    bp.font.size = Pt(12)
    bp.font.bold = True
    bp.font.color.rgb = COLOR_WHITE
    bp.alignment = PP_ALIGN.CENTER

    # ========================================================
    # SLIDE 6: Progress, Impact & Grand Finale Plan
    # ========================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Progress, Impact & Grand Finale Commitments", "06 • EXECUTION & ROADMAP")

    # Left: Current Progress Card
    p_card = add_card(s6, Inches(0.8), Inches(1.8), Inches(5.75), Inches(3.7), COLOR_CARD, COLOR_GREEN)
    ptf = p_card.text_frame
    ptf.word_wrap = True
    pp1 = ptf.paragraphs[0]
    pp1.text = "🚀 Current Verified Implementation"
    pp1.font.size = Pt(16)
    pp1.font.bold = True
    pp1.font.color.rgb = COLOR_GREEN

    prog_points = [
        "• Frontend Portals: 13 Student, 8 TPO/Admin, 4 Recruiter, 3 Mentor, 2 Super Admin pages live.",
        "• Backend & Database: 13 REST route modules, 15 PostgreSQL tables, auto-migrations.",
        "• AI/ML Engines: 10/10 Intelligence features implemented & passing all integration tests.",
        "• Verification: 38/38 Automated test suites green (RBAC, DB, Auth, ML models).",
        "• Real Workflows: Drive scheduling, candidate matching, offer tracking, joining status.",
    ]
    for pt in prog_points:
        p_pt = ptf.add_paragraph()
        p_pt.text = pt
        p_pt.font.size = Pt(11.5)
        p_pt.font.color.rgb = COLOR_WHITE
        p_pt.space_before = Pt(6)

    # Right: Grand Finale Commitments Card
    f_card = add_card(s6, Inches(6.78), Inches(1.8), Inches(5.75), Inches(3.7), COLOR_CARD, COLOR_CYAN)
    ftf = f_card.text_frame
    ftf.word_wrap = True
    fp1 = ftf.paragraphs[0]
    fp1.text = "🎯 Grand Finale Commitments"
    fp1.font.size = Pt(16)
    fp1.font.bold = True
    fp1.font.color.rgb = COLOR_CYAN

    fin_points = [
        "01. Readiness Scoring & Skill-Gap: Cohort-level validation across multiple target roles.",
        "02. Recruiter Matching: Simulated shortlisting across 3 concurrent corporate hiring drives.",
        "03. Conflict-Free Scheduling: Multi-hall scheduling and corporate joining verification.",
        "04. End-to-End Live Workflow: Full lifecycle demonstration with verified test evidence.",
        "05. Voice AI Interview Drill: Speech pace, articulation, and multimodal evaluation.",
    ]
    for pt in fin_points:
        f_pt = ftf.add_paragraph()
        f_pt.text = pt
        f_pt.font.size = Pt(11.5)
        f_pt.font.color.rgb = COLOR_WHITE
        f_pt.space_before = Pt(6)

    # Bottom Tagline Bar
    end_bar = add_card(s6, Inches(0.8), Inches(5.8), Inches(11.733), Inches(0.8), COLOR_DARK, COLOR_ACCENT)
    etf = end_bar.text_frame
    etf.word_wrap = True
    ep = etf.paragraphs[0]
    ep.text = "CAMPUSLINK  •  Connect Talent. Explain Readiness. Improve Decisions."
    ep.font.size = Pt(14)
    ep.font.bold = True
    ep.font.color.rgb = COLOR_CYAN
    ep.alignment = PP_ALIGN.CENTER

    # ========================================================
    # SLIDE 7: Thank You & Q&A
    # ========================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)

    t_card = add_card(s7, Inches(1.8), Inches(1.2), Inches(9.733), Inches(5.1), COLOR_CARD, COLOR_ACCENT)
    ttf = t_card.text_frame
    ttf.word_wrap = True

    tp1 = ttf.paragraphs[0]
    tp1.text = "THANK YOU!"
    tp1.font.size = Pt(44)
    tp1.font.bold = True
    tp1.font.color.rgb = COLOR_WHITE
    tp1.alignment = PP_ALIGN.CENTER

    tp2 = ttf.add_paragraph()
    tp2.text = "CAMPUSLINK — Enterprise AI Placement Intelligence Platform"
    tp2.font.size = Pt(20)
    tp2.font.bold = True
    tp2.font.color.rgb = COLOR_CYAN
    tp2.alignment = PP_ALIGN.CENTER
    tp2.space_before = Pt(10)

    tp3 = ttf.add_paragraph()
    tp3.text = "🌐 Live Application: https://campuslink-rahul.vercel.app\n💻 GitHub: https://github.com/dasrahulprasad05-dev/campus_link_rahul\n\nWe are now open for your Questions & Live Demonstration!"
    tp3.font.size = Pt(14)
    tp3.font.color.rgb = COLOR_MUTED
    tp3.alignment = PP_ALIGN.CENTER
    tp3.space_before = Pt(16)

    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
