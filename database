const SHEET_URL = 'https://docs.google.com/spreadsheets/d/12rAnFoHSJT4LALMViu6JvtZjGFMbR-o4u2EZ53gWeng/edit?usp=sharing';

const LOCAL_FOODS = [
  { id:  1, name: 'Spirulina Algae',          calories:  290, stock: 120, category: 'Algae',              origin: 'Natural',    form: 'Whole',     tags: ['protein','superfood','vegan'] },
  { id:  2, name: 'Chlorella Algae',           calories:  255, stock:  95, category: 'Algae',              origin: 'Natural',    form: 'Whole',     tags: ['detox','protein','vegan'] },
  { id:  3, name: 'Seaweed Sheets',            calories:   35, stock: 200, category: 'Algae',              origin: 'Natural',    form: 'Processed', tags: ['iodine','minerals','vegan'] },
  { id:  4, name: 'Algae Oil',                 calories:  884, stock:  60, category: 'Algae',              origin: 'Derived',    form: 'Extract',   tags: ['omega-3','vegan','oil'] },
  { id:  5, name: 'Mycoprotein Fungi',         calories:  100, stock: 150, category: 'Fungi',              origin: 'Natural',    form: 'Whole',     tags: ['protein','fiber','meat-alt'] },
  { id:  6, name: 'Mushrooms',                 calories:   22, stock: 300, category: 'Fungi',              origin: 'Natural',    form: 'Whole',     tags: ['umami','immune','vegan'] },
  { id:  7, name: 'Yeast Cultures',            calories:  325, stock:  80, category: 'Fungi',              origin: 'Cultured',   form: 'Culture',   tags: ['b12','fermentation','vegan'] },
  { id:  8, name: 'Hydroponic Potatoes',       calories:   77, stock: 400, category: 'Vegetables',         origin: 'Hydroponic', form: 'Whole',     tags: ['carbs','starch','vegan'] },
  { id:  9, name: 'Hydroponic Lettuce',        calories:   15, stock: 500, category: 'Vegetables',         origin: 'Hydroponic', form: 'Whole',     tags: ['fiber','water','vegan'] },
  { id: 10, name: 'Spinach',                   calories:   23, stock: 350, category: 'Vegetables',         origin: 'Natural',    form: 'Whole',     tags: ['iron','calcium','vegan'] },
  { id: 11, name: 'Kale',                      calories:   49, stock: 280, category: 'Vegetables',         origin: 'Natural',    form: 'Whole',     tags: ['vitamins','antioxidant','vegan'] },
  { id: 12, name: 'Tomatoes',                  calories:   18, stock: 420, category: 'Vegetables',         origin: 'Natural',    form: 'Whole',     tags: ['lycopene','antioxidant','vegan'] },
  { id: 13, name: 'Bell Peppers',              calories:   31, stock: 310, category: 'Vegetables',         origin: 'Natural',    form: 'Whole',     tags: ['vitamin-c','antioxidant','vegan'] },
  { id: 14, name: 'Onions',                    calories:   40, stock: 600, category: 'Vegetables',         origin: 'Natural',    form: 'Whole',     tags: ['prebiotic','sulfur','vegan'] },
  { id: 15, name: 'Garlic',                    calories:  149, stock: 450, category: 'Vegetables',         origin: 'Natural',    form: 'Whole',     tags: ['antimicrobial','allicin','vegan'] },
  { id: 16, name: 'Herbs',                     calories:   40, stock: 200, category: 'Vegetables',         origin: 'Natural',    form: 'Whole',     tags: ['flavor','micronutrients','vegan'] },
  { id: 17, name: 'Sweet Potatoes',            calories:   86, stock: 380, category: 'Root Crops',         origin: 'Natural',    form: 'Whole',     tags: ['beta-carotene','carbs','vegan'] },
  { id: 18, name: 'Soybeans',                  calories:  173, stock: 250, category: 'Legumes',            origin: 'Natural',    form: 'Whole',     tags: ['protein','complete','vegan'] },
  { id: 19, name: 'Lentils',                   calories:  116, stock: 320, category: 'Legumes',            origin: 'Natural',    form: 'Whole',     tags: ['protein','fiber','vegan'] },
  { id: 20, name: 'Chickpeas',                 calories:  164, stock: 290, category: 'Legumes',            origin: 'Natural',    form: 'Whole',     tags: ['protein','iron','vegan'] },
  { id: 21, name: 'Fermented Soy Paste',       calories:  199, stock: 140, category: 'Legumes',            origin: 'Fermented',  form: 'Processed', tags: ['probiotic','umami','vegan'] },
  { id: 22, name: 'Rice',                      calories:  130, stock: 700, category: 'Grains',             origin: 'Natural',    form: 'Whole',     tags: ['carbs','gluten-free','vegan'] },
  { id: 23, name: 'Quinoa',                    calories:  120, stock: 260, category: 'Grains',             origin: 'Natural',    form: 'Whole',     tags: ['protein','complete','vegan'] },
  { id: 24, name: 'Oats',                      calories:  389, stock: 340, category: 'Grains',             origin: 'Natural',    form: 'Whole',     tags: ['fiber','beta-glucan','vegan'] },
  { id: 25, name: 'Lab-Grown Chicken Cells',   calories:  165, stock:  40, category: 'Cultivated Meat',    origin: 'Lab-Grown',  form: 'Culture',   tags: ['protein','cellular-ag','cruelty-free'] },
  { id: 26, name: 'Cultured Fish Cells',       calories:  136, stock:  35, category: 'Cultivated Meat',    origin: 'Lab-Grown',  form: 'Culture',   tags: ['protein','omega-3','sustainable'] },
  { id: 27, name: 'Synthetic Egg Protein',     calories:  380, stock:  70, category: 'Synthetic Proteins', origin: 'Synthetic',  form: 'Extract',   tags: ['protein','precision-fermentation'] },
  { id: 28, name: 'Insect Protein Flour',      calories:  409, stock:  90, category: 'Insect Protein',     origin: 'Natural',    form: 'Processed', tags: ['protein','sustainable','high-bioavailability'] },
  { id: 29, name: 'Nuts',                      calories:  607, stock: 180, category: 'Nuts & Seeds',       origin: 'Natural',    form: 'Whole',     tags: ['fats','vitamin-e','vegan'] },
  { id: 30, name: 'Seeds',                     calories:  560, stock: 160, category: 'Nuts & Seeds',       origin: 'Natural',    form: 'Whole',     tags: ['omega-3','zinc','vegan'] },
  { id: 31, name: 'Synthetic Dairy Base',      calories:  310, stock:  55, category: 'Synthetic Proteins', origin: 'Synthetic',  form: 'Processed', tags: ['protein','dairy-free','casein'] },
  { id: 32, name: 'Fruit Cell Cultures',       calories:   60, stock:  25, category: 'Cultivated Produce', origin: 'Lab-Grown',  form: 'Culture',   tags: ['vitamins','emerging-tech','vegan'] },
  { id: 33, name: 'Electrolyte Mineral Mix',   calories:    5, stock: 110, category: 'Supplements',        origin: 'Synthetic',  form: 'Extract',   tags: ['sodium','potassium','magnesium'] },
];

function parseCSV(csvText) {
  const rows = csvText.trim().split('\n');
  const headers = rows[0].split(',');

  return rows.slice(1).map(row => {
    const values = row.split(',');
    return {
      id:       parseInt(values[0]),
      name:     values[1],
      calories: parseInt(values[2]),
      stock:    parseInt(values[3]),
      category: values[4] || 'Uncategorized',
      origin:   values[5] || 'Unknown',
      form:     values[6] || 'Whole',
      tags:     values[7] ? values[7].split('|') : [],
    };
  });
}
async function getFoods() {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csvText = await response.text();
    console.log('Loaded from Google Sheet');
    return parseCSV(csvText);
  } catch (err) {
    console.warn('Sheet unavailable, using local food data:', err.message);
    return LOCAL_FOODS;
  }
}
function renderFood(food) {
  const lowStock = food.stock < 50;
  document.body.innerHTML += `
    <div class="food-card" data-category="${food.category}" data-id="${food.id}">
      <div class="food-name">${food.name}</div>
      <div class="food-meta">
        <span>🔥 ${food.calories} kcal</span>
        <span class="${lowStock ? 'low-stock' : ''}">
          📦 Stock: ${food.stock}${lowStock ? ' ⚠️' : ''}
        </span>
      </div>
      <div class="food-category">${food.category} · ${food.origin} · ${food.form}</div>
      <div class="food-tags">${food.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
  `;
}
getFoods().then(foods => {
  console.log(`Loaded ${foods.length} foods`);
  console.table(foods);

  foods.forEach(food => renderFood(food));

  const veganProtein = foods.filter(f =>
    f.tags.includes('vegan') && f.tags.includes('protein')
  );
  console.log('Vegan + protein foods:', veganProtein.map(f => f.name));

  const lowStock = foods.filter(f => f.stock < 50);
  console.log('Low stock alert:', lowStock.map(f => `${f.name} (${f.stock})`));
});
