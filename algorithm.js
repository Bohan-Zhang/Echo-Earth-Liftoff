
// ═══════════════════════════════════════════════════════════════════
// INVENTORY FETCH
// ═══════════════════════════════════════════════════════════════════
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAaI-jNgHTQwfnVgHlYrwbQ3ic1DVIpRKWB7H1f3jFbac3HtqG56FfvJF9EdOkm07wn0XG25XvK45m/pub?output=csv';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuPPX5kU97FxfAA7FwpBc-EUjixvC823LjEOSmyc_JvtRxgd5aoufuQ_ZP0CJ21OJq/exec';


// The state is the user's progression in the food selection.

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

// Utility function to clean CSV values by removing quotes and whitespace
const cleanVal = v => v ? v.replace(/"/g,'').trim() : ''; 

// Fetch food inventory from Google Sheet CSV
// Parses CSV data and filters for valid food items with sufficient stock
async function fetchFoodInventory() { 
  setInvStatus('loading', 'Fetching inventory…');  // Show loading status 
  try {
    const res  = await fetch(CSV_URL);                                 // Fetch CSV from spreadsheet
    const text = await res.text();                                     // Convert to text
    const rows = text.trim().split('\n');                             // Split into rows

    // Parse CSV rows into food objects, extracting name, calories per 100g, and stock in grams
    state.foodInventory = rows.slice(1)                               // Skip header row
      .map(row => {
        const vals = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)$/);  // Safely split CSV preserving quoted values
        return {
          name:     cleanVal(vals[1]),                               // Food name (column 2)
          calories: parseFloat(cleanVal(vals[2])) || 0,             // Calories per 100g (column 3)
          stock:    parseFloat(cleanVal(vals[3])) || 0              // Stock in grams (column 4)
        };
      })
      .filter(f => f.name && f.calories > 0 && f.stock > 50);        // Keep only valid foods with >50g stock

    state.inventoryLoaded = true;
    setInvStatus('live', `${state.foodInventory.length} items in stock`);
  } catch(e) {
    setInvStatus('error', 'Inventory unavailable');
    console.warn('[ShipFuel] Could not load inventory:', e);
  }
}

// Update the inventory status indicator in the UI
// Shows loading/live/error state and descriptive text
function setInvStatus(status, text) {
  const dot = document.getElementById('invDot');
  document.getElementById('invText').textContent = text;               // Update status text
  dot.className = 'inv-dot';
  if (status === 'live')    { dot.classList.add('live'); }           // Green indicator
  if (status === 'loading') { dot.classList.add('loading'); }        // Loading spinner
}

// ═══════════════════════════════════════════════════════════════════
// CALORIE OPTIMISER
// ═══════════════════════════════════════════════════════════════════
// Select foods for a meal based on calorie target
// Uses random selection with constraints to create varied, realistic meal portions
function selectFoodsForMeal(pool, targetCals) {
  const foods    = [...pool].sort(() => Math.random() - 0.5);        // Randomize food order
  const selected = [];
  let   total    = 0;

  // Iterate through randomized food pool and add foods until target reached
  for (const food of foods) {
    const remaining = targetCals - total;
    if (remaining < 40) break;                                        // Stop if nearly at target

    // Calculate portion: max 40% of target per food to ensure variety
    const maxContrib = Math.min(remaining, targetCals * 0.40);
    const gNeeded    = Math.round((maxContrib / food.calories) * 100);
    const gUsed      = Math.min(gNeeded, food.stock, 350);            // Cap at 350g per food, limited by stock
    if (gUsed < 30) continue;                                          // Skip if portion too small

    const cals = Math.round((gUsed * food.calories) / 100);
    if (cals < 30) continue;                                          // Skip if calories too low

    // Add food to selected list with portion info
    selected.push({ name: food.name, gramsUsed: gUsed, cals, caloriesPer100g: food.calories });
    total += cals;
    if (total >= targetCals * 0.93) break;                             // Stop if >93% of target reached
  }
  return { foods: selected, totalCals: total };
}

// Generate a meal prep plan for active meals based on job and inventory
// Returns array of meals with optimized food selections and preparation methods
function generatePrep(job, activeMeals) {
  // Handle case where inventory is empty
  if (!state.foodInventory.length) {
    return activeMeals.map(meal => ({
      meal, foods:[],totalCals:0,
      targetCals: Math.round(job.dailyCalories * (MEAL_RATIOS[meal] || 0.33)),
      method: 'Not enough food is available to meet calorie target'
    }));
  }
  
  // Generate optimized meal plan for each active meal
  return activeMeals.map(meal => {
    const ratio      = MEAL_RATIOS[meal] || (1 / activeMeals.length);  // Get meal calorie ratio
    const targetCals = Math.round(job.dailyCalories * ratio);           // Calculate target calories for meal
    const { foods, totalCals } = selectFoodsForMeal(state.foodInventory, targetCals); // Select foods
    const method = METHODS[Math.floor(Math.random() * METHODS.length)];  // Pick random prep method
    return { meal, foods, totalCals, targetCals, method };
  });
}

// ═══════════════════════════════════════════════════════════════════
// JOB GRID
// ═══════════════════════════════════════════════════════════════════
// Render job cards in the UI with filtering
// Shows job name, calorie requirements, activity level, and description
function renderJobs(filter = '') {
  const f = filter.toLowerCase();
  document.getElementById('jobGrid').innerHTML = JOBS
    .filter(j => j.name.toLowerCase().includes(f))                   // Filter by search term
    .map(j => `
      <div class="job-card ${state.job === j.name ? 'selected' : ''}"
           onclick="selectJob('${j.name.replace(/'/g,"\\'")}')">
        <div class="job-name">${j.name}</div>
        <div class="job-stats">
          <span class="stat-pill calories-pill">⚡ ${j.dailyCalories.toLocaleString()} kcal</span>
          <span class="stat-pill activity-pill">${j.activity}</span>
        </div>
        <div class="job-desc">${j.description}</div>
      </div>`).join('');
}

// Filter jobs by search input value
function filterJobs(v) { renderJobs(v); }

// Handle job selection: update state and enable next button
function selectJob(name) {
  state.job = name;                                                   // Store selected job
  renderJobs(document.getElementById('jobSearch').value);             // Re-render with highlight
  document.getElementById('nextBtn1').disabled = false;               // Enable navigation
}

// ═══════════════════════════════════════════════════════════════════
// MEAL TOGGLES
// ═══════════════════════════════════════════════════════════════════
// Toggle meal on/off - prevents user from disabling all meals
function toggleMeal(meal) {
  const on = state.meals[meal];
  // Prevent disabling the last remaining meal
  if (on && Object.values(state.meals).filter(Boolean).length <= 1) {
    document.getElementById('mealWarn').classList.add('visible');    // Show warning
    return;
  }
  document.getElementById('mealWarn').classList.remove('visible');
  state.meals[meal] = !on;                                            // Toggle state
  const t = document.getElementById('tog-' + meal);
  t.classList.toggle('on', !on);                                     // Update toggle display
  t.querySelector('.toggle-knob').textContent = !on ? '✓' : '';      // Show/hide checkmark
}

// ═══════════════════════════════════════════════════════════════════
// MODE SELECTION
// ═══════════════════════════════════════════════════════════════════
// Select planning mode: 'recipe' (user selects from Earth recipes) or 'prep' (inventory-optimized)
function selectMode(mode) {
  state.mode = mode;                                                  // Store selected mode
  document.getElementById('mode-recipe').classList.toggle('selected', mode === 'recipe');  // Highlight selection
  document.getElementById('mode-prep').classList.toggle('selected',   mode === 'prep');
  document.getElementById('nextBtn3').disabled = false;               // Enable next button
}

// Handle navigation after mode selection
// Recipe mode: go to recipe selection (step 4)
// Prep mode: fetch inventory if needed, generate plan, and show results (step 5)
async function handleModeNext() {
  if (!state.mode) { alert('Please select a mode.'); return; }
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);  // Get active meals

  if (state.mode === 'recipe') {
    goTo(4);                                                           // Go to recipe selection
  } else {
    // Fetch inventory if not already loaded
    if (!state.inventoryLoaded) {
      const btn = document.getElementById('nextBtn3');
      btn.textContent = 'Loading stock…'; btn.disabled = true;
      await fetchFoodInventory();                                    // Load food data from sheet
      btn.textContent = 'Continue →'; btn.disabled = false;
    }
    state.prepPlan = generatePrep(job, active);                      // Generate optimized meal plan
    renderResults(job, active, 'prep');                              // Render results
    goTo(5, true);                                                   // Show results page
  }
}

// Navigate back: go to recipe selection or mode selection based on current mode
function goBack() { goTo(state.mode === 'recipe' ? 4 : 3); }

// ═══════════════════════════════════════════════════════════════════
// RECIPE BROWSER
// ═══════════════════════════════════════════════════════════════════
// Render section 4: Recipe selection browser with country filters
// Display available recipes grouped by meal type with filtering options
function renderSec4() {
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  state.selections = { breakfast:null, lunch:null, dinner:null };    // Reset previous selections
  const countries = [...new Set(RECIPES.map(r => r.origin))].sort(); // Extract and sort unique countries

  // Build country filter buttons
  let h = `<div class="country-filters">
    <button class="country-btn active" onclick="filterCountry(this,'all')">All</button>
    ${countries.map(c => `<button class="country-btn" onclick="filterCountry(this,'${c.replace(/'/g,"\\'")}')"> ${c}</button>`).join('')}
  </div>`;

  // Build recipe grid for each active meal
  active.forEach(meal => {
    h += `<div class="meal-slot-label">${meal.charAt(0).toUpperCase()+meal.slice(1)}</div>
          <div class="recipe-grid" id="grid-${meal}">`;
    RECIPES.filter(r => r.mealTypes.includes(meal)).forEach(r => {
      h += `<div class="recipe-card" id="rc-${meal}-${san(r.name)}" onclick="selRec('${meal}','${r.name.replace(/'/g,"\\'")}')">
              <span class="recipe-flag">${r.flag}</span>
              <div class="recipe-info">
                <div class="recipe-name">${r.name}</div>
                <div class="recipe-origin">${r.origin}</div>
                <div class="recipe-adapt">${r.tags.slice(0,3).map(t=>`<span class="adapt-tag">${t}</span>`).join('')}</div>
              </div>
            </div>`;
    });
    h += `</div>`;
  });
  document.getElementById('sec4Content').innerHTML = h;
  checkDone();
}

// Sanitize strings for use as HTML IDs (replace non-alphanumeric characters with underscore)
const san = s => s.replace(/[^a-zA-Z0-9]/g,'_');

// Handle recipe selection for a meal
// Update visual selection state and check if all meals have recipes selected
function selRec(meal, name) {
  state.selections[meal] = name;                                    // Store recipe selection
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
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
// Enables next button only when all meals have recipes selected
function checkDone() {
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  document.getElementById('nextBtn4').disabled = !active.every(m => state.selections[m] !== null);
}

// Filter recipe display by country of origin
function filterCountry(btn, country) {
  document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');                                      // Highlight active filter button
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  // Show/hide recipe cards based on country filter
  active.forEach(meal => {
    const g = document.getElementById('grid-'+meal); if (!g) return;
    g.querySelectorAll('.recipe-card').forEach(card => {
      const o = card.querySelector('.recipe-origin').textContent;
      card.style.display = (country==='all' || o===country || o.includes(country)) ? '' : 'none';
    });
  });
}

// Build and display the final recipe plan from user selections
function buildRecipePlan() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  renderResults(job, active, 'recipe');                             // Show recipe plan
  goTo(5, true);                                                    // Go to results
}

// ═══════════════════════════════════════════════════════════════════
// REROLL
// ═══════════════════════════════════════════════════════════════════
// Regenerate prep plan with different random food selections
// Allows user to get alternative meal combinations without changing settings
function rerollPrep() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  state.prepPlan = generatePrep(job, active);                       // Generate new plan
  renderResults(job, active, 'prep');                               // Update display
}

// ═══════════════════════════════════════════════════════════════════
// CALORIE BAR HELPER
// ═══════════════════════════════════════════════════════════════════
// Generate HTML for calorie progress bar
// Color-coded: green (90%+), yellow (65-89%), red (<65% of target)
function calBar(got, target) {
  const pct   = Math.min(Math.round((got / target) * 100), 100);
  // Determine bar color based on achievement percentage
  const color = pct >= 90 ? 'var(--green)' : pct >= 65 ? 'var(--warn)' : 'var(--red)';
  return `<div class="cal-bar-wrap">
    <div class="cal-bar-track"><div class="cal-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    <span class="cal-bar-label">${got.toLocaleString()} / ${target.toLocaleString()} kcal &nbsp;·&nbsp; ${pct}%</span>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// RENDER RESULTS
// ═══════════════════════════════════════════════════════════════════
// Render final meal plan results
// Supports two modes: 'recipe' (user-selected recipes) and 'prep' (inventory-optimized)
function renderResults(job, activeMeals, mode) {
  let mealsHTML = '';

  // Render recipe mode: show selected recipes with descriptions and ingredients
  if (mode === 'recipe') {
    mealsHTML = '<div class="meals-output">';
    activeMeals.forEach(meal => {
      const r = RECIPES.find(x => x.name === state.selections[meal]); if (!r) return;
      mealsHTML += `
        <div class="meal-result">
          <div class="meal-result-header">
            <span class="meal-time-badge ${meal}">${meal}</span>
            <span class="meal-result-name">${r.flag} ${r.name}</span>
            <span style="margin-left:auto;font-size:11px;color:var(--text3)">${r.origin}</span>
          </div>
          <div class="meal-result-body">
            <div class="ingredient-list">${r.tags.map(t=>`<span class="ing-chip">${t}</span>`).join('')}</div>
            <div class="meal-why"><span>★ Why this works</span>${r.why}</div>
          </div>
        </div>`;
    });
    mealsHTML += '</div>';

  } else {
    // Render prep mode: show detailed ingredients, portions, and preparation instructions
    const totalAchieved = state.prepPlan.reduce((s,p) => s + p.totalCals, 0);  // Calculate total calories
    mealsHTML = '<div class="meals-output">';

    // Build HTML for each meal in the prep plan
    state.prepPlan.forEach(p => {
      // Create ingredient rows or show empty state if no foods available
      const rows = p.foods.length
        ? p.foods.map(f => `
            <div class="prep-ing-row">
              <div class="prep-ing-name">${f.name}</div>
              <div class="prep-ing-portion">${f.gramsUsed} g</div>
              <div class="prep-ing-cals">${f.cals.toLocaleString()} kcal</div>
            </div>`).join('')
        : `<div class="prep-no-foods"> Not enough food is available for this meal.</div>`;

      // Build meal card with ingredients, calorie bar, and prep instructions
      mealsHTML += `
        <div class="prep-result-card">
          <div class="prep-result-header">
            <span class="meal-time-badge ${p.meal}">${p.meal}</span>
            <span class="prep-auto-label">Stock-optimised</span>
            <span class="meal-calorie-target">Target: ${p.targetCals.toLocaleString()} kcal</span>
          </div>
          <div class="prep-body">
            <div class="prep-section">
              <div class="prep-section-title">Ingredients &amp; Portions</div>
              ${rows}
            </div>
            ${calBar(p.totalCals, p.targetCals)}
            <div class="prep-instructions"><b>How to prepare:</b> ${p.method}</div>
          </div>
        </div>`;
    });

    // Show daily summary with total calories and reroll button
    mealsHTML += `</div>
      <div class="daily-summary">
        <div class="daily-summary-title">Daily Calorie Total</div>
        ${calBar(totalAchieved, job.dailyCalories)}
        <div class="daily-summary-note">${activeMeals.length} meal${activeMeals.length>1?'s':''} planned &nbsp;·&nbsp; ${state.foodInventory.length} item${state.foodInventory.length!==1?'s':''} in stock</div>
      </div>
      <button class="btn btn-reroll" onclick="rerollPrep()">↻ Regenerate meal plan</button>`;
  }

  // Render complete results page with header and meal plan
  document.getElementById('resultContent').innerHTML = `
    <div class="result-hero">
      <div class="result-job">Shipboard Role</div>
      <div class="result-headline">${job.name}</div>
      <div class="result-sub">${job.activity} activity &nbsp;·&nbsp; ${job.dailyCalories.toLocaleString()} kcal/day target &nbsp;·&nbsp; ${activeMeals.length} meal${activeMeals.length>1?'s':''} &nbsp;·&nbsp; ${mode==='recipe'?'Legacy Earth Recipes':'Stock-Optimised Prep'}</div>
      <!-- Display calorie breakdown by meal -->
      <div class="calorie-summary-strip">
        <div class="csb-item">
          <div class="csb-label">Daily Target</div>
          <div class="csb-value">${job.dailyCalories.toLocaleString()}</div>
        </div>
        ${Object.entries(MEAL_RATIOS).filter(([m])=>activeMeals.includes(m)).map(([m,r])=>`
          <div class="csb-item">
            <div class="csb-label">${m.charAt(0).toUpperCase()+m.slice(1)}</div>
            <div class="csb-value">${Math.round(job.dailyCalories*r).toLocaleString()}</div>
          </div>`).join('')}
      </div>
    </div>
    ${mealsHTML}`;
}

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════
// Navigate to a specific step in the workflow (1-5)
// Updates UI visibility, step indicators, and scrolls to top
function goTo(step, skipRender) {
  if (step === 4 && !skipRender) renderSec4();                       // Render recipes if navigating to step 4
  // Show/hide sections and update step indicators
  for (let i = 1; i <= 5; i++) {
    document.getElementById('sec'+i).classList.toggle('visible', i === step);
    const s = document.getElementById('step'+i);
    s.classList.toggle('active', i === step);                       // Highlight current step
    s.classList.toggle('done',   i < step);                         // Mark completed steps
  }
  state.step = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });                  // Scroll to top
}

// ═══════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════
// Initialize the application
renderJobs();                                                         // Show job options on load
fetchFoodInventory();                                                 // Pre-load inventory in background