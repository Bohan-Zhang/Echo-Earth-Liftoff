// ═══════════════════════════════════════════════════════════════════════════════
// DATA & STATE
// ═══════════════════════════════════════════════════════════════════════════════

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAaI-jNgHTQwfnVgHlYrwbQ3ic1DVIpRKWB7H1f3jFbac3HtqG56FfvJF9EdOkm07wn0XG25XvK45m/pub?output=csv';
// URL for food inventory CSV export from Google Sheets

let state = { 
  step: 1,  // Step is the step in the process. Step 1 is telling it your job.
  job: null, // We don't know yet
  meals: { breakfast: true, lunch: true, dinner: true }, // Are you eating breakfast?
  mode: null, // Mode is if you're just eating for nutrients, or if you're doing a traditional recipe from Earth.
  selections: { breakfast: null, lunch: null, dinner: null }, // What are we actually eating for break, lunch, dinner
  prepPlan: null, // This is the recipe in case you are doing a traditional recipe.
  foodInventory: [], // Includes food and the stock.
  inventoryLoaded: false 
};

// Utility: clean CSV cells by stripping quotes and trimming whitespace
const cleanVal = (val) => val ? val.replace(/"/g, '').trim() : '';

// Load the food inventory from CSV and store it in state
async function fetchFoodInventory() {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    const rows = csvText.trim().split('\n');

    // Save to global state so every other file can use it
    state.foodInventory = rows.slice(1).map(row => {
      const vals = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      return {
        name:     cleanVal(vals[1]),
        calories: parseFloat(cleanVal(vals[2])) || 0,
        stock:    parseFloat(cleanVal(vals[3])) || 0
      };
    }).filter(f => f.name !== ""); // Only keep rows with names

    console.log("Inventory synced with Google Sheets.");
    return true; 
  } catch (e) {
    console.error("Sync failed:", e);
    return false;
  }
}

// Select foods for a meal based on the calorie target and available stock
function selectFoodsForMeal(availableFoods, targetCals) {
  const pool = [...availableFoods].sort(() => Math.random() - 0.5); // Randomize order for variety

  const selected  = [];
  let   totalCals = 0;

  for (const food of pool) {
    const remaining = targetCals - totalCals;
    if (remaining < 40) break; // Stop once we're close enough to the target

    const maxContrib  = Math.min(remaining, targetCals * 0.40);   // Cap each ingredient at 40% of remaining calories
    const gramsNeeded = Math.round((maxContrib / food.calories) * 100);
    const gramsUsed   = Math.min(gramsNeeded, food.stock, 350);   // Respect stock and max portion size

    if (gramsUsed < 30) continue;                                 // Skip tiny portions

    const calsFromFood = Math.round((gramsUsed * food.calories) / 100);
    if (calsFromFood < 30) continue;                              // Skip low-calorie additions

    selected.push({
      name:            food.name,
      gramsUsed,
      cals:            calsFromFood,
      caloriesPer100g: food.calories
    });

    totalCals += calsFromFood;
    if (totalCals >= targetCals * 0.93) break;                     // Stop when close to the target
  }

  return { foods: selected, totalCals };
}

// Generate the prep plan for active meals using the available inventory
function generatePrep(job, activeMeals) {
  const inStock = state.foodInventory;

  if (inStock.length === 0) {
    return activeMeals.map(meal => ({
      meal,
      foods:      [],
      totalCals:  0,
      targetCals: Math.round(job.dailyCalories * (MEAL_RATIOS[meal] || 0.33)),
      method:     'Not enough food is available.'
    }));
  }

  // Clone inventory so selected quantities are deducted meal-by-meal.
  // This ensures earlier meals consume stock before later meals are generated.
  const inventory = inStock.map(item => ({ ...item }));

  const plan = activeMeals.map(meal => {
    const ratio      = MEAL_RATIOS[meal] || (1 / activeMeals.length);
    const targetCals = Math.round(job.dailyCalories * ratio);
    const { foods, totalCals } = selectFoodsForMeal(inventory, targetCals);

    // Reduce used stock from the cloned inventory after generating this meal.
    // Later meals will then see the updated remaining inventory.
    foods.forEach(f => {
      const stockItem = inventory.find(i => i.name === f.name);
      if (stockItem) {
        stockItem.stock = Math.max(stockItem.stock - f.gramsUsed, 0);
      }
    });

    const method = (foods.length === 0 || totalCals < targetCals)
      ? 'Not enough food is available.'
      : METHODS[Math.floor(Math.random() * METHODS.length)];

    return { meal, foods, totalCals, targetCals, method };
  });

  state.foodInventory = inventory;
  return plan;
}

// JOB GRID
// Render available job cards and filter by search input
function renderJobs(filter = '') {
  const f = filter.toLowerCase();
  document.getElementById('jobGrid').innerHTML = JOBS
    .filter(j => {
      if (j.dailyCalories == null) {
        console.warn('[ShipFuel] Job missing dailyCalories:', j);
        return false;
      }
      return j.name.toLowerCase().includes(f);
    })
    .map(j => `
      <div class="job-card ${state.job === j.name ? 'selected' : ''}"
           onclick="selectJob('${j.name.replace(/'/g, "\\'")}')">
        <div class="job-name">${j.name}</div>
        <div class="job-stats">
          <span class="stat-pill calories-pill"> ${(j.dailyCalories ?? 0).toLocaleString()} kcal/day</span>
          <span class="stat-pill activity-pill">${j.activity}</span>
        </div>
        <div class="job-desc">${j.description}</div>
      </div>`) 
    .join('');
}
renderJobs();

// Filter jobs list when the user types in search
function filterJobs(v) { renderJobs(v); }

// Store selected job and enable the first next button
function selectJob(name) {
  state.job = name;
  renderJobs(document.getElementById('jobSearch').value);
  document.getElementById('nextBtn1').disabled = false;
}

// MEAL TOGGLES
// Toggle a meal on/off, ensuring at least one meal remains enabled
function toggleMeal(meal) {
  const on = state.meals[meal];
  if (on && Object.values(state.meals).filter(Boolean).length <= 1) {
    document.getElementById('mealWarn').classList.add('visible');
    return;
  }
  document.getElementById('mealWarn').classList.remove('visible');
  state.meals[meal] = !on;
  const t = document.getElementById('tog-' + meal);
  t.classList.toggle('on', !on);
  t.querySelector('.toggle-check').textContent = !on ? '✓' : '';
}

// MODE SELECTION
// Select the workflow mode and enable the continue button
function selectMode(mode) {
  state.mode = mode;
  const recipeEl = document.getElementById('mode-recipe');
  const prepEl   = document.getElementById('mode-prep');
  const btnEl    = document.getElementById('nextBtn3');
  if (recipeEl) recipeEl.classList.toggle('selected', mode === 'recipe');
  if (prepEl)   prepEl.classList.toggle('selected',   mode === 'prep');
  if (btnEl)    btnEl.disabled = false;
}

// Advance after mode selection; recipe mode goes to browser, prep mode generates the plan
async function handleModeNext() {
  if (!state.mode) { alert('Please select a mode first!'); return; }

  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);

  if (state.mode === 'recipe') {
    goTo(4);
  } else {
    if (state.foodInventory.length === 0) {
      document.getElementById('nextBtn3').textContent = 'Loading inventory…';
      await refreshInventory();
      document.getElementById('nextBtn3').textContent = 'Continue →';
    }
    state.prepPlan = generatePrep(job, active);
    renderResults(job, active, 'prep');
    goTo(5, true);
  }
}

// Navigate backward in the workflow based on current mode
function goBack() { goTo(state.mode === 'recipe' ? 4 : 3); }

// RECIPE BROWSER
// Build the recipe selection UI with country filters and meal slots
function renderSec4() {
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  state.selections = { breakfast: null, lunch: null, dinner: null };
  const countries = [...new Set(RECIPES.map(r => r.origin))].sort();

  let h = `<div class="country-filters">
    <button class="country-btn active" onclick="filterCountry(this,'all')">All</button>
    ${countries.map(c => `<button class="country-btn" onclick="filterCountry(this,'${c.replace(/'/g, "\\'")}')"> ${c}</button>`).join('')}
  </div>`;

  active.forEach(meal => {
    h += `<div class="meal-slot-label">${meal.charAt(0).toUpperCase() + meal.slice(1)}</div>
          <div class="recipe-grid" id="grid-${meal}">`;
    RECIPES.filter(r => r.mealTypes.includes(meal)).forEach(r => {
      h += `<div class="recipe-card" id="rc-${meal}-${san(r.name)}"
                 onclick="selRec('${meal}','${r.name.replace(/'/g, "\\'")}')">
              <span class="recipe-flag">${r.flag}</span>
              <div class="recipe-info">
                <div class="recipe-name">${r.name}</div>
                <div class="recipe-origin">${r.origin}</div>
                <div class="recipe-adapt">${r.tags.slice(0, 3).map(t => `<span class="adapt-tag">${t}</span>`).join('')}</div>
              </div>
            </div>`;
    });
    h += `</div>`;
  });

  document.getElementById('sec4Content').innerHTML = h;
  checkDone();
}

// Sanitize recipe names for safe element IDs
function san(s) { return s.replace(/[^a-zA-Z0-9]/g, '_'); }

// Mark a recipe as selected for a meal and update selection visuals
function selRec(meal, name) {
  state.selections[meal] = name;
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  active.forEach(m => {
    RECIPES.filter(r => r.mealTypes.includes(m)).forEach(r => {
      const el = document.getElementById(`rc-${m}-${san(r.name)}`);
      if (el) el.classList.toggle('selected', state.selections[m] === r.name);
    });
  });
  checkDone();
}

// Enable the next button only when all active meals have a selection
function checkDone() {
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  document.getElementById('nextBtn4').disabled = !active.every(m => state.selections[m] !== null);
}

// Filter recipes by country and update the displayed recipe cards
function filterCountry(btn, country) {
  document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  active.forEach(meal => {
    const g = document.getElementById('grid-' + meal);
    if (!g) return;
    g.querySelectorAll('.recipe-card').forEach(card => {
      const o = card.querySelector('.recipe-origin').textContent;
      card.style.display = (country === 'all' || o === country || o.includes(country)) ? '' : 'none';
    });
  });
}

// Build the final recipe-based plan and show results
function buildRecipePlan() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  renderResults(job, active, 'recipe');
  goTo(5, true);
}

// Regenerate the prep plan using current inventory and meal selections
function rerollPrep() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  state.prepPlan = generatePrep(job, active);
  renderResults(job, active, 'prep');
}

// Generate a calorie progress bar with color coding based on completion
function calBar(got, target) {
  const pct   = Math.min(Math.round((got / target) * 100), 100);
  const color = pct >= 90 ? 'var(--success, #22c55e)'
              : pct >= 65 ? 'var(--warn, #f59e0b)'
              :              'var(--danger, #ef4444)';
  return `
    <div class="cal-bar-wrap">
      <div class="cal-bar-track">
        <div class="cal-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      <span class="cal-bar-label">${got.toLocaleString()} / ${target.toLocaleString()} kcal (${pct}%)</span>
    </div>`;
}

// Render the full results page for either recipe or prep mode
function renderResults(job, activeMeals, mode) {
  const totalDailyTarget = job.dailyCalories;
  let mealsHTML = '';

  if (mode === 'recipe') {
    mealsHTML = '<div class="meals-output">';
    activeMeals.forEach(meal => {
      const r = RECIPES.find(x => x.name === state.selections[meal]);
      if (!r) return;
      mealsHTML += `
        <div class="meal-result">
          <div class="meal-result-header">
            <span class="meal-time-badge ${meal}">${meal}</span>
            <span class="meal-result-name">${r.flag} ${r.name}</span>
            <span style="margin-left:auto;font-size:11px;color:var(--text3)">${r.origin}</span>
          </div>
          <div class="meal-result-body">
            <div class="ingredient-list">${r.tags.map(t => `<span class="ing-chip">${t}</span>`).join('')}</div>
            <div class="meal-why"><span>★ Why this works</span>${r.why}</div>
          </div>
        </div>`;
    });
    mealsHTML += '</div>';

  } else {
    const totalAchieved = state.prepPlan.reduce((s, p) => s + p.totalCals, 0);

    mealsHTML = '<div class="meals-output">';

    state.prepPlan.forEach(p => {
      const foodRows = p.foods.length
        ? p.foods.map(f => `
            <div class="prep-ing-row">
              <div class="prep-ing-name">${f.name}</div>
              <div class="prep-ing-portion">${f.gramsUsed} g</div>
              <div class="prep-ing-cals">${f.cals.toLocaleString()} kcal</div>
            </div>`).join('')
        : `<div class="prep-no-foods">⚠ Not enough food is available.</div>`;

      // If available foods were selected but still do not meet the calorie target,
      // show an explicit shortage notice for that meal.
      const shortageNotice = (p.foods.length > 0 && p.totalCals < p.targetCals)
        ? `<div class="prep-warning">⚠ Not enough food is available to meet the meal target.</div>`
        : '';

      mealsHTML += `
        <div class="prep-result-card">
          <div class="prep-result-header">
            <span class="meal-time-badge ${p.meal}">${p.meal}</span>
            <span class="prep-auto-label">Optimised from stock</span>
            <span class="meal-calorie-target" style="margin-left:auto">
              Target: ${p.targetCals.toLocaleString()} kcal
            </span>
          </div>
          <div class="prep-body">
            <div class="prep-section">
              <div class="prep-section-title">Ingredients &amp; Portions</div>
              
              ${foodRows}
              ${shortageNotice}
            </div>
            ${calBar(p.totalCals, p.targetCals)}
            <div class="prep-instructions">
              <b>How to prepare:</b> ${p.method}
            </div>
          </div>
        </div>`;
    });

    mealsHTML += `
      </div>
      <div class="daily-summary">
        <div class="daily-summary-title">Daily Calorie Total</div>
        ${calBar(totalAchieved, totalDailyTarget)}
        <div class="daily-summary-note">
          ${activeMeals.length} meal${activeMeals.length > 1 ? 's' : ''} planned
          · ${state.foodInventory.length} food${state.foodInventory.length !== 1 ? 's' : ''} in stock
        </div>
      </div>
      <button class="reroll-btn" onclick="rerollPrep()">↻ Regenerate meal plan</button>`;
  }

  document.getElementById('resultContent').innerHTML = `
    <div class="result-hero">
      <div class="result-job">Shipboard Role</div>
      <div class="result-headline">${job.name}</div>
      <div class="result-sub">
        ${job.activity} activity · ${totalDailyTarget.toLocaleString()} kcal/day target
        · ${activeMeals.length} meal${activeMeals.length > 1 ? 's' : ''}
        · ${mode === 'recipe' ? 'Legacy Earth Recipes' : 'Stock-Optimised Prep'}
      </div>
      <div class="calorie-summary-strip">
        <div class="csb-item">
          <div class="csb-label">Daily Target</div>
          <div class="csb-value">${totalDailyTarget.toLocaleString()} kcal</div>
        </div>
        ${Object.entries(MEAL_RATIOS)
            .filter(([m]) => activeMeals.includes(m))
            .map(([m, r]) => `
          <div class="csb-item">
            <div class="csb-label">${m.charAt(0).toUpperCase() + m.slice(1)}</div>
            <div class="csb-value">${Math.round(totalDailyTarget * r).toLocaleString()} kcal</div>
          </div>`).join('')}
      </div>
    </div>
    ${mealsHTML}`;
}

function goTo(step, skipRender) {
  if (step === 4 && !skipRender) renderSec4();
  for (let i = 1; i <= 5; i++) {
    document.getElementById('sec' + i).classList.toggle('visible', i === step);
    const s = document.getElementById('step' + i);
    s.classList.toggle('active', i === step);
    s.classList.toggle('done', i < step);
  }
  state.step = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── INIT ──────────────────────────────────────────────────────────────────────
refreshInventory();