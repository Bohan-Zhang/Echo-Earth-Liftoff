// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PLANNING APPLICATION FOR SHIPBOARD CREWS
// Generates personalized meal plans based on job roles and available food inventory
// ═══════════════════════════════════════════════════════════════════════════════

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAaI-jNgHTQwfnVgHlYrwbQ3ic1DVIpRKWB7H1f3jFbac3HtqG56FfvJF9EdOkm07wn0XG25XvK45m/pub?output=csv';
// Google Sheet containing the food inventory database with nutritional info

// Application state - tracks user selections and data throughout the workflow
let state = {
  step: 1,                                                          // Current page/section in the UI (1-5)
  job: null,                                                        // Selected job name (e.g., "Chef", "Pilot")
  meals: { breakfast: true, lunch: true, dinner: true },            // Toggle which meals are enabled
  mode: null,                                                       // Meal planning mode: 'recipe' or 'prep'
  selections: { breakfast: null, lunch: null, dinner: null },       // User-selected recipes per meal
  prepPlan: null,                                                   // Generated meal plan from available inventory
  foodInventory: []                                                 // List of foods loaded from inventory
};

// Utility: Clean CSV values by removing quotes and whitespace
const cleanVal = (val) => val ? val.replace(/"/g, '').trim() : '';
// Fetch food inventory from Google Sheet CSV
// Returns true on success, false on failure
async function fetchFoodInventory() {
  try {
    const response = await fetch(CSV_URL);                           // Fetch CSV data from spreadsheet
    const csvText = await response.text();                           // Convert response to raw text
    const rows = csvText.trim().split('\n');                        // Split into individual rows

    // Parse CSV rows into inventory objects, filtering for valid entries
    state.foodInventory = rows.slice(1)                             // Skip header row
      .map(row => {
        // Safely split CSV values while preserving quoted commas
        const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const name     = cleanVal(values[1]);                       // Extract food name (column 2)
        const calories = parseFloat(cleanVal(values[2])) || 0;      // Calories per 100g (column 3)
        const stock    = parseFloat(cleanVal(values[3])) || 0;      // Stock in grams (column 4)
        return { name, calories, stock };
      })
      .filter(f => f.name && f.calories > 0 && f.stock > 50);       // Keep only valid foods with >50g stock

    console.log(`[Inventory] Loaded ${state.foodInventory.length} available foods.`);
    return true;
  } catch (e) {
    console.error('[Inventory] Failed to fetch food data:', e);
    return false;                                                    // Return false if fetch fails
  }
}

// Select foods for a meal based on calorie target
// Uses random selection with calorie constraints to create variety
function selectFoodsForMeal(availableFoods, targetCals) {
  const pool = [...availableFoods].sort(() => Math.random() - 0.5);  // Randomize food order

  const selected  = [];
  let   totalCals = 0;

  // Iterate through randomized food pool to build meal
  for (const food of pool) {
    const remaining = targetCals - totalCals;
    if (remaining < 40) break;                                       // Stop if nearly at target

    // Calculate portion size: max 40% of target per food, limited by availability
    const maxContrib  = Math.min(remaining, targetCals * 0.40);
    const gramsNeeded = Math.round((maxContrib / food.calories) * 100);
    const gramsUsed   = Math.min(gramsNeeded, food.stock, 350);     // Cap at 350g per food

    if (gramsUsed < 30) continue;                                   // Skip if portion too small

    const calsFromFood = Math.round((gramsUsed * food.calories) / 100);
    if (calsFromFood < 30) continue;                                // Skip if calories too low

    // Add food to meal
    selected.push({
      name:            food.name,
      gramsUsed,
      cals:            calsFromFood,
      caloriesPer100g: food.calories
    });

    totalCals += calsFromFood;
    if (totalCals >= targetCals * 0.93) break;                       // Stop if >93% of target reached
  }

  return { foods: selected, totalCals };
}

// Generate a meal prep plan for selected meals based on job and available inventory
// Returns array of meal objects with food selections and preparation methods
function generatePrep(job, activeMeals) {
  const inStock = state.foodInventory;

  // Handle case where no foods are in stock
  if (inStock.length === 0) {
    return activeMeals.map(meal => ({
      meal,
      foods:      [],
      totalCals:  0,
      targetCals: Math.round(job.dailyCalories * (MEAL_RATIOS[meal] || 0.33)),
      method:     'No foods currently in stock. Please restock inventory.'
    }));
  }

  // Generate meal plan for each active meal
  return activeMeals.map(meal => {
    const ratio      = MEAL_RATIOS[meal] || (1 / activeMeals.length);  // Get meal calorie ratio
    const targetCals = Math.round(job.dailyCalories * ratio);           // Calculate target calories
    const { foods, totalCals } = selectFoodsForMeal(inStock, targetCals); // Select foods
    const method = METHODS[Math.floor(Math.random() * METHODS.length)];  // Random prep method
    return { meal, foods, totalCals, targetCals, method };
  });
}

// Render job cards in the UI, filtered by search term
// Shows job name, daily calorie requirements, activity level, and description
function renderJobs(filter = '') {
  const f = filter.toLowerCase();
  document.getElementById('jobGrid').innerHTML = JOBS
    .filter(j => {
      if (j.dailyCalories == null) {
        console.warn('[ShipFuel] Job missing dailyCalories:', j);
        return false;
      }
      return j.name.toLowerCase().includes(f);                      // Filter jobs by name
    })
    .map(j => `
      <div class="job-card ${state.job === j.name ? 'selected' : ''}"
           onclick="selectJob('${j.name.replace(/'/g, "\\'")}')">  <!-- Highlight selected job -->
        <div class="job-name">${j.name}</div>
        <div class="job-stats">
          <span class="stat-pill calories-pill"> ${(j.dailyCalories ?? 0).toLocaleString()} kcal/day</span>
          <span class="stat-pill activity-pill">${j.activity}</span>
        </div>
        <div class="job-desc">${j.description}</div>
      </div>`)
    .join('');
}
renderJobs();  // Initial render on page load

// Filter jobs by search input value
function filterJobs(v) { renderJobs(v); }

// Handle job selection: update state and enable next button
function selectJob(name) {
  state.job = name;
  renderJobs(document.getElementById('jobSearch').value);
  document.getElementById('nextBtn1').disabled = false;              // Enable navigation
}

// Toggle meal on/off - prevents disabling all meals
function toggleMeal(meal) {
  const on = state.meals[meal];
  // Check if this is the last enabled meal
  if (on && Object.values(state.meals).filter(Boolean).length <= 1) {
    document.getElementById('mealWarn').classList.add('visible');    // Show warning
    return;
  }
  document.getElementById('mealWarn').classList.remove('visible');
  state.meals[meal] = !on;                                           // Toggle state
  const t = document.getElementById('tog-' + meal);
  t.classList.toggle('on', !on);                                    // Update toggle display
  t.querySelector('.toggle-check').textContent = !on ? '✓' : '';    // Update checkmark
}

// Select planning mode: 'recipe' for user-selected recipes or 'prep' for inventory-based
function selectMode(mode) {
  state.mode = mode;
  const recipeEl = document.getElementById('mode-recipe');
  const prepEl   = document.getElementById('mode-prep');
  const btnEl    = document.getElementById('nextBtn3');
  if (recipeEl) recipeEl.classList.toggle('selected', mode === 'recipe');  // Highlight selection
  if (prepEl)   prepEl.classList.toggle('selected',   mode === 'prep');
  if (btnEl)    btnEl.disabled = false;                                    // Enable next button
}

// Handle progression after mode selection
// Recipe mode goes to step 4 (recipe selection)
// Prep mode generates meal plan and shows results (step 5)
async function handleModeNext() {
  if (!state.mode) { alert('Please select a mode first!'); return; }

  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);

  if (state.mode === 'recipe') {
    goTo(4);                                                          // Go to recipe selection
  } else {
    // Fetch inventory if not already loaded
    if (state.foodInventory.length === 0) {
      document.getElementById('nextBtn3').textContent = 'Loading inventory…';
      await fetchFoodInventory();
      document.getElementById('nextBtn3').textContent = 'Continue →';
    }
    state.prepPlan = generatePrep(job, active);                      // Generate meal plan
    renderResults(job, active, 'prep');                              // Render results
    goTo(5, true);                                                   // Go to results page
  }
}

// Navigate back: return to mode selection or recipe selection based on current mode
function goBack() { goTo(state.mode === 'recipe' ? 4 : 3); }

// Render section 4: recipe selection with country filters
// Display available recipes grouped by meal type
function renderSec4() {
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  state.selections = { breakfast: null, lunch: null, dinner: null };  // Reset selections
  const countries = [...new Set(RECIPES.map(r => r.origin))].sort(); // Extract unique countries

  let h = `<div class="country-filters">
    <button class="country-btn active" onclick="filterCountry(this,'all')">All</button>
    ${countries.map(c => `<button class="country-btn" onclick="filterCountry(this,'${c.replace(/'/g, "\\'")}')"> ${c}</button>`).join('')}
  </div>`;

  // Build recipe grid for each active meal
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

// Sanitize strings for use as HTML IDs (replace non-alphanumeric with underscore)
function san(s) { return s.replace(/[^a-zA-Z0-9]/g, '_'); }

// Handle recipe selection for a meal
// Update visual selection state and check if all meals have been selected
function selRec(meal, name) {
  state.selections[meal] = name;                                    // Store recipe selection
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  // Update visual highlights for all recipe cards
  active.forEach(m => {
    RECIPES.filter(r => r.mealTypes.includes(m)).forEach(r => {
      const el = document.getElementById(`rc-${m}-${san(r.name)}`);
      if (el) el.classList.toggle('selected', state.selections[m] === r.name);
    });
  });
  checkDone();
}

// Check if user has selected recipes for all active meals
// Enable next button only when complete
function checkDone() {
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  document.getElementById('nextBtn4').disabled = !active.every(m => state.selections[m] !== null);
}

// Filter recipe display by country of origin
function filterCountry(btn, country) {
  document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');                                      // Highlight active filter button
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  // Show/hide recipe cards based on country filter
  active.forEach(meal => {
    const g = document.getElementById('grid-' + meal);
    if (!g) return;
    g.querySelectorAll('.recipe-card').forEach(card => {
      const o = card.querySelector('.recipe-origin').textContent;
      card.style.display = (country === 'all' || o === country || o.includes(country)) ? '' : 'none';
    });
  });
}

// Build and display the final recipe plan from user selections
function buildRecipePlan() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  renderResults(job, active, 'recipe');                             // Show recipe plan
  goTo(5, true);                                                    // Go to results
}

// Regenerate prep plan with different random food selections
function rerollPrep() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  state.prepPlan = generatePrep(job, active);                       // Generate new plan
  renderResults(job, active, 'prep');                               // Update display
}

// Generate HTML for calorie progress bar
// Color-coded: green (90%+), yellow (65-89%), red (<65%)
function calBar(got, target) {
  const pct   = Math.min(Math.round((got / target) * 100), 100);
  // Determine bar color based on achievement percentage
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

// Render final meal plan results
// Supports two modes: 'recipe' (user-selected recipes) and 'prep' (inventory-based)
function renderResults(job, activeMeals, mode) {
  const totalDailyTarget = job.dailyCalories;
  let mealsHTML = '';

  // Render recipe mode: show selected recipes with descriptions
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
    // Render prep mode: show detailed ingredients, portions, and prep instructions
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
        : `<div class="prep-no-foods">⚠ Not enough food is available for this meal.</div>`;

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

  // Render common result header and content
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

// Navigate to a specific step in the workflow (1-5)
// Updates UI visibility, step indicator, and scroll position
function goTo(step, skipRender) {
  if (step === 4 && !skipRender) renderSec4();                       // Render recipes if needed
  // Show/hide sections and update step indicators
  for (let i = 1; i <= 5; i++) {
    document.getElementById('sec' + i).classList.toggle('visible', i === step);
    const s = document.getElementById('step' + i);
    s.classList.toggle('active', i === step);                       // Highlight active step
    s.classList.toggle('done', i < step);                           // Mark completed steps
  }
  state.step = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });                  // Scroll to top
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════
fetchFoodInventory();                                                // Load food inventory on startup