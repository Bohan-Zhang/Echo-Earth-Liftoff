const JOBS = [
  {
    name: "Captain",
    dailyCalories: 2400,
    activity: "Light",
    description: "Command, oversight & bridge watch. Mostly sedentary with high cognitive load."
  },
  {
    name: "First Officer",
    dailyCalories: 2300,
    activity: "Light",
    description: "Navigation, cargo planning, and watch-keeping duties."
  },
  {
    name: "Second Officer",
    dailyCalories: 2300,
    activity: "Light",
    description: "Safety officer, chart corrections, and navigation watch."
  },
  {
    name: "Navigator",
    dailyCalories: 2200,
    activity: "Sedentary",
    description: "Continuous chart plotting and GMDSS communications."
  },
  {
    name: "Radio Operator",
    dailyCalories: 2100,
    activity: "Sedentary",
    description: "Communications monitoring and equipment maintenance."
  },

  {
    name: "Ship's Doctor",
    dailyCalories: 2300,
    activity: "Light",
    description: "Medical consultations, clinic duties, and emergency response."
  },
  {
    name: "Medic / Nurse",
    dailyCalories: 2400,
    activity: "Light",
    description: "Patient care, rounds, and emergency first response."
  },


  {
    name: "Cook / Chef",
    dailyCalories: 2800,
    activity: "Moderate",
    description: "Galley operations, meal prep, and provisions management."
  },
  {
    name: "Steward",
    dailyCalories: 2700,
    activity: "Moderate",
    description: "Cabin service, laundry, and officer mess duties."
  },
  
  {
    name: "Chief Engineer",
    dailyCalories: 3000,
    activity: "Moderate–Heavy",
    description: "Engine room management, oversight of all machinery."
  },
  {
    name: "Engineer Officer",
    dailyCalories: 3200,
    activity: "Heavy",
    description: "Watch-keeping, machinery maintenance, and fault diagnosis."
  },
  {
    name: "Electrician",
    dailyCalories: 2900,
    activity: "Moderate",
    description: "Electrical systems, switchboards, and wiring repairs."
  },
  {
    name: "Motorman",
    dailyCalories: 3300,
    activity: "Heavy",
    description: "Engine room maintenance support and routine machinery care."
  },
  {
    name: "Welder / Fitter",
    dailyCalories: 3600,
    activity: "Very Heavy",
    description: "Metal fabrication, welding, and structural repairs at sea."
  },
  {
    name: "Pump Man",
    dailyCalories: 3300,
    activity: "Heavy",
    description: "Cargo pump operations, tank cleaning, and pipeline maintenance."
  },

  // ── Deck ──────────────────────────────────────────────────────────────────
  {
    name: "Boatswain (Bosun)",
    dailyCalories: 3500,
    activity: "Very Heavy",
    description: "Deck crew supervision, rigging, mooring, and deck maintenance."
  },
  {
    name: "Able Seaman (AB)",
    dailyCalories: 3400,
    activity: "Heavy",
    description: "Deck watches, maintenance, mooring lines, and cargo operations."
  },
  {
    name: "Ordinary Seaman (OS)",
    dailyCalories: 3200,
    activity: "Heavy",
    description: "General deck duties, lookout, and maintenance tasks."
  },
  {
    name: "Deck Hand",
    dailyCalories: 3600,
    activity: "Very Heavy",
    description: "Physical deck labor: painting, chipping, rigging, and cargo."
  },
  {
    name: "Cargo Handler",
    dailyCalories: 3900,
    activity: "Extreme",
    description: "Direct cargo loading, unloading, and lashing — heavy physical work."
  },
  {
    name: "Crane Operator",
    dailyCalories: 2800,
    activity: "Moderate",
    description: "Operating ship cranes and cargo gear; prolonged sitting with high focus."
  },

  
  {
    name: "Dive Supervisor",
    dailyCalories: 3800,
    activity: "Extreme",
    description: "Saturation diving operations — extreme physical and pressure demands."
  },
  {
    name: "Firefighter / Safety Officer",
    dailyCalories: 3100,
    activity: "Heavy",
    description: "Fire drills, emergency response, and safety inspections."
  },
  {
    name: "IT / Systems Tech",
    dailyCalories: 2200,
    activity: "Sedentary",
    description: "Onboard IT infrastructure, satellite systems, and software."
  }
];

const MEAL_RATIOS = {
  breakfast: 0.25,   
  lunch:     0.35,   
  dinner:    0.40    
};

const METHODS = [
  "Boil until tender, season with salt and serve hot.",
  "Pan-fry in a light oil over medium heat until golden.",
  "Steam for 12–15 minutes, preserving nutrients and texture.",
  "Roast at 200 °C for 25 minutes until caramelised.",
  "Stir-fry on high heat for 5–7 minutes, toss frequently.",
  "Slow-cook on low heat for 45 minutes to develop flavour.",
  "Microwave with a splash of water, covered, for 4–5 minutes.",
  "Blanch in boiling water for 2 minutes, then ice-bath to retain colour.",
  "Grill for 8–10 minutes, turning halfway through.",
  "Bake covered at 180 °C for 30 minutes until soft through.",
  "Sauté with aromatics over medium-high heat until fragrant.",
  "Pressure-cook for 10 minutes to retain maximum nutrition."
];
