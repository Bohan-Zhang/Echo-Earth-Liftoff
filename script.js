// ═══════════════════════════════════════════════════════════════════════════════
// DATA & STATE
// ═══════════════════════════════════════════════════════════════════════════════

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAaI-jNgHTQwfnVgHlYrwbQ3ic1DVIpRKWB7H1f3jFbac3HtqG56FfvJF9EdOkm07wn0XG25XvK45m/pub?output=csv';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuPPX5kU97FxfAA7FwpBc-EUjixvC823LjEOSmyc_JvtRxgd5aoufuQ_ZP0CJ21OJq/exec';
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

// Utility: clean CSV cells by stripping quotes and trimming whitespace
const cleanVal = (val) => val ? val.replace(/"/g, '').trim() : '';

// Load the food inventory from CSV and store it in state
async function refreshInventory() {
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

    state.inventoryLoaded = true;
    console.log("Inventory synced with Google Sheets.");
    return true;
  } catch (e) {
    console.error("Sync failed:", e);
    return false;
  }
}
async function changeStock(foodName, amount) {
    try {
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                action: "updateStock",
                name: foodName,
                amount: amount
            })
        });
        console.log(`[Sync] Sent -${amount}g update for ${foodName}`);
    } catch (e) {
        console.error("Database sync failed", e);
    }
}

// ============================================================================
// CALORIE OPTIMISER
// ============================================================================

// Select foods for a meal based on the calorie target and available stock

function selectFoodsForMeal(availableFoods, targetCals) {
  // OPTIMIZATION: Sort by stock descending. 
  // This uses items you have the most of first.
  const pool = [...availableFoods].sort((a, b) => b.stock - a.stock);

  const selected = [];
  let totalCals = 0;

  for (const food of pool) {
    let remaining = targetCals - totalCals;
    if (remaining < 20) break; // Efficiency: Stop if we are essentially at the goal

    // Logic: Calculate how much of this specific food to use to hit the target
    // We want to get as close to the target as possible using the high-stock items
    let gramsNeeded = Math.round((remaining / food.calories) * 100);
    
    // Safety check: Don't take more than we have, and don't make a portion huge (>500g)
    let gramsUsed = Math.min(gramsNeeded, food.stock, 500);

    if (gramsUsed < 10) continue; 

    let calsFromFood = Math.round((gramsUsed * food.calories) / 100);

    selected.push({
      name: food.name,
      gramsUsed: gramsUsed,
      cals: calsFromFood
    });

    totalCals += calsFromFood;
    
    // If we've reached 98% of the target, we consider this "The Optimal Meal"
    if (totalCals >= targetCals * 0.98) break;
  }

  return { foods: selected, totalCals };
}

// Generate the prep plan for active meals using the available inventory
async function generatePrep(job, activeMeals) {
  const inStock = state.foodInventory;
  const inventory = inStock.map(item => ({ ...item }));

  const plan = activeMeals.map(meal => {
    const ratio = MEAL_RATIOS[meal] || (1 / activeMeals.length);
    const targetCals = Math.round(job.dailyCalories * ratio);
    const { foods, totalCals } = selectFoodsForMeal(inventory, targetCals);

    // Update local inventory and fire off database updates
    foods.forEach(f => {
      const stockItem = inventory.find(i => i.name === f.name);
      if (stockItem) {
        stockItem.stock -= f.gramsUsed;
        // Fire the update but don't 'await' it here to keep the UI fast
        changeStock(f.name, -f.gramsUsed); 
      }
    });

    return { 
      meal, 
      foods, 
      totalCals, 
      targetCals, 
      method: METHODS[Math.floor(Math.random() * METHODS.length)] 
    };
  });

  state.foodInventory = inventory;
  return plan;
}




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
// Add 'async' here
async function handleModeNext() {
  console.log("Mode Next Clicked! Current Mode:", state.mode);

  if (state.mode === 'recipe') { 
    goTo(4); 
  } else if (state.mode === 'prep') {
    const job = JOBS.find(j => j.name === state.job);
    const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
    
    // Add 'await' here so it finishes the spreadsheet updates before moving on
    state.prepPlan = await generatePrep(job, active);
    
    renderResults(job, active, 'prep');
    goTo(5, true); // This moves you to the results page
  } else {
    alert("Please select a mode first!");
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
async function buildRecipePlan() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  
  // Always refresh inventory from Google Sheet to get latest stock levels
  const statusDiv = document.getElementById('sec4Content');
  const originalHTML = statusDiv.innerHTML;
  statusDiv.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text3);">Refreshing inventory from server...</div>';
  
  await refreshInventory();
  
  statusDiv.innerHTML = originalHTML;
  
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

// Refresh inventory and re-render recipe results
async function refreshAndRerenderRecipes() {
  const job    = JOBS.find(j => j.name === state.job);
  const active = Object.entries(state.meals).filter(([, v]) => v).map(([k]) => k);
  
  // Show loading state
  const refreshBtn = event.target;
  const originalText = refreshBtn.textContent;
  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Refreshing...';
  
  try {
    await refreshInventory();
    renderResults(job, active, 'recipe');
  } catch (error) {
    console.error('Error refreshing inventory:', error);
    alert('Failed to refresh inventory');
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = originalText;
  }
}

// Check if a recipe can be made with current inventory
// Returns { canMake: boolean, missingIngredients: [], totalCalories: number }
function canMakeMeal(recipe) {
  const missingIngredients = [];
  let totalCalories = 0;
  
  if (!state.foodInventory || state.foodInventory.length === 0) {
    return {
      canMake: false,
      missingIngredients: Object.keys(recipe.ingredients || {}),
      totalCalories: 0
    };
  }

  // Convert recipe ingredient keys (snake_case) to match inventory names
  for (const [ingredientKey, requiredAmount] of Object.entries(recipe.ingredients || {})) {
    // Try to find ingredient in inventory (convert snake_case to space-separated)
    const ingredientName = ingredientKey.replace(/_/g, ' ').toLowerCase();
    
    const inventoryItem = state.foodInventory.find(item => 
      item.name.toLowerCase().includes(ingredientName) ||
      ingredientName.includes(item.name.toLowerCase())
    );

    if (!inventoryItem) {
      missingIngredients.push({ ingredient: ingredientKey, required: requiredAmount, available: 0 });
    } else if (inventoryItem.stock < requiredAmount) {
      missingIngredients.push({ 
        ingredient: ingredientKey, 
        required: requiredAmount, 
        available: inventoryItem.stock 
      });
    } else {
      // Calculate calories for this ingredient
      // inventoryItem.calories is per 100g, requiredAmount is in grams
      const ingredientCalories = (requiredAmount / 100) * inventoryItem.calories;
      totalCalories += ingredientCalories;
    }
  }

  return {
    canMake: missingIngredients.length === 0,
    missingIngredients,
    totalCalories: Math.round(totalCalories)
  };
}

// Make a meal from a recipe: deduct ingredients and sync with server
// Returns { success: boolean, message: string, mealName: string }
async function makeMeal(recipe) {
  // First check if meal can be made
  const checkResult = canMakeMeal(recipe);
  
  if (!checkResult.canMake) {
    const missingList = checkResult.missingIngredients
      .map(m => `${m.ingredient} (need ${m.required}g, have ${m.available}g)`)
      .join(', ');
    return {
      success: false,
      message: `Not enough ingredients to make ${recipe.name}. Missing: ${missingList}`,
      mealName: recipe.name
    };
  }

  try {
    // Update inventory by deducting ingredients
    const updates = [];
    
    for (const [ingredientKey, requiredAmount] of Object.entries(recipe.ingredients || {})) {
      const ingredientName = ingredientKey.replace(/_/g, ' ').toLowerCase();
      
      const inventoryIndex = state.foodInventory.findIndex(item => 
        item.name.toLowerCase().includes(ingredientName) ||
        ingredientName.includes(item.name.toLowerCase())
      );

      if (inventoryIndex !== -1) {
        const inventoryItem = state.foodInventory[inventoryIndex];
        
        // Deduct from local state
        state.foodInventory[inventoryIndex].stock = Math.max(
          inventoryItem.stock - requiredAmount, 
          0
        );

        // Prepare sync request to server
        updates.push({
          name: inventoryItem.name,
          amount: -requiredAmount // Negative to reduce stock
        });
      }
    }

    // Sync all inventory changes with server
    for (const update of updates) {
      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({
            action: 'updateStock',
            name: update.name,
            amount: update.amount
          })
        });
      } catch (e) {
        console.warn(`Failed to sync ${update.name} with server:`, e);
      }
    }

    return {
      success: true,
      message: `✓ Successfully made ${recipe.name}! Ingredients deducted from inventory.`,
      mealName: recipe.name,
      ingredientsUsed: Object.entries(recipe.ingredients).map(([k, v]) => ({
        ingredient: k,
        amount: v
      }))
    };
  } catch (error) {
    console.error('Error making meal:', error);
    return {
      success: false,
      message: `Error making ${recipe.name}: ${error.message}`,
      mealName: recipe.name
    };
  }
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
async function prepareMeal(recipeName, recipeCalories) {
  const recipe = RECIPES.find(r => r.name === recipeName);
  if (!recipe) {
    alert('Recipe not found');
    return;
  }

  // Ask user for desired calories
  const desiredCalories = prompt(`${recipe.name} provides ${recipeCalories} kcal.\n\nHow many calories do you want to consume? (Enter number or press Cancel to use full amount)`, recipeCalories);
  
  if (desiredCalories === null) return; // User cancelled
  
  const userCalories = parseInt(desiredCalories);
  if (isNaN(userCalories) || userCalories <= 0) {
    alert('Please enter a valid calorie amount');
    return;
  }

  // Show loading state
  const btn = event.target;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Making meal...';

  try {
    // Make the meal
    const result = await makeMeal(recipe);

    // Show result message
    const statusClass = result.success ? 'success' : 'error';
    const calorieInfo = result.success ? `<div class="calorie-info">Expected calories: ${recipeCalories} kcal | Consumed: ${userCalories} kcal</div>` : '';
    const resultHTML = `
      <div class="meal-result-notification ${statusClass}">
        <div class="notification-icon">${result.success ? '✓' : '✗'}</div>
        <div class="notification-message">${result.message}</div>
        ${calorieInfo}
        ${result.ingredientsUsed ? `
          <div class="ingredients-deducted">
            <div class="deducted-title">Ingredients deducted:</div>
            ${result.ingredientsUsed.map(ing => `<div class="deducted-item">• ${ing.ingredient}: -${ing.amount}g</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // Insert notification before the meals output
    const mealsOutput = document.querySelector('.meals-output');
    if (mealsOutput) {
      const notification = document.createElement('div');
      notification.innerHTML = resultHTML;
      mealsOutput.parentNode.insertBefore(notification.firstChild, mealsOutput);
    }

    // Update button state
    if (result.success) {
      btn.classList.add('completed');
      btn.textContent = '✓ Meal prepared';
      btn.disabled = true;
    } else {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  } catch (error) {
    console.error('Error preparing meal:', error);
    btn.disabled = false;
    btn.textContent = originalText;
    alert('Error preparing meal: ' + error.message);
  }
}

// Render the full results page for either recipe or prep mode
function renderResults(job, activeMeals, mode) {
  const totalDailyTarget = job.dailyCalories;
  let mealsHTML = '';

  if (mode === 'recipe') {
    mealsHTML = '<div class="meals-output">';
    mealsHTML += `
      <div class="inventory-refresh-notice">
        <div class="refresh-notice-text">Inventory synced from Google Sheets</div>
        <button class="refresh-btn" onclick="refreshAndRerenderRecipes()">↻ Refresh Stock</button>
      </div>
    `;
    activeMeals.forEach(meal => {
      const r = RECIPES.find(x => x.name === state.selections[meal]);
      if (!r) return;
      
      // Check if recipe can be made with current inventory
      const checkResult = canMakeMeal(r);
      const canMake = checkResult.canMake;
      const statusClass = canMake ? 'can-make' : 'cannot-make';
      const statusIcon = canMake ? '✓' : '✗';
      const statusText = canMake ? 'Ready to prepare' : 'Insufficient ingredients';
      const totalCalories = checkResult.totalCalories;
      
      let ingredientDetails = `<div class="ingredient-list">${r.tags.map(t=>`<span class="ing-chip">${t}</span>`).join('')}</div>`;
      
      // Show ingredient requirements and availability
      if (!canMake && checkResult.missingIngredients.length > 0) {
        const missingInfo = checkResult.missingIngredients
          .map(m => `<div class="missing-ingredient">${m.ingredient}: need ${m.required}g, have ${m.available}g</div>`)
          .join('');
        ingredientDetails += `<div class="missing-ingredients-box">${missingInfo}</div>`;
      }

      const makeButtonHTML = canMake 
        ? `<button class="make-meal-btn" onclick="prepareMeal('${r.name.replace(/'/g,"\\'")}', ${totalCalories})">Make Meal</button>`
        : `<button class="make-meal-btn disabled" disabled>Cannot Make</button>`;
      
      mealsHTML += `
        <div class="meal-result ${statusClass}">
          <div class="meal-result-header">
            <span class="meal-time-badge ${meal}">${meal}</span>
            <span class="meal-result-name">${r.flag} ${r.name}</span>
            <span class="meal-status-badge ${statusClass}">${statusIcon} ${statusText}</span>
            <span style="margin-left:auto;font-size:11px;color:var(--text3)">${r.origin}</span>
          </div>
          <div class="meal-result-body">
            ${ingredientDetails}
            
            ${canMake ? `<div class="recipe-calories"><strong>Calories provided:</strong> ${totalCalories} kcal</div>` : ''}
            <div class="meal-action">${makeButtonHTML}</div>
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
document.addEventListener('DOMContentLoaded', () => {
    refreshInventory();
    renderJobs();
});