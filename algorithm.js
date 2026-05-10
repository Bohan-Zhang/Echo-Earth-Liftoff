
// INVENTORY FETCH
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

// Clean CSV values by stripping quotes and trimming whitespace
const cleanVal = v => v ? v.replace(/"/g,'').trim() : '';

// Fetch food inventory from the Google Sheet CSV and convert it into usable objects
async function fetchFoodInventory() { 
  setInvStatus('loading', 'Fetching inventory…'); // Show loading indicator while fetching
  try {
    const res  = await fetch(CSV_URL);
    const text = await res.text();
    const rows = text.trim().split('\n');

    state.foodInventory = rows.slice(1).map(row => {
      const vals = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      return {
        name:     cleanVal(vals[1]),
        calories: parseFloat(cleanVal(vals[2])) || 0,
        stock:    parseFloat(cleanVal(vals[3])) || 0
      };
    }).filter(f => f.name && f.calories > 0 && f.stock > 50); // Keep only valid inventory entries

    state.inventoryLoaded = true;
    setInvStatus('live', `${state.foodInventory.length} items in stock`);
  } catch(e) {
    setInvStatus('error', 'Inventory unavailable');
    console.warn('[Inventory] Could not load inventory:', e);
  }
}

// Update the inventory status indicator in the UI
function setInvStatus(status, text) {
  const dot = document.getElementById('invDot');
  document.getElementById('invText').textContent = text;
  dot.className = 'inv-dot';
  if (status === 'live')    { dot.classList.add('live'); }
  if (status === 'loading') { dot.classList.add('loading'); }
}

// CALORIE OPTIMISER
// Choose a set of foods for a single meal that approximates the target calories
function selectFoodsForMeal(pool, targetCals) {
  const foods    = [...pool].sort(() => Math.random() - 0.5); // Shuffle the inventory
  const selected = [];
  let   total    = 0;

  for (const food of foods) {
    const remaining = targetCals - total;
    if (remaining < 40) break; // Stop once we are close enough to the target

    const maxContrib = Math.min(remaining, targetCals * 0.40);  // Limit each ingredient's contribution
    const gNeeded    = Math.round((maxContrib / food.calories) * 100);
    const gUsed      = Math.min(gNeeded, food.stock, 350);      // Respect stock and max portion sizes
    if (gUsed < 30) continue;                                  // Skip tiny portions

    const cals = Math.round((gUsed * food.calories) / 100);
    if (cals < 30) continue;                                  // Skip low-calorie contributions

    selected.push({ name: food.name, gramsUsed: gUsed, cals, caloriesPer100g: food.calories });
    total += cals;
    if (total >= targetCals * 0.93) break;                     // Stop when close enough to target
  }
  return { foods: selected, totalCals: total };
}

// Build the prep plan for each active meal based on the selected job's daily calorie target
function generatePrep(job, activeMeals) {
  // If no inventory data is available, return empty meal plans with a shortage message
  if (!state.foodInventory.length) {
    return activeMeals.map(meal => ({
      meal, foods:[], totalCals:0,
      targetCals: Math.round(job.dailyCalories * (MEAL_RATIOS[meal] || 0.33)),
      method: 'Not enough food is available.'
    }));
  }

  // Clone inventory so selected quantities are deducted meal-by-meal.
  // This prevents breakfast selections from reusing stock needed for lunch and dinner.
  const inventory = state.foodInventory.map(item => ({ ...item }));
  const prepPlan = activeMeals.map(meal => {
    const ratio      = MEAL_RATIOS[meal] || (1 / activeMeals.length);
    const targetCals = Math.round(job.dailyCalories * ratio);
    const { foods, totalCals } = selectFoodsForMeal(inventory, targetCals);

    // Subtract used grams from inventory after each meal is planned.
    // Later meals will see the updated remaining stock.
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

  // Save the updated inventory back to state so any later rerolls use the reduced stock.
  state.foodInventory = inventory;
  return prepPlan;
}


// JOB GRID
// Render available job cards and apply search filtering

function renderJobs(filter = '') {
  const f = filter.toLowerCase();
  document.getElementById('jobGrid').innerHTML = JOBS
    .filter(j => j.name.toLowerCase().includes(f))
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

// Filter the job list as the user types
function filterJobs(v) { renderJobs(v); }

// Store the selected job and enable the next button
function selectJob(name) {
  state.job = name;
  renderJobs(document.getElementById('jobSearch').value);
  document.getElementById('nextBtn1').disabled = false;
}

// MEAL TOGGLES
function toggleMeal(meal) {
  const on = state.meals[meal];
  if (on && Object.values(state.meals).filter(Boolean).length <= 1) {
    document.getElementById('mealWarn').classList.add('visible'); return;
  }
  document.getElementById('mealWarn').classList.remove('visible');
  state.meals[meal] = !on;
  const t = document.getElementById('tog-' + meal);
  t.classList.toggle('on', !on);
  t.querySelector('.toggle-knob').textContent = !on ? '✓' : '';
}

// MODE SELECTION
function selectMode(mode) {
  state.mode = mode;
  document.getElementById('mode-recipe').classList.toggle('selected', mode === 'recipe');
  document.getElementById('mode-prep').classList.toggle('selected',   mode === 'prep');
  document.getElementById('nextBtn3').disabled = false;
}

// Handle the next action after mode selection
// Recipe mode advances to recipe browsing, prep mode generates an inventory-based plan
async function handleModeNext() {
  if (!state.mode) { alert('Please select a mode.'); return; }
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);

  if (state.mode === 'recipe') {
    goTo(4);
  } else {
    if (!state.inventoryLoaded) {
      const btn = document.getElementById('nextBtn3');
      btn.textContent = 'Loading stock…'; btn.disabled = true;
      await fetchFoodInventory();
      btn.textContent = 'Continue →'; btn.disabled = false;
    }
    state.prepPlan = generatePrep(job, active);
    renderResults(job, active, 'prep');
    goTo(5, true);
  }
}

// Navigate back one step in the workflow
function goBack() { goTo(state.mode === 'recipe' ? 4 : 3); }

// RECIPE BROWSER
// Render the recipe selection interface with optional country filters
function renderSec4() {
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  state.selections = { breakfast:null, lunch:null, dinner:null };
  const countries = [...new Set(RECIPES.map(r => r.origin))].sort();

  let h = `<div class="country-filters">
    <button class="country-btn active" onclick="filterCountry(this,'all')">All</button>
    ${countries.map(c => `<button class="country-btn" onclick="filterCountry(this,'${c.replace(/'/g,"\\'")}')"> ${c}</button>`).join('')}
  </div>`;

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

// Sanitize recipe names for safe HTML IDs by replacing non-alphanumeric characters
const san = s => s.replace(/[^a-zA-Z0-9]/g,'_');

// Handle recipe selection and update the selected state for the current meal
function selRec(meal, name) {
  state.selections[meal] = name;
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  active.forEach(m => {
    RECIPES.filter(r => r.mealTypes.includes(m)).forEach(r => {
      const el = document.getElementById(`rc-${m}-${san(r.name)}`);
      if (el) el.classList.toggle('selected', state.selections[m] === r.name);
    });
  });
  checkDone();
}

// Enable the next button only when all active meals have a selected recipe
function checkDone() {
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  document.getElementById('nextBtn4').disabled = !active.every(m => state.selections[m] !== null);
}

// Filter the recipe browser by country of origin
function filterCountry(btn, country) {
  document.querySelectorAll('.country-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  active.forEach(meal => {
    const g = document.getElementById('grid-'+meal); if (!g) return;
    g.querySelectorAll('.recipe-card').forEach(card => {
      const o = card.querySelector('.recipe-origin').textContent;
      card.style.display = (country==='all' || o===country || o.includes(country)) ? '' : 'none';
    });
  });
}

// Render the selected recipe-based plan and move to results
function buildRecipePlan() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  renderResults(job, active, 'recipe');
  goTo(5, true);
}

// Regenerate the inventory-based prep plan with a new random selection
function rerollPrep() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([,v]) => v).map(([k]) => k);
  state.prepPlan = generatePrep(job, active);
  renderResults(job, active, 'prep');
}

// Generate a calorie progress bar for the UI
function calBar(got, target) {
  const pct   = Math.min(Math.round((got / target) * 100), 100);
  const color = pct >= 90 ? 'var(--green)' : pct >= 65 ? 'var(--warn)' : 'var(--red)';
  return `<div class="cal-bar-wrap">
    <div class="cal-bar-track"><div class="cal-bar-fill" style="width:${pct}%;background:${color}"></div></div>
    <span class="cal-bar-label">${got.toLocaleString()} / ${target.toLocaleString()} kcal &nbsp;·&nbsp; ${pct}%</span>
  </div>`;
}


// RENDER RESULTS
// Build the final results page for either recipe or prep mode
function renderResults(job, activeMeals, mode) {
  let mealsHTML = '';

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
    const totalAchieved = state.prepPlan.reduce((s,p) => s + p.totalCals, 0);
    mealsHTML = '<div class="meals-output">';

    state.prepPlan.forEach(p => {
      const rows = p.foods.length
        ? p.foods.map(f => `
            <div class="prep-ing-row">
              <div class="prep-ing-name">${f.name}</div>
              <div class="prep-ing-portion">${f.gramsUsed} g</div>
              <div class="prep-ing-cals">${f.cals.toLocaleString()} kcal</div>
            </div>`).join('')
        : `<div class="prep-no-foods"> Not enough food is available.</div>`;

      // Show a shortage notice when some foods are available but the meal still falls short
      const shortageNotice = (p.foods.length > 0 && p.totalCals < p.targetCals)
        ? `<div class="prep-warning"> Not enough food is available to meet the meal target.</div>`
        : '';

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
              ${shortageNotice}
            </div>
            ${calBar(p.totalCals, p.targetCals)}
            <div class="prep-instructions"><b>How to prepare:</b> ${p.method}</div>
          </div>
        </div>`;
    });

    mealsHTML += `</div>
      <div class="daily-summary">
        <div class="daily-summary-title">Daily Calorie Total</div>
        ${calBar(totalAchieved, job.dailyCalories)}
        <div class="daily-summary-note">${activeMeals.length} meal${activeMeals.length>1?'s':''} planned &nbsp;·&nbsp; ${state.foodInventory.length} item${state.foodInventory.length!==1?'s':''} in stock</div>
      </div>
      <button class="btn btn-reroll" onclick="rerollPrep()">↻ Regenerate meal plan</button>`;
  }

  document.getElementById('resultContent').innerHTML = `
    <div class="result-hero">
      <div class="result-job">Shipboard Role</div>
      <div class="result-headline">${job.name}</div>
      <div class="result-sub">${job.activity} activity &nbsp;·&nbsp; ${job.dailyCalories.toLocaleString()} kcal/day target &nbsp;·&nbsp; ${activeMeals.length} meal${activeMeals.length>1?'s':''} &nbsp;·&nbsp; ${mode==='recipe'?'Legacy Earth Recipes':'Stock-Optimised Prep'}</div>
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

// NAVIGATION
function goTo(step, skipRender) {
  if (step === 4 && !skipRender) renderSec4();
  for (let i = 1; i <= 5; i++) {
    document.getElementById('sec'+i).classList.toggle('visible', i === step);
    const s = document.getElementById('step'+i);
    s.classList.toggle('active', i === step);
    s.classList.toggle('done',   i < step);
  }
  state.step = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// INIT
renderJobs();
fetchFoodInventory();   // pre-load in background