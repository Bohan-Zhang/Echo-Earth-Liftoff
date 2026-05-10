const MEAL_RATIOS = { breakfast: 0.25, lunch: 0.35, dinner: 0.40 };

const JOBS = [
  { name: "EVA Engineer",             dailyCalories: 3800, activity: "Extreme",      description: "Extravehicular activity, hull repairs, and external construction in vacuum." },
  { name: "Construction Specialist",  dailyCalories: 3600, activity: "Very Heavy",   description: "Structural assembly, welding, and heavy fabrication tasks aboard and outside the ship." },
  { name: "Mining Specialist",        dailyCalories: 3700, activity: "Very Heavy",   description: "Drilling, extraction, and raw material processing in low-gravity environments." },
  { name: "Security Officer",         dailyCalories: 3000, activity: "Heavy",        description: "Patrol, emergency response, and crew safety enforcement across all decks." },
  { name: "Technician",               dailyCalories: 2900, activity: "Moderate",     description: "Systems maintenance, diagnostics, and equipment repair throughout the vessel." },
  { name: "Medical Officer",          dailyCalories: 2400, activity: "Light",        description: "Medical consultations, surgery support, and crew health monitoring." },
  { name: "AI Systems Operator",      dailyCalories: 2200, activity: "Sedentary",    description: "Oversight and management of onboard AI systems, data pipelines, and automation." },
  { name: "Pilot / Navigator",        dailyCalories: 2600, activity: "Light",        description: "Flight operations, course plotting, and real-time navigation of the vessel." },
  { name: "Ship Teacher",             dailyCalories: 2200, activity: "Sedentary",    description: "Education and cognitive development programs for crew and any dependants aboard." }
];




 const RECIPES = [

  // ── BREAKFAST ──────────────────────────────────────────────────────────────

  {
    flag: "🌿",
    name: "Spirulina Protein Bowl",
    origin: "Space Station",
    tags: ["Spirulina Algae", "Rice", "Seeds (Chia/Flax)", "Miso Paste"],
    ingredients: {
      "Spirulina Algae":    15,
      "Rice":              150,
      "Seeds (Chia/Flax)":  30,
      "Miso Paste":         20
    },
    why: "A nutrient-dense algae and grain bowl — spirulina delivers complete protein and chlorophyll in one of the smallest possible portions.",
    mealTypes: ["breakfast"]
  },

  {
    flag: "🇮🇳",
    name: "Masala Rice Porridge",
    origin: "India",
    tags: ["Rice", "Onions", "Tomatoes", "Garlic", "Curry Spice Mix"],
    ingredients: {
      "Rice":            160,
      "Onions":           40,
      "Tomatoes":         60,
      "Garlic":           10,
      "Curry Spice Mix":   8
    },
    why: "Savoury rice porridge cooked down with onions, tomatoes, and curry spices — a quick, filling Indian-style breakfast.",
    mealTypes: ["breakfast"]
  },

  {
    flag: "🇯🇵",
    name: "Miso Egg & Seaweed Bowl",
    origin: "Japan",
    tags: ["Miso Paste", "Synthetic Egg Protein", "Seaweed Sheets", "Rice", "Soy Sauce"],
    ingredients: {
      "Miso Paste":            30,
      "Synthetic Egg Protein":  80,
      "Seaweed Sheets":         20,
      "Rice":                  150,
      "Soy Sauce":              10
    },
    why: "A delicate fermented miso broth with poached egg protein and seaweed over rice — Japan's essential daily comfort meal.",
    mealTypes: ["breakfast"]
  },

  {
    flag: "🇺🇸",
    name: "Protein Power Bowl",
    origin: "USA",
    tags: ["Insect Protein Flour", "Sweet Potatoes", "Seeds (Chia/Flax)", "Spinach"],
    ingredients: {
      "Insect Protein Flour":   90,
      "Sweet Potatoes":        140,
      "Seeds (Chia/Flax)":      25,
      "Spinach":                60
    },
    why: "Roasted sweet potato, insect protein, leafy greens, and seeds — the modern performance breakfast built for demanding shifts.",
    mealTypes: ["breakfast"]
  },

  {
    flag: "🇳🇵",
    name: "Dal Bhat",
    origin: "Nepal",
    tags: ["Lentils", "Rice", "Spinach", "Garlic", "Onions", "Curry Spice Mix"],
    ingredients: {
      "Lentils":          120,
      "Rice":             180,
      "Spinach":           60,
      "Garlic":            10,
      "Onions":            40,
      "Curry Spice Mix":    8
    },
    why: "The Nepali staple of spiced lentil soup and steamed rice — the fuel behind generations of Himalayan climbers, repurposed for space.",
    mealTypes: ["breakfast"]
  },

  // ── LUNCH ──────────────────────────────────────────────────────────────────

  {
    flag: "🇰🇷",
    name: "Bibimbap",
    origin: "South Korea",
    tags: ["Rice", "Spinach", "Synthetic Egg Protein", "Miso Paste", "Fermented Chili Sauce", "Seaweed Sheets"],
    ingredients: {
      "Rice":                  180,
      "Spinach":                70,
      "Synthetic Egg Protein":  90,
      "Miso Paste":             20,
      "Fermented Chili Sauce":  15,
      "Seaweed Sheets":         10
    },
    why: "A vibrant bowl of steamed rice topped with seasoned vegetables, a fried egg, and fermented chili paste — stirred vigorously before eating.",
    mealTypes: ["lunch"]
  },

  {
    flag: "🇻🇳",
    name: "Bánh Mì Bowl",
    origin: "Vietnam",
    tags: ["Insect Protein Flour", "Miso Paste", "Pickled Vegetables", "Rice Noodles", "Cilantro"],
    ingredients: {
      "Insect Protein Flour":   80,
      "Miso Paste":             25,
      "Pickled Vegetables":     60,
      "Rice Noodles":          150,
      "Cilantro":               10
    },
    why: "A deconstructed bánh mì — pickled vegetables, crispy protein, and fresh herbs over noodles, hitting every note of sweet, sour, salty, and umami.",
    mealTypes: ["lunch"]
  },

  {
    flag: "🇬🇷",
    name: "Greek Quinoa Bowl",
    origin: "Greece",
    tags: ["Quinoa", "Tomatoes", "Synthetic Cheese", "Seeds (Chia/Flax)", "Basil"],
    ingredients: {
      "Quinoa":              160,
      "Tomatoes":             70,
      "Synthetic Cheese":     40,
      "Seeds (Chia/Flax)":    15,
      "Basil":                10
    },
    why: "A Mediterranean bowl of quinoa with tomatoes, crumbled synthetic feta, and fresh basil — complete protein from an ancient grain.",
    mealTypes: ["lunch"]
  },

  {
    flag: "🇪🇸",
    name: "Vegetable Paella",
    origin: "Spain",
    tags: ["Rice", "Chili Peppers", "Onions", "Mushrooms", "Garlic", "Tomatoes"],
    ingredients: {
      "Rice":          200,
      "Chili Peppers":  50,
      "Onions":         50,
      "Mushrooms":      70,
      "Garlic":         10,
      "Tomatoes":       60
    },
    why: "Rice slow-cooked with colourful vegetables in a wide pan until the base caramelises — Spain's iconic communal sharing dish.",
    mealTypes: ["lunch"]
  },

  {
    flag: "🌍",
    name: "Falafel Wrap",
    origin: "Middle East",
    tags: ["Chickpeas", "Flatbread Dough Culture", "Tomatoes", "Garlic", "Onions", "Cilantro"],
    ingredients: {
      "Chickpeas":               150,
      "Flatbread Dough Culture": 100,
      "Tomatoes":                 50,
      "Garlic":                   10,
      "Onions":                   30,
      "Cilantro":                 10
    },
    why: "Crispy chickpea fritters spiced with cumin and coriander, wrapped in warm flatbread with fresh tomato and herbs.",
    mealTypes: ["lunch"]
  },

  // ── DINNER ─────────────────────────────────────────────────────────────────

  {
    flag: "🇮🇳",
    name: "Butter Chicken",
    origin: "India",
    tags: ["Lab-Grown Chicken Cells", "Tomatoes", "Synthetic Butter", "Synthetic Cheese", "Garlic", "Onions", "Curry Spice Mix"],
    ingredients: {
      "Lab-Grown Chicken Cells": 180,
      "Tomatoes":                 80,
      "Synthetic Butter":         20,
      "Synthetic Cheese":         40,
      "Garlic":                   10,
      "Onions":                   50,
      "Curry Spice Mix":          10
    },
    why: "A rich, creamy tomato-based curry with tender chicken slow-simmered in butter, cream, and warming spices like garam masala and fenugreek.",
    mealTypes: ["dinner"]
  },

  {
    flag: "🇬🇧",
    name: "Shepherd's Pie",
    origin: "United Kingdom",
    tags: ["Hydroponic Potatoes", "Mycoprotein Fungi", "Synthetic Butter", "Onions", "Garlic", "Black Pepper"],
    ingredients: {
      "Hydroponic Potatoes": 200,
      "Mycoprotein Fungi":   120,
      "Synthetic Butter":     20,
      "Onions":               40,
      "Garlic":               10,
      "Black Pepper":          5
    },
    why: "Minced fungi in rich gravy topped with creamy mashed potato and baked until golden — Britain's definitive cold-weather comfort dish.",
    mealTypes: ["dinner"]
  },

  {
    flag: "🇮🇹",
    name: "Risotto ai Funghi",
    origin: "Italy",
    tags: ["Rice", "Mycoprotein Fungi", "Synthetic Cheese", "Synthetic Butter", "Onions", "Black Pepper"],
    ingredients: {
      "Rice":               170,
      "Mycoprotein Fungi":  110,
      "Synthetic Cheese":    40,
      "Synthetic Butter":    15,
      "Onions":              40,
      "Black Pepper":         5
    },
    why: "Rice stirred slowly with mushroom stock and synthetic parmesan until creamy — one of Italy's most comforting and technically satisfying dishes.",
    mealTypes: ["dinner"]
  },

  {
    flag: "🇹🇭",
    name: "Green Curry",
    origin: "Thailand",
    tags: ["Mycoprotein Fungi", "Spinach", "Rice", "Basil", "Curry Spice Mix", "Chili Peppers", "Synthetic Cheese"],
    ingredients: {
      "Mycoprotein Fungi":  120,
      "Spinach":             70,
      "Rice":               160,
      "Basil":               10,
      "Curry Spice Mix":     10,
      "Chili Peppers":       20,
      "Synthetic Cheese":    60
    },
    why: "Green chilli paste simmered with fungi, spinach, and a creamy base — aromatic from basil and spice, served over jasmine rice.",
    mealTypes: ["dinner"]
  },

  {
    flag: "🇸🇳",
    name: "Thieboudienne Bowl",
    origin: "Senegal",
    tags: ["Rice", "Cultured Fish Cells", "Tomatoes", "Onions", "Chili Peppers", "Synthetic Butter"],
    ingredients: {
      "Rice":                180,
      "Cultured Fish Cells": 120,
      "Tomatoes":             70,
      "Onions":               40,
      "Chili Peppers":        30,
      "Synthetic Butter":     15
    },
    why: "Senegal's national dish — fish and vegetables cooked in a rich tomato sauce, then used to flavour the rice it's all served over.",
    mealTypes: ["dinner"]
  }

];
const METHODS = [
    "Flash-heat and compress into energy bar",
    "Hydrate and blend into caloric shake",
    "Pressure-cook and serve as high-density bowl"
];