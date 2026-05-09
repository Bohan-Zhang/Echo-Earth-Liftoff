// Your published CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/12rAnFoHSJT4LALMViu6JvtZjGFMbR-o4u2EZ53gWeng/edit?usp=sharing';

async function getFoods() {
    const response = await fetch(SHEET_URL);
    const csvText = await response.text();
    
    // Parse CSV to array of objects
    const rows = csvText.trim().split('\n');
    const headers = rows[0].split(',');
    
    const foods = rows.slice(1).map(row => {
        const values = row.split(',');
        return {
            id: values[0],
            name: values[1],
            calories: parseInt(values[2]),
            stock: parseInt(values[3])
        };
    });
    
    return foods;
}

// Use it
getFoods().then(foods => {
    console.log(foods);
    // Display on webpage
    foods.forEach(food => {
        document.body.innerHTML += `
            <div>
                ${food.name} - ${food.calories} calories - Stock: ${food.stock}
            </div>
        `;
    });
});