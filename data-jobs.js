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

  // ───────────────── BREAKFAST ─────────────────

  {
    flag:"🇮🇳",
    name:"Masala Oats",
    origin:"India",
    tags:["oats","onions","hydroponic tomatoes","garlic","yeast cultures"],
    ingredients:{
      oats:120,
      onions:40,
      hydroponic_tomatoes:60,
      garlic:10,
      yeast_cultures:15
    },
    why:"High-satiety breakfast, sustained energy release.",
    mealTypes:["breakfast"]
  },

  {
    flag:"🇬🇧",
    name:"Porridge & Seeds",
    origin:"United Kingdom",
    tags:["oats","seeds","fruit cell cultures","yeast cultures"],
    ingredients:{
      oats:130,
      seeds:35,
      fruit_cell_cultures:50,
      yeast_cultures:10
    },
    why:"Slow-release energy. Ideal pre-shift morning meal.",
 
    mealTypes:["breakfast"]
  },

  {
    flag:"🇰🇷",
    name:"Kimchi Fried Rice",
    origin:"South Korea",
    tags:["rice cultures","fermented soy paste","synthetic egg protein","seaweed sheets","yeast cultures"],
    ingredients:{
      rice_cultures:180,
      fermented_soy_paste:25,
      synthetic_egg_protein:80,
      seaweed_sheets:15,
      yeast_cultures:10
    },
    why:"Fermented foods support gut microbiome in zero-G.",
 
    mealTypes:["breakfast"]
  },

  {
    flag:"🇺🇸",
    name:"Protein Power Bowl",
    origin:"USA",
    tags:["insect protein flour","sweet potatoes","seeds","kale","algae oil"],
    ingredients:{
      insect_protein_flour:90,
      sweet_potatoes:140,
      seeds:25,
      kale:60,
      algae_oil:15
    },
    why:"Designed for max performance. High protein density per gram.",
   
    mealTypes:["breakfast"]
  },

  {
    flag:"🇳🇵",
    name:"Dal Bhat",
    origin:"Nepal",
    tags:["lentils","rice cultures","spinach","garlic","onions","spices"],
    ingredients:{
      lentils:120,
      rice_cultures:180,
      spinach:60,
      garlic:10,
      onions:40,
      spices:8
    },
    why:"Sherpa staple. High-altitude endurance food repurposed for space.",
  
    mealTypes:["breakfast"]
  },



  // ───────────────── LUNCH ─────────────────

  {
    flag:"🇲🇽",
    name:"Black Bean Burrito",
    origin:"Mexico",
    tags:["soybeans","rice cultures","hydroponic lettuce","fermented soy paste","bell peppers"],
    ingredients:{
      soybeans:130,
      rice_cultures:170,
      hydroponic_lettuce:60,
      fermented_soy_paste:20,
      bell_peppers:50
    },
    why:"Dense calorie and protein payload for heavy-duty crews.",
   
    mealTypes:["lunch"]
  },

  {
    flag:"🇰🇷",
    name:"Bibimbap",
    origin:"South Korea",
    tags:["rice cultures","hydroponic greens","synthetic egg protein","fermented soy paste"],
    ingredients:{
      rice_cultures:180,
      hydroponic_greens:70,
      synthetic_egg_protein:90,
      fermented_soy_paste:20
    },
    why:"Balanced nutrition in one bowl.",
  
    mealTypes:["lunch"]
  },

  {
    flag:"🇻🇳",
    name:"Bánh Mì Bowl",
    origin:"Vietnam",
    tags:["insect protein flour","fermented soy paste","hydroponic lettuce","rice cultures"],
    ingredients:{
      insect_protein_flour:80,
      fermented_soy_paste:25,
      hydroponic_lettuce:60,
      rice_cultures:150
    },
    why:"Street-food efficiency. High morale from complex flavours.",

    mealTypes:["lunch"]
  },

  {
    flag:"🇬🇷",
    name:"Greek Quinoa Bowl",
    origin:"Greece",
    tags:["quinoa","hydroponic tomatoes","synthetic dairy","algae oil","hydroponic herbs"],
    ingredients:{
      quinoa:160,
      hydroponic_tomatoes:70,
      synthetic_dairy:40,
      algae_oil:15,
      hydroponic_herbs:10
    },
    why:"Complete protein from quinoa. Mediterranean longevity diet.",
 
    mealTypes:["lunch"]
  },

  {
    flag:"🇪🇸",
    name:"Vegetable Paella",
    origin:"Spain",
    tags:["rice cultures","bell peppers","onions","mushrooms","garlic","algae oil"],
    ingredients:{
      rice_cultures:180,
      bell_peppers:60,
      onions:50,
      mushrooms:70,
      garlic:10,
      algae_oil:15
    },
    why:"Communal dish — crew social bonding meal.",
  
    mealTypes:["lunch"]
  },



  // ───────────────── DINNER ─────────────────

  {
    flag:"🇮🇳",
    name:"Butter Chicken",
    origin:"India",
    tags:["lab-grown chicken","hydroponic tomatoes","synthetic dairy","algae oil","garlic","onions"],
    ingredients:{
      lab_grown_chicken:180,
      hydroponic_tomatoes:80,
      synthetic_dairy:50,
      algae_oil:15,
      garlic:10,
      onions:50
    },
    why:"High morale meal. Strong cultural value. Protein-rich.",
 
    mealTypes:["dinner"]
  },

  {
    flag:"🇬🇧",
    name:"Shepherd's Pie",
    origin:"United Kingdom",
    tags:["hydroponic potatoes","mycoprotein fungi","algae oil","onions","garlic"],
    ingredients:{
      hydroponic_potatoes:200,
      mycoprotein_fungi:120,
      algae_oil:15,
      onions:40,
      garlic:10
    },
    why:"Dense calories for physical workers.",
    
    mealTypes:["dinner"]
  },

  {
    flag:"🇮🇹",
    name:"Risotto ai Funghi",
    origin:"Italy",
    tags:["rice cultures","mycoprotein fungi","synthetic dairy","yeast cultures","onions","algae oil"],
    ingredients:{
      rice_cultures:170,
      mycoprotein_fungi:110,
      synthetic_dairy:40,
      yeast_cultures:15,
      onions:40,
      algae_oil:15
    },
    why:"Warming comfort food. Fungi = low-impact protein.",
    
    mealTypes:["dinner"]
  },

  {
    flag:"🇹🇭",
    name:"Green Curry",
    origin:"Thailand",
    tags:["mycoprotein fungi","algae milk","hydroponic vegetables","rice cultures","herbs"],
    ingredients:{
      mycoprotein_fungi:120,
      algae_milk:80,
      hydroponic_vegetables:90,
      rice_cultures:160,
      herbs:10
    },
    why:"Anti-inflammatory spices. Flavour complexity lifts morale.",
  
    mealTypes:["dinner"]
  },

  {
    flag:"🇸🇳",
    name:"Thieboudienne Bowl",
    origin:"Senegal",
    tags:["rice cultures","cultured fish cells","hydroponic tomatoes","onions","bell peppers","algae oil"],
    ingredients:{
      rice_cultures:180,
      cultured_fish_cells:120,
      hydroponic_tomatoes:70,
      onions:40,
      bell_peppers:50,
      algae_oil:15
    },
    why:"West Africa's favourite rice-fish dish. Rich in omega-3.",
    
    mealTypes:["dinner"]
  }

];

const ING = {
    energy: ["Soy Chunks", "Rice", "Oats", "Pasta", "Lentils", "Algae Oil", "Synthetic Potato"]
};

const METHODS = [
    "Flash-heat and compress into energy bar",
    "Hydrate and blend into caloric shake",
    "Pressure-cook and serve as high-density bowl"
];