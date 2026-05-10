<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ShipFuel · Crew Nutrition Planner</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,600;0,700;1,400&family=Barlow:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg:        #070b12;
  --surf:      #0d1320;
  --surf2:     #131c2e;
  --surf3:     #1a2440;
  --border:    #1e2d45;
  --border2:   #263552;
  --amber:     #f59e0b;
  --amber2:    #fbbf24;
  --amber-dim: rgba(245,158,11,.12);
  --amber-glow:rgba(245,158,11,.25);
  --cyan:      #22d3ee;
  --cyan-dim:  rgba(34,211,238,.1);
  --green:     #10b981;
  --red:       #ef4444;
  --warn:      #f59e0b;
  --text:      #c8d8ec;
  --text2:     #7090b0;
  --text3:     #3d5470;
  --font-head: 'Chakra Petch', sans-serif;
  --font-body: 'Barlow', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ── GRID BACKGROUND ─────────────────────────────────────────── */
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(34,211,238,.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34,211,238,.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none; z-index: 0;
}

/* ── TOP BAR ─────────────────────────────────────────────────── */
.topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(7,11,18,.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  display: flex; align-items: center; gap: 20px;
  height: 56px;
}
.topbar-logo {
  font-family: var(--font-head);
  font-size: 18px; font-weight: 700;
  color: var(--amber);
  letter-spacing: 2px;
  white-space: nowrap;
}
.topbar-logo span { color: var(--text2); font-weight: 400; }

/* ── STEPPER ─────────────────────────────────────────────────── */
.stepper {
  display: flex; align-items: center; gap: 0;
  flex: 1; overflow: hidden;
}
.step-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: default;
  transition: all .2s;
  white-space: nowrap;
}
.step-num {
  width: 22px; height: 22px; border-radius: 50%;
  border: 1.5px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text3);
  transition: all .3s;
  flex-shrink: 0;
}
.step-label {
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--text3);
  transition: color .3s;
}
.step-connector {
  width: 24px; height: 1px;
  background: var(--border);
  flex-shrink: 0;
}
.step-item.active .step-num {
  border-color: var(--amber);
  background: var(--amber-dim);
  color: var(--amber);
}
.step-item.active .step-label { color: var(--amber2); }
.step-item.done .step-num {
  border-color: var(--green);
  background: rgba(16,185,129,.15);
  color: var(--green);
}
.step-item.done .step-label { color: var(--green); }

/* ── MAIN WRAPPER ────────────────────────────────────────────── */
.main { position: relative; z-index: 1; padding: 32px 24px 64px; max-width: 960px; margin: 0 auto; }

/* ── SECTION VISIBILITY ──────────────────────────────────────── */
.section { display: none; animation: fadeUp .35s ease both; }
.section.visible { display: block; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── SECTION HEADERS ─────────────────────────────────────────── */
.sec-header { margin-bottom: 28px; }
.sec-tag {
  font-family: var(--font-mono); font-size: 11px;
  color: var(--amber); letter-spacing: .15em;
  text-transform: uppercase; margin-bottom: 6px;
}
.sec-title {
  font-family: var(--font-head); font-size: 28px; font-weight: 700;
  color: #e8f0fa; line-height: 1.15;
}
.sec-sub { color: var(--text2); font-size: 14px; margin-top: 6px; }

/* ── SEARCH ──────────────────────────────────────────────────── */
.search-wrap { position: relative; margin-bottom: 20px; }
.search-wrap input {
  width: 100%;
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 8px; padding: 10px 16px 10px 40px;
  color: var(--text); font-family: var(--font-body); font-size: 14px;
  outline: none; transition: border-color .2s;
}
.search-wrap input:focus { border-color: var(--amber); }
.search-wrap input::placeholder { color: var(--text3); }
.search-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--text3); font-size: 14px; pointer-events: none;
}

/* ── JOB GRID ────────────────────────────────────────────────── */
.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  max-height: 520px; overflow-y: auto;
  padding-right: 4px;
}
.job-grid::-webkit-scrollbar { width: 4px; }
.job-grid::-webkit-scrollbar-track { background: var(--surf); }
.job-grid::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

.job-card {
  background: var(--surf);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all .2s;
  position: relative;
  overflow: hidden;
}
.job-card::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 3px; height: 100%;
  background: transparent;
  transition: background .2s;
}
.job-card:hover { border-color: var(--border2); background: var(--surf2); }
.job-card:hover::before { background: var(--amber-dim); }
.job-card.selected { border-color: var(--amber); background: var(--amber-dim); }
.job-card.selected::before { background: var(--amber); }

.job-name {
  font-family: var(--font-head); font-size: 14px; font-weight: 600;
  color: #e0eaf8; margin-bottom: 8px;
}
.job-stats { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.stat-pill {
  font-family: var(--font-mono); font-size: 10px;
  padding: 2px 8px; border-radius: 99px;
  border: 1px solid;
}
.calories-pill { border-color: var(--amber); color: var(--amber); background: var(--amber-dim); }
.activity-pill { border-color: var(--border2); color: var(--text2); }
.job-desc {
  font-size: 12px; color: var(--text2); line-height: 1.5;
}

/* ── MEAL TOGGLES ────────────────────────────────────────────── */
.meal-toggles { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
.meal-toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 10px; padding: 16px 20px;
  cursor: pointer; transition: border-color .2s;
}
.meal-toggle-row:hover { border-color: var(--border2); }
.meal-toggle-info { display: flex; align-items: center; gap: 14px; }
.meal-icon { font-size: 24px; }
.meal-name {
  font-family: var(--font-head); font-size: 16px; font-weight: 600;
  color: #e0eaf8;
}
.meal-time { font-size: 12px; color: var(--text2); }

.toggle-switch {
  width: 48px; height: 26px; border-radius: 13px;
  background: var(--surf3); border: 1px solid var(--border2);
  position: relative; cursor: pointer; transition: background .25s, border-color .25s;
  display: flex; align-items: center;
}
.toggle-switch.on { background: var(--amber); border-color: var(--amber); }
.toggle-knob {
  position: absolute; left: 3px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--text3);
  transition: all .25s;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: var(--bg);
}
.toggle-switch.on .toggle-knob { left: 25px; background: var(--bg); }

.meal-warn {
  display: none; padding: 10px 16px;
  background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3);
  border-radius: 8px; color: #fca5a5; font-size: 13px; margin-top: 8px;
}
.meal-warn.visible { display: block; }

/* ── MODE CARDS ──────────────────────────────────────────────── */
.mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
@media (max-width: 540px) { .mode-cards { grid-template-columns: 1fr; } }

.mode-card {
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 12px; padding: 24px;
  cursor: pointer; transition: all .25s;
  position: relative; overflow: hidden;
}
.mode-card::after {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 30% 30%, var(--amber-dim), transparent 70%);
  opacity: 0; transition: opacity .3s;
}
.mode-card:hover::after { opacity: 1; }
.mode-card:hover { border-color: var(--border2); }
.mode-card.selected { border-color: var(--amber); }
.mode-card.selected::after { opacity: 1; }

.mode-icon { font-size: 32px; margin-bottom: 12px; }
.mode-title {
  font-family: var(--font-head); font-size: 18px; font-weight: 700;
  color: #e8f0fa; margin-bottom: 6px;
}
.mode-desc { font-size: 13px; color: var(--text2); line-height: 1.5; }
.mode-badge {
  display: inline-block; margin-top: 12px;
  font-family: var(--font-mono); font-size: 10px;
  padding: 2px 8px; border-radius: 99px;
  border: 1px solid var(--cyan); color: var(--cyan);
  background: var(--cyan-dim);
}
.mode-card.selected .mode-badge { border-color: var(--amber); color: var(--amber); background: var(--amber-dim); }

/* ── RECIPE BROWSER ──────────────────────────────────────────── */
.country-filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
.country-btn {
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 6px; padding: 5px 12px;
  color: var(--text2); font-size: 12px; cursor: pointer; transition: all .15s;
}
.country-btn:hover { border-color: var(--border2); color: var(--text); }
.country-btn.active { border-color: var(--amber); color: var(--amber); background: var(--amber-dim); }

.meal-slot-label {
  font-family: var(--font-head); font-size: 12px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .1em;
  color: var(--amber); margin: 20px 0 10px;
}
.recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.recipe-card {
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 10px; padding: 14px;
  cursor: pointer; transition: all .2s;
  display: flex; gap: 10px; align-items: flex-start;
}
.recipe-card:hover { border-color: var(--border2); }
.recipe-card.selected { border-color: var(--amber); background: var(--amber-dim); }
.recipe-flag { font-size: 24px; line-height: 1; }
.recipe-name { font-size: 13px; font-weight: 600; color: #e0eaf8; }
.recipe-origin { font-size: 11px; color: var(--text2); margin-top: 2px; }
.recipe-adapt { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.adapt-tag {
  font-size: 10px; padding: 1px 6px; border-radius: 4px;
  background: var(--surf3); color: var(--text2); border: 1px solid var(--border2);
}

/* ── RESULTS ─────────────────────────────────────────────────── */
.result-hero {
  background: var(--surf2);
  border: 1px solid var(--border);
  border-radius: 14px; padding: 28px;
  margin-bottom: 24px;
  position: relative; overflow: hidden;
}
.result-hero::before {
  content: '';
  position: absolute; right: -60px; top: -60px;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, var(--amber-dim) 0%, transparent 70%);
}
.result-job {
  font-family: var(--font-mono); font-size: 11px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--amber); margin-bottom: 6px;
}
.result-headline {
  font-family: var(--font-head); font-size: 32px; font-weight: 700;
  color: #ecf4ff; line-height: 1.1; margin-bottom: 6px;
}
.result-sub { font-size: 13px; color: var(--text2); margin-bottom: 20px; }

.calorie-summary-strip {
  display: flex; flex-wrap: wrap; gap: 10px;
}
.csb-item {
  background: var(--surf3); border: 1px solid var(--border2);
  border-radius: 8px; padding: 10px 16px; min-width: 100px;
}
.csb-label { font-family: var(--font-mono); font-size: 10px; color: var(--text2); text-transform: uppercase; letter-spacing: .08em; }
.csb-value {
  font-family: var(--font-mono); font-size: 18px; font-weight: 500;
  color: var(--amber); margin-top: 2px;
}

/* ── MEAL RESULT CARDS ───────────────────────────────────────── */
.meals-output { display: flex; flex-direction: column; gap: 16px; }

.meal-result, .prep-result-card {
  background: var(--surf); border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden;
}
.meal-result-header, .prep-result-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 18px; border-bottom: 1px solid var(--border);
  background: var(--surf2);
}
.meal-time-badge {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  text-transform: uppercase; letter-spacing: .1em;
  padding: 3px 10px; border-radius: 99px;
}
.meal-time-badge.breakfast { background: rgba(251,191,36,.15); color: #fbbf24; border: 1px solid rgba(251,191,36,.3); }
.meal-time-badge.lunch     { background: rgba(34,211,238,.1);  color: var(--cyan); border: 1px solid rgba(34,211,238,.25); }
.meal-time-badge.dinner    { background: rgba(167,139,250,.1); color: #a78bfa; border: 1px solid rgba(167,139,250,.25); }

.meal-result-name { font-size: 14px; font-weight: 600; color: #e0eaf8; }
.prep-auto-label { font-family: var(--font-mono); font-size: 10px; color: var(--text3); }
.meal-calorie-target { font-family: var(--font-mono); font-size: 11px; color: var(--text2); margin-left: auto; }

.meal-result-body, .prep-body { padding: 16px 18px; }

.ingredient-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.ing-chip {
  font-size: 11px; padding: 3px 10px; border-radius: 6px;
  background: var(--surf3); color: var(--text2); border: 1px solid var(--border2);
}
.meal-why {
  font-size: 13px; color: var(--text2); line-height: 1.55;
  padding: 10px 12px; background: var(--surf2); border-radius: 8px;
  border-left: 2px solid var(--amber);
}
.meal-why span { display: block; font-weight: 600; color: var(--amber2); margin-bottom: 4px; font-size: 11px; }

/* ── PREP SECTIONS ───────────────────────────────────────────── */
.prep-section { margin-bottom: 14px; }
.prep-section-title {
  font-family: var(--font-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: .1em; color: var(--text3); margin-bottom: 8px;
}
.prep-ing-header {
  display: grid; grid-template-columns: 1fr 80px 90px;
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text3); padding: 4px 0; border-bottom: 1px solid var(--border); margin-bottom: 4px;
}
.prep-ing-row {
  display: grid; grid-template-columns: 1fr 80px 90px;
  align-items: center; padding: 6px 0;
  border-bottom: 1px solid rgba(30,45,69,.5);
  transition: background .15s;
}
.prep-ing-row:last-child { border-bottom: none; }
.prep-ing-row:hover { background: var(--surf2); border-radius: 4px; }
.prep-ing-name { font-size: 13px; color: var(--text); }
.prep-ing-portion { font-family: var(--font-mono); font-size: 12px; color: var(--text2); }
.prep-ing-cals { font-family: var(--font-mono); font-size: 12px; color: var(--cyan); }
.prep-no-foods {
  padding: 12px; background: rgba(239,68,68,.05);
  border: 1px solid rgba(239,68,68,.2); border-radius: 8px;
  color: #fca5a5; font-size: 13px;
}

/* ── CALORIE BAR ─────────────────────────────────────────────── */
.cal-bar-wrap { margin: 12px 0; }
.cal-bar-track {
  height: 6px; background: var(--surf3); border-radius: 3px;
  overflow: hidden; margin-bottom: 6px;
}
.cal-bar-fill { height: 100%; border-radius: 3px; transition: width .6s ease; }
.cal-bar-label { font-family: var(--font-mono); font-size: 11px; color: var(--text2); }

/* ── PREP INSTRUCTIONS ───────────────────────────────────────── */
.prep-instructions {
  font-size: 13px; color: var(--text2); line-height: 1.55;
  padding: 10px 12px; background: var(--surf2); border-radius: 8px;
  border-left: 2px solid var(--cyan); margin-top: 12px;
}

/* ── DAILY SUMMARY ───────────────────────────────────────────── */
.daily-summary {
  background: var(--surf2); border: 1px solid var(--amber);
  border-radius: 12px; padding: 20px 22px; margin-top: 16px;
  position: relative; overflow: hidden;
}
.daily-summary::before {
  content: 'DAILY TOTAL';
  position: absolute; right: 16px; top: 16px;
  font-family: var(--font-mono); font-size: 10px;
  color: var(--text3); letter-spacing: .12em;
}
.daily-summary-title {
  font-family: var(--font-head); font-size: 16px; font-weight: 600;
  color: var(--amber2); margin-bottom: 10px;
}
.daily-summary-note { font-size: 12px; color: var(--text3); margin-top: 8px; }

/* ── BUTTONS ─────────────────────────────────────────────────── */
.btn-row { display: flex; gap: 10px; margin-top: 28px; align-items: center; }
.btn {
  padding: 11px 24px; border-radius: 8px; border: none;
  font-family: var(--font-body); font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all .2s;
  display: inline-flex; align-items: center; gap: 8px;
}
.btn-primary {
  background: var(--amber); color: var(--bg); font-weight: 600;
}
.btn-primary:hover:not(:disabled) { background: var(--amber2); transform: translateY(-1px); box-shadow: 0 4px 16px var(--amber-glow); }
.btn-primary:disabled { opacity: .4; cursor: not-allowed; }
.btn-ghost {
  background: transparent; color: var(--text2);
  border: 1px solid var(--border);
}
.btn-ghost:hover { border-color: var(--border2); color: var(--text); }
.btn-reroll {
  background: var(--surf); border: 1px solid var(--border);
  color: var(--text2); margin-top: 16px; width: 100%;
  justify-content: center; font-size: 13px;
}
.btn-reroll:hover { border-color: var(--border2); color: var(--text); }

/* ── INVENTORY STATUS ────────────────────────────────────────── */
.inv-status {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 11px; color: var(--text2);
  padding: 6px 12px; background: var(--surf2);
  border: 1px solid var(--border); border-radius: 99px;
  margin-bottom: 20px;
}
.inv-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--text3); transition: background .3s;
}
.inv-dot.live { background: var(--green); box-shadow: 0 0 6px var(--green); }
.inv-dot.loading { animation: pulse 1s infinite; background: var(--amber); }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

</style>
</head>
<body>

<!-- ── TOP BAR ──────────────────────────────────────────────────────────── -->
<header class="topbar">
  <div class="topbar-logo">SHIP<span>FUEL</span></div>
  <nav class="stepper">
    <div class="step-item active" id="step1"><div class="step-num">1</div><div class="step-label">Role</div></div>
    <div class="step-connector"></div>
    <div class="step-item" id="step2"><div class="step-num">2</div><div class="step-label">Meals</div></div>
    <div class="step-connector"></div>
    <div class="step-item" id="step3"><div class="step-num">3</div><div class="step-label">Mode</div></div>
    <div class="step-connector"></div>
    <div class="step-item" id="step4"><div class="step-num">4</div><div class="step-label">Recipes</div></div>
    <div class="step-connector"></div>
    <div class="step-item" id="step5"><div class="step-num">5</div><div class="step-label">Plan</div></div>
  </nav>
</header>

<main class="main">

  <!-- ── STEP 1: JOB SELECTION ────────────────────────────────────────── -->
  <section class="section visible" id="sec1">
    <div class="sec-header">
      <div class="sec-tag">Step 01 / Role</div>
      <h1 class="sec-title">Select your shipboard role</h1>
      <p class="sec-sub">Your daily calorie target is calculated from your job's physical demands.</p>
    </div>
    <div class="search-wrap">
      <span class="search-icon">⌕</span>
      <input type="text" id="jobSearch" placeholder="Search roles…" oninput="filterJobs(this.value)">
    </div>
    <div class="job-grid" id="jobGrid"></div>
    <div class="btn-row">
      <button class="btn btn-primary" id="nextBtn1" onclick="goTo(2)" disabled>Continue →</button>
    </div>
  </section>

  <!-- ── STEP 2: MEAL SELECTION ────────────────────────────────────────── -->
  <section class="section" id="sec2">
    <div class="sec-header">
      <div class="sec-tag">Step 02 / Meals</div>
      <h1 class="sec-title">Which meals do you need?</h1>
      <p class="sec-sub">At least one meal is required. Calorie targets are split proportionally.</p>
    </div>
    <div class="meal-toggles">
      <div class="meal-toggle-row" onclick="toggleMeal('breakfast')">
        <div class="meal-toggle-info">
          <span class="meal-icon">🌅</span>
          <div><div class="meal-name">Breakfast</div><div class="meal-time">25% of daily calories</div></div>
        </div>
        <div class="toggle-switch on" id="tog-breakfast"><div class="toggle-knob toggle-check">✓</div></div>
      </div>
      <div class="meal-toggle-row" onclick="toggleMeal('lunch')">
        <div class="meal-toggle-info">
          <span class="meal-icon">☀️</span>
          <div><div class="meal-name">Lunch</div><div class="meal-time">35% of daily calories</div></div>
        </div>
        <div class="toggle-switch on" id="tog-lunch"><div class="toggle-knob toggle-check">✓</div></div>
      </div>
      <div class="meal-toggle-row" onclick="toggleMeal('dinner')">
        <div class="meal-toggle-info">
          <span class="meal-icon">🌙</span>
          <div><div class="meal-name">Dinner</div><div class="meal-time">40% of daily calories</div></div>
        </div>
        <div class="toggle-switch on" id="tog-dinner"><div class="toggle-knob toggle-check">✓</div></div>
      </div>
    </div>
    <div class="meal-warn" id="mealWarn">⚠ At least one meal must be selected.</div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goTo(1)">← Back</button>
      <button class="btn btn-primary" id="nextBtn2" onclick="goTo(3)">Continue →</button>
    </div>
  </section>

  <!-- ── STEP 3: MODE SELECTION ────────────────────────────────────────── -->
  <section class="section" id="sec3">
    <div class="sec-header">
      <div class="sec-tag">Step 03 / Mode</div>
      <h1 class="sec-title">How do you want your plan?</h1>
      <p class="sec-sub">Prep mode uses your live stock to optimise every calorie. Recipe mode picks from the ship's legacy cookbook.</p>
    </div>
    <div id="invStatus" class="inv-status">
      <div class="inv-dot loading" id="invDot"></div>
      <span id="invText">Fetching inventory…</span>
    </div>
    <div class="mode-cards">
      <div class="mode-card" id="mode-prep" onclick="selectMode('prep')">
        <div class="mode-icon">⚙️</div>
        <div class="mode-title">Stock-Optimised Prep</div>
        <div class="mode-desc">Ingredients are drawn live from ship inventory. The algorithm distributes portions to hit your exact calorie target per meal.</div>
        <span class="mode-badge">LIVE INVENTORY</span>
      </div>
      <div class="mode-card" id="mode-recipe" onclick="selectMode('recipe')">
        <div class="mode-icon">📖</div>
        <div class="mode-title">Legacy Earth Recipes</div>
        <div class="mode-desc">Browse the ship's recipe database by cuisine. Recipes are matched to your meal slots and nutritional profile.</div>
        <span class="mode-badge">BROWSE MODE</span>
      </div>
    </div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goTo(2)">← Back</button>
      <button class="btn btn-primary" id="nextBtn3" onclick="handleModeNext()" disabled>Continue →</button>
    </div>
  </section>

  <!-- ── STEP 4: RECIPE BROWSER ────────────────────────────────────────── -->
  <section class="section" id="sec4">
    <div class="sec-header">
      <div class="sec-tag">Step 04 / Recipes</div>
      <h1 class="sec-title">Choose your recipes</h1>
      <p class="sec-sub">Select one recipe per meal. Filter by country of origin.</p>
    </div>
    <div id="sec4Content"></div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goTo(3)">← Back</button>
      <button class="btn btn-primary" id="nextBtn4" onclick="buildRecipePlan()" disabled>Generate plan →</button>
    </div>
  </section>

  <!-- ── STEP 5: RESULTS ───────────────────────────────────────────────── -->
  <section class="section" id="sec5">
    <div class="sec-header">
      <div class="sec-tag">Step 05 / Nutrition Plan</div>
      <h1 class="sec-title">Your meal plan</h1>
    </div>
    <div id="resultContent"></div>
    <div class="btn-row">
      <button class="btn btn-ghost" onclick="goBack()">← Adjust</button>
      <button class="btn btn-primary" onclick="goTo(1)">Start over</button>
    </div>
  </section>

</main>

<script>
// ═══════════════════════════════════════════════════════════════════
// DATA — JOBS
// ═══════════════════════════════════════════════════════════════════
const JOBS = [
  { name: "EVA Engineer", type: "Physical", cal: 10, rating: "9.8/10" },
  { name: "Construction Specialist", type: "Physical", cal: 10, rating: "9.7/10" },
  { name: "Mining Specialist", type: "Physical", cal: 10, rating: "9.6/10" },
  { name: "Security Officer", type: "Security", cal: 9, rating: "9.0/10" },
  { name: "Technician", type: "Technical", cal: 8, rating: "8.7/10" },
  { name: "Medical Officer", type: "Cognitive", cal: 5, rating: "7.9/10" },
  { name: "AI Systems Operator", type: "Cognitive", cal: 4, rating: "7.8/10" },
  { name: "Pilot / Navigator", type: "Navigation", cal: 6, rating: "8.0/10" },
  { name: "Ship Teacher", type: "Social", cal: 4, rating: "6.8/10" }
];

const RECIPES=[
  {flag:"🇮🇳",name:"Butter Chicken",origin:"India",tags:["lab-grown chicken","hydroponic tomatoes","synthetic dairy","algae oil","garlic","onions"],why:"High morale meal. Strong cultural value. Protein-rich.",pro:8,carb:4,fat:7,vit:6,mealTypes:["lunch","dinner"]},
  {flag:"🇮🇳",name:"Dal Tadka",origin:"India",tags:["lentils","fermented soy paste","onions","garlic","yeast cultures","spices"],why:"Sustainable lentil base. Excellent plant protein and fibre.",pro:7,carb:7,fat:3,vit:7,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇮🇳",name:"Masala Oats",origin:"India",tags:["oats","onions","hydroponic tomatoes","garlic","yeast cultures"],why:"High-satiety breakfast, sustained energy release.",pro:5,carb:8,fat:3,vit:7,mealTypes:["breakfast"]},
  {flag:"🇮🇳",name:"Chana Masala",origin:"India",tags:["chickpeas","hydroponic tomatoes","onions","garlic","bell peppers","spices"],why:"Iron and fibre powerhouse. Fully plant-based, zero waste.",pro:8,carb:7,fat:3,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇮🇳",name:"Khichdi",origin:"India",tags:["rice cultures","lentils","onions","garlic","seeds","yeast cultures"],why:"The original recovery meal. Easy digestion post-shift.",pro:7,carb:8,fat:2,vit:7,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇯🇵",name:"Ramen",origin:"Japan",tags:["algae noodles","synthetic egg protein","seaweed sheets","fungal broth"],why:"Efficient ingredients + comforting warmth.",pro:7,carb:7,fat:4,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇯🇵",name:"Onigiri",origin:"Japan",tags:["rice cultures","seaweed sheets","fermented soy paste","seeds"],why:"Compact, portable, high morale.",pro:4,carb:9,fat:2,vit:5,mealTypes:["breakfast","lunch"]},
  {flag:"🇯🇵",name:"Miso Soup & Rice",origin:"Japan",tags:["fermented soy paste","seaweed sheets","rice cultures","mushrooms","yeast cultures"],why:"Probiotic-rich. Gut health critical on long voyages.",pro:5,carb:8,fat:2,vit:8,mealTypes:["breakfast","lunch"]},
  {flag:"🇯🇵",name:"Tofu Teriyaki Bowl",origin:"Japan",tags:["soybeans","fermented soy paste","rice cultures","seaweed sheets","seeds","algae oil"],why:"Complete amino acids from soy. Algae oil boosts omega-3.",pro:8,carb:7,fat:5,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇲🇽",name:"Tacos",origin:"Mexico",tags:["insect protein tortillas","lentils","lab-grown chicken","hydroponic vegetables"],why:"Flexible recipe using minimal resources.",pro:9,carb:6,fat:4,vit:7,mealTypes:["lunch","dinner"]},
  {flag:"🇲🇽",name:"Black Bean Burrito",origin:"Mexico",tags:["soybeans","rice cultures","hydroponic lettuce","fermented soy paste","bell peppers"],why:"Dense calorie and protein payload for heavy-duty crews.",pro:8,carb:8,fat:3,vit:6,mealTypes:["lunch","dinner"]},
  {flag:"🇲🇽",name:"Pozole de Hongos",origin:"Mexico",tags:["mycoprotein fungi","hydroponic vegetables","onions","garlic","herbs","bell peppers"],why:"Traditional stew adapted. Fungi = sustainable protein.",pro:7,carb:7,fat:3,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇬🇧",name:"Shepherd's Pie",origin:"United Kingdom",tags:["hydroponic potatoes","mycoprotein fungi","algae oil","onions","garlic"],why:"Dense calories for physical workers.",pro:7,carb:8,fat:5,vit:6,mealTypes:["dinner"]},
  {flag:"🇬🇧",name:"Porridge & Seeds",origin:"United Kingdom",tags:["oats","seeds","fruit cell cultures","yeast cultures"],why:"Slow-release energy. Ideal pre-shift morning meal.",pro:5,carb:8,fat:5,vit:7,mealTypes:["breakfast"]},
  {flag:"🇬🇧",name:"Lentil Cottage Pie",origin:"United Kingdom",tags:["lentils","hydroponic potatoes","mushrooms","onions","garlic"],why:"100% plant-based. Zero waste. High protein efficiency.",pro:8,carb:8,fat:2,vit:7,mealTypes:["lunch","dinner"]},
  {flag:"🇰🇷",name:"Bibimbap",origin:"South Korea",tags:["rice cultures","hydroponic greens","synthetic egg protein","fermented soy paste"],why:"Balanced nutrition in one bowl.",pro:7,carb:8,fat:5,vit:9,mealTypes:["lunch","dinner"]},
  {flag:"🇰🇷",name:"Kimchi Fried Rice",origin:"South Korea",tags:["rice cultures","fermented soy paste","synthetic egg protein","seaweed sheets","yeast cultures"],why:"Fermented foods support gut microbiome in zero-G.",pro:6,carb:8,fat:4,vit:8,mealTypes:["breakfast","lunch"]},
  {flag:"🇰🇷",name:"Sundubu Jjigae",origin:"South Korea",tags:["soybeans","mushrooms","hydroponic greens","seaweed sheets","fermented soy paste","synthetic egg protein"],why:"Silken tofu stew. High protein, anti-inflammatory.",pro:8,carb:4,fat:5,vit:9,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇮🇹",name:"Margherita Pizza",origin:"Italy",tags:["algae flour crust","hydroponic tomatoes","synthetic dairy","herbs"],why:"Massive morale booster and social food.",pro:6,carb:8,fat:6,vit:7,mealTypes:["lunch","dinner"]},
  {flag:"🇮🇹",name:"Pasta e Fagioli",origin:"Italy",tags:["lentils","chickpeas","fermented soy paste","onions","garlic","seaweed sheets"],why:"Complete amino acid profile. Low resource cost.",pro:8,carb:8,fat:2,vit:7,mealTypes:["lunch","dinner"]},
  {flag:"🇮🇹",name:"Risotto ai Funghi",origin:"Italy",tags:["rice cultures","mycoprotein fungi","synthetic dairy","yeast cultures","onions","algae oil"],why:"Warming comfort food. Fungi = low-impact protein.",pro:6,carb:8,fat:6,vit:7,mealTypes:["dinner"]},
  {flag:"🇻🇳",name:"Pho",origin:"Vietnam",tags:["algae broth","rice cultures","hydroponic herbs","cultured beef strips"],why:"Hydrating and efficient.",pro:7,carb:7,fat:3,vit:9,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇻🇳",name:"Bánh Mì Bowl",origin:"Vietnam",tags:["insect protein flour","fermented soy paste","hydroponic lettuce","rice cultures"],why:"Street-food efficiency. High morale from complex flavours.",pro:8,carb:7,fat:4,vit:7,mealTypes:["lunch"]},
  {flag:"🌍",name:"Falafel Wraps",origin:"Middle East",tags:["chickpeas","algae flatbread","hydroponic lettuce","herbs","garlic"],why:"Cheap, sustainable protein source.",pro:8,carb:7,fat:4,vit:6,mealTypes:["lunch","dinner"]},
  {flag:"🌍",name:"Shakshuka",origin:"North Africa",tags:["hydroponic tomatoes","synthetic egg protein","onions","garlic","bell peppers","spices"],why:"Iron-rich, anti-inflammatory. Excellent crew wellness food.",pro:7,carb:5,fat:5,vit:9,mealTypes:["breakfast","lunch"]},
  {flag:"🌍",name:"Hummus & Flatbread",origin:"Middle East",tags:["chickpeas","algae oil","garlic","algae flatbread","seeds"],why:"High-fibre snack. Excellent calcium source.",pro:6,carb:7,fat:6,vit:6,mealTypes:["breakfast","lunch"]},
  {flag:"🌍",name:"Tagine de Lentilles",origin:"Morocco",tags:["lentils","hydroponic tomatoes","onions","garlic","sweet potatoes","spices"],why:"North African spice blend fights inflammation. Dense nutrients.",pro:8,carb:8,fat:2,vit:9,mealTypes:["lunch","dinner"]},
  {flag:"🌍",name:"Koshari",origin:"Egypt",tags:["rice cultures","lentils","chickpeas","onions","hydroponic tomatoes","garlic"],why:"Three complete proteins in one bowl.",pro:8,carb:9,fat:2,vit:7,mealTypes:["lunch","dinner"]},
  {flag:"🇨🇳",name:"Fried Rice",origin:"China",tags:["rice cultures","synthetic egg protein","hydroponic vegetables","fermented soy paste"],why:"Uses leftovers efficiently with minimal waste.",pro:6,carb:8,fat:4,vit:6,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇨🇳",name:"Congee",origin:"China",tags:["rice cultures","seaweed sheets","fermented soy paste","mushrooms"],why:"Ultra light, restorative. Ideal for recovery days.",pro:4,carb:8,fat:1,vit:7,mealTypes:["breakfast"]},
  {flag:"🇨🇳",name:"Mapo Tofu",origin:"China",tags:["soybeans","mycoprotein fungi","fermented soy paste","onions","garlic","algae oil"],why:"Complete protein. Spiced oil aids circulation on long shifts.",pro:9,carb:3,fat:6,vit:7,mealTypes:["lunch","dinner"]},
  {flag:"🇨🇦",name:"Poutine",origin:"Canada",tags:["hydroponic potato fries","synthetic dairy curds","mycoprotein gravy"],why:"Comfort food during morale crises.",pro:5,carb:9,fat:6,vit:4,mealTypes:["lunch","dinner"]},
  {flag:"🇪🇹",name:"Injera & Lentil Stew",origin:"Ethiopia",tags:["lentils","fermented soy paste","onions","garlic","bell peppers","yeast cultures"],why:"Fermented injera feeds gut biome. Lentils = zero-waste protein.",pro:8,carb:7,fat:2,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇪🇹",name:"Tibs Fitfit",origin:"Ethiopia",tags:["lab-grown chicken","fermented soy paste","onions","garlic","bell peppers","herbs"],why:"Protein-packed celebration dish. Community morale booster.",pro:9,carb:4,fat:5,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇬🇷",name:"Greek Quinoa Bowl",origin:"Greece",tags:["quinoa","hydroponic tomatoes","synthetic dairy","algae oil","hydroponic herbs"],why:"Complete protein from quinoa. Mediterranean longevity diet.",pro:7,carb:7,fat:6,vit:9,mealTypes:["breakfast","lunch"]},
  {flag:"🇵🇪",name:"Quinoa Stew",origin:"Peru",tags:["quinoa","soybeans","sweet potatoes","onions","garlic","seeds"],why:"Andean superfood combo. Excellent for high-demand crew.",pro:8,carb:8,fat:4,vit:9,mealTypes:["lunch","dinner"]},
  {flag:"🇵🇪",name:"Causa Rellena",origin:"Peru",tags:["hydroponic potatoes","lentils","algae oil","hydroponic lettuce","onions"],why:"Layered potato terrine. High-density carb for physical labour.",pro:6,carb:9,fat:4,vit:7,mealTypes:["lunch","dinner"]},
  {flag:"🇳🇬",name:"Jollof Rice & Beans",origin:"Nigeria",tags:["rice cultures","soybeans","hydroponic tomatoes","onions","bell peppers"],why:"Culturally iconic across Africa. High morale from familiarity.",pro:7,carb:8,fat:3,vit:7,mealTypes:["lunch","dinner"]},
  {flag:"🇳🇬",name:"Egusi Soup",origin:"Nigeria",tags:["seeds","soybeans","hydroponic greens","onions","mushrooms","algae oil"],why:"Melon seeds = extremely high fat and protein density.",pro:8,carb:4,fat:9,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇧🇷",name:"Feijão Tropeiro",origin:"Brazil",tags:["soybeans","rice cultures","synthetic egg protein","garlic","onions"],why:"Calorie-dense cowboy meal. Excellent for physical labour.",pro:8,carb:8,fat:4,vit:6,mealTypes:["lunch","dinner"]},
  {flag:"🇹🇭",name:"Green Curry",origin:"Thailand",tags:["mycoprotein fungi","algae milk","hydroponic vegetables","rice cultures","herbs"],why:"Anti-inflammatory spices. Flavour complexity lifts morale.",pro:6,carb:7,fat:7,vit:9,mealTypes:["lunch","dinner"]},
  {flag:"🇹🇭",name:"Tom Yum Broth",origin:"Thailand",tags:["algae broth","mushrooms","lemongrass","hydroponic herbs","synthetic egg protein"],why:"Hydrating immunity broth. Lemongrass combats space fatigue.",pro:5,carb:3,fat:3,vit:10,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇺🇸",name:"Protein Power Bowl",origin:"USA",tags:["insect protein flour","sweet potatoes","seeds","kale","algae oil"],why:"Designed for max performance. High protein density per gram.",pro:9,carb:7,fat:6,vit:9,mealTypes:["breakfast","lunch"]},
  {flag:"🇪🇸",name:"Vegetable Paella",origin:"Spain",tags:["rice cultures","bell peppers","onions","mushrooms","garlic","algae oil"],why:"Communal dish — crew social bonding meal.",pro:5,carb:9,fat:4,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇮🇷",name:"Ash Reshteh",origin:"Iran",tags:["lentils","chickpeas","soybeans","algae noodles","onions","herbs","yeast cultures"],why:"Thick Persian herb noodle soup. Rich in plant iron and folate.",pro:8,carb:8,fat:2,vit:9,mealTypes:["lunch","dinner"]},
  {flag:"🇬🇭",name:"Red Red",origin:"Ghana",tags:["soybeans","sweet potatoes","onions","bell peppers","algae oil","hydroponic tomatoes"],why:"Black-eyed bean stew. Essential B-vitamins for nerve health.",pro:8,carb:7,fat:4,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇵🇭",name:"Sinigang na Gulay",origin:"Philippines",tags:["hydroponic vegetables","soybeans","mushrooms","onions","algae broth","garlic"],why:"Sour tamarind broth. Vitamin C boosts immune function.",pro:6,carb:5,fat:3,vit:10,mealTypes:["lunch","dinner"]},
  {flag:"🇹🇷",name:"Mercimek Çorbası",origin:"Turkey",tags:["lentils","onions","garlic","hydroponic tomatoes","algae oil","spices"],why:"Red lentil soup. Simple, low-waste, high-iron.",pro:8,carb:7,fat:3,vit:8,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇯🇲",name:"Ackee & Protein Hash",origin:"Jamaica",tags:["soybeans","hydroponic tomatoes","onions","bell peppers","algae oil","synthetic egg protein"],why:"Cultural staple reimagined. Unique Caribbean nutrient profile.",pro:7,carb:5,fat:7,vit:8,mealTypes:["breakfast","lunch"]},
  {flag:"🇦🇷",name:"Locro Stew",origin:"Argentina",tags:["chickpeas","sweet potatoes","onions","garlic","bell peppers","seeds"],why:"Thick winter stew. Dense calories for extreme physical work.",pro:7,carb:8,fat:4,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇮🇩",name:"Nasi Goreng",origin:"Indonesia",tags:["rice cultures","synthetic egg protein","soybeans","fermented soy paste","garlic","onions"],why:"Indonesia's comfort food. High morale, highly adaptable.",pro:7,carb:8,fat:5,vit:7,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇺🇦",name:"Borscht",origin:"Ukraine",tags:["hydroponic tomatoes","soybeans","onions","garlic","mushrooms","yeast cultures"],why:"Simulated beetroot base rich in nitrates. Boosts circulation.",pro:6,carb:6,fat:2,vit:10,mealTypes:["lunch","dinner"]},
  {flag:"🇸🇳",name:"Thieboudienne Bowl",origin:"Senegal",tags:["rice cultures","cultured fish cells","hydroponic tomatoes","onions","bell peppers","algae oil"],why:"West Africa's favourite rice-fish dish. Rich in omega-3.",pro:8,carb:8,fat:5,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇵🇰",name:"Daal Chawal",origin:"Pakistan",tags:["lentils","rice cultures","onions","garlic","spices","yeast cultures"],why:"Complete protein combination. Cultural comfort across South Asia.",pro:8,carb:8,fat:2,vit:7,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇳🇵",name:"Dal Bhat",origin:"Nepal",tags:["lentils","rice cultures","spinach","garlic","onions","spices"],why:"Sherpa staple. High-altitude endurance food repurposed for space.",pro:8,carb:8,fat:2,vit:9,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇲🇾",name:"Nasi Lemak Bowl",origin:"Malaysia",tags:["rice cultures","algae milk","insect protein flour","seaweed sheets","seeds","onions"],why:"Aromatic coconut rice bowl. Cultural morale anchor for Southeast Asian crew.",pro:7,carb:8,fat:6,vit:7,mealTypes:["breakfast","lunch"]},
  {flag:"🇰🇪",name:"Ugali & Sukuma Wiki",origin:"Kenya",tags:["sweet potatoes","kale","soybeans","onions","algae oil","garlic"],why:"East African staple. Kale = dense micronutrient source.",pro:7,carb:8,fat:3,vit:10,mealTypes:["lunch","dinner"]},
  {flag:"🇿🇦",name:"Umngqusho",origin:"South Africa",tags:["soybeans","sweet potatoes","onions","garlic","bell peppers","seeds"],why:"Xhosa samp and beans dish. Complete plant protein pairing.",pro:8,carb:8,fat:3,vit:8,mealTypes:["lunch","dinner"]},
  {flag:"🇷🇺",name:"Buckwheat Kasha",origin:"Russia",tags:["quinoa","mushrooms","onions","algae oil","yeast cultures","seeds"],why:"Buckwheat substitute. High magnesium for muscle recovery.",pro:6,carb:8,fat:4,vit:8,mealTypes:["breakfast","lunch"]},
  {flag:"🇵🇱",name:"Żurek Soup",origin:"Poland",tags:["lentils","mycoprotein fungi","onions","garlic","yeast cultures","soybeans"],why:"Fermented rye soup adapted. Probiotic base for gut support.",pro:7,carb:6,fat:3,vit:8,mealTypes:["breakfast","lunch","dinner"]},
  {flag:"🇦🇪",name:"Harees",origin:"UAE / Gulf",tags:["oats","lab-grown chicken","onions","garlic","algae oil","spices"],why:"Ancient wheat-meat porridge. High calorie density for demanding shifts.",pro:8,carb:8,fat:4,vit:6,mealTypes:["breakfast","dinner"]},
  {flag:"🇲🇲",name:"Mohinga",origin:"Myanmar",tags:["algae noodles","cultured fish cells","lemongrass","onions","garlic","herbs"],why:"Myanmar's national breakfast. Warming fish noodle broth, immune support.",pro:7,carb:6,fat:4,vit:9,mealTypes:["breakfast","lunch"]},
];

const ING = {
    energy: ["Soy Chunks", "Rice", "Oats", "Pasta", "Lentils", "Algae Oil", "Synthetic Potato"]
};

const METHODS = [
    "Flash-heat and compress into energy bar",
    "Hydrate and blend into caloric shake",
    "Pressure-cook and serve as high-density bowl"
];