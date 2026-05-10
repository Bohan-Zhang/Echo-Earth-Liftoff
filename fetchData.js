const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRAaI-jNgHTQwfnVgHlYrwbQ3ic1DVIpRKWB7H1f3jFbac3HtqG56FfvJF9EdOkm07wn0XG25XvK45m/pub?output=csv';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuPPX5kU97FxfAA7FwpBc-EUjixvC823LjEOSmyc_JvtRxgd5aoufuQ_ZP0CJ21OJq/exec';

const cleanVal = (val) => val ? val.replace(/"/g, '').trim() : '';

async function loadData() {
    const container = document.getElementById('food-container');
    try {
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        
        const foods = rows.slice(1).map(row => {
            const values = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return {
                name: cleanVal(values[1]),
                calories: cleanVal(values[2]),
                stock: cleanVal(values[3])
            };
        });

        container.innerHTML = ''; 
        foods.forEach(food => {
            if(!food.name) return; 
            container.innerHTML += `
                <div class="food-item">
                    <div>
                        <strong>${food.name}</strong><br>
                        <small>${food.calories} cal | Stock: ${food.stock}g</small>
                    </div>
                    <div class="btn-group">
                        <button class="minus" onclick="changeStock('${food.name}', -100)">-100g</button>
                        <button class="plus" onclick="changeStock('${food.name}', 100)">+100g</button>
                    </div>
                </div>`;
        });
    } catch (e) { container.innerText = "Error loading data."; }
}

async function changeStock(foodName, amount) {
    console.log(`Requesting ${amount} for ${foodName}`);
    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify({
                action: "updateStock",
                name: foodName,
                amount: amount
            })
        });
        setTimeout(loadData, 1500);
    } catch (e) {
        alert("Failed to update stock.");
    }
}

loadData();