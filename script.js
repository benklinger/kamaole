// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Function to get today's date in 'DD/MM/YYYY' format
    function getTodayDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = today.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const dateParam = getTodayDate(); // Use today's date

    fetch('data.json?t=' + new Date().getTime())
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const dateData = data.dates[dateParam];

            if (!dateData) {
                console.error(`No data found for the date ${dateParam}.`);
                displayNoDataMessage(dateParam);
                return;
            }

            const products = dateData.products;
            const meals = dateData.meals;
            const location = dateData.location;

            const optionsDiv = document.getElementById('options');
            if (!optionsDiv) {
                console.error('options element not found in the DOM.');
                return;
            }

            const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
            const dateObj = parseDateString(dateParam);
            const dayName = getDayName(dateObj); // getDayName from common.js

            const displayDate = dateParam; // 'DD/MM/YYYY'

            // Option 1 - Product
            if (Array.isArray(products) && products.length > 0) {
                const product = products[0]; // Get the first product

                const productUrl = `game.html?date=${encodeURIComponent(dateParam)}&type=product&id=${encodeURIComponent(product.id)}`;

                const option1Link = document.createElement('a');
                option1Link.classList.add('option-button');
                option1Link.href = productUrl;
                option1Link.innerHTML = `
                    <div class="option-title">${product.productName}</div>
                    <div class="option-subtitle">המוצר הבודד של ${dayName}, ${displayDate}</div>
                `;
                optionsDiv.appendChild(option1Link);
            } else {
                console.error('No products available for this date.');
                // Optionally display a message to the user
            }

            // Option 2 - Meal
            if (Array.isArray(meals) && meals.length > 0) {
                const meal = meals[0]; // Get the first meal

                const mealUrl = `game.html?date=${encodeURIComponent(dateParam)}&type=meal&id=${encodeURIComponent(meal.id)}`;

                const option2Link = document.createElement('a');
                option2Link.classList.add('option-button');
                option2Link.href = mealUrl;
                option2Link.innerHTML = `
                    <div class="option-title">${meal.mealName}</div>
                    <div class="option-subtitle">הארוחה של ${dayName}, ${displayDate}</div>
                `;
                optionsDiv.appendChild(option2Link);
            } else {
                console.error('No meals available for this date.');
                // Optionally display a message to the user
            }

            // Update footer using common.js function
            updateFooter(dateParam, location);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            displayErrorMessage('שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.');
        });
});

// Function to display a message when no data is found for the selected date
function displayNoDataMessage(date) {
    const optionsDiv = document.getElementById('options');
    if (optionsDiv) {
        optionsDiv.innerHTML = `<p>לא נמצאו נתונים לתאריך ${date}. נא בחר תאריך אחר.</p>`;
    }
}

// Function to display a generic error message
function displayErrorMessage(message) {
    const optionsDiv = document.getElementById('options');
    if (optionsDiv) {
        optionsDiv.innerHTML = `<p>${message}</p>`;
    }
}
