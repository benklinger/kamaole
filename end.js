// end.js

document.addEventListener('DOMContentLoaded', () => {
    // Function to get URL parameters
    function getQueryParams() {
        const params = {};
        window.location.search.substring(1).split('&').forEach(function(pair) {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return params;
    }

    const params = getQueryParams();
    const dateParam = params.date;
    const typeParam = params.type; // 'product' or 'meal'
    const guessPriceAgorot = parseInt(params.guessPrice, 10); // Price in agorot
    const idParam = params.id ? parseInt(params.id, 10) : null; // Optional ID

    // Validate required parameters
    if (!dateParam || !typeParam || isNaN(guessPriceAgorot) || isNaN(idParam)) {
        console.error('Date, type, id, and guessPrice parameters are required in the URL.');
        displayError('פרמטרים חסרים או בלתי חוקיים בכתובת ה-URL.');
        return;
    }

    fetch('data.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            const dateData = data.dates[dateParam];

            if (!dateData) {
                console.error('No data found for the given date.');
                displayError('לא נמצאו נתונים לתאריך הנבחר.');
                return;
            }

            const location = dateData.location;

            // Access the product or meal based on type and id
            let item;
            if (typeParam === 'product') {
                item = dateData.products.find(p => p.id === idParam);
            } else if (typeParam === 'meal') {
                item = dateData.meals.find(m => m.id === idParam);
            } else {
                console.error('Invalid type parameter.');
                displayError('פרמטר סוג בלתי חוקי.');
                return;
            }

            if (!item) {
                console.error('No item found for the given type and id.');
                displayError('לא נמצא פריט מתאים לסוג ול-ID הנבחרים.');
                return;
            }

            // Calculate actual price
            let actualPriceAgorot = 0;

            if (typeParam === 'product') {
                actualPriceAgorot = Math.round(parseFloat(item.productPrice) * 100);
            } else if (typeParam === 'meal') {
                if (!Array.isArray(item.products)) {
                    console.error('Invalid products data for meal.');
                    displayError('נתוני מוצרים לא חוקיים לארוחה.');
                    return;
                }
                actualPriceAgorot = item.products.reduce((sum, pid) => {
                    const product = dateData.products.find(p => p.id === pid);
                    return product ? sum + Math.round(parseFloat(product.productPrice) * 100) : sum;
                }, 0);
            }

            // Update Actual Price Title
            const actualPriceTitle = document.getElementById('actual-price-title');
            actualPriceTitle.innerHTML = `זה עולה ${formatPrice(actualPriceAgorot)}`;

            // Removed the User's Guess Subtitle
            // const guessPriceSubtitle = document.getElementById('guess-price-subtitle');
            // guessPriceSubtitle.textContent = `הניחוש של היה ${formatPrice(guessPriceAgorot)}`;

            // Display Difference with Appropriate Text
            const differenceDiv = document.getElementById('price-difference');
            const difference = actualPriceAgorot - guessPriceAgorot;
            let differenceText = '';
            if (difference > 0) {
                differenceText = `הניחוש שלך היה נמוך ב-${formatPrice(difference)}`;
                differenceDiv.classList.add('difference'); // Assuming CSS styles
            } else if (difference < 0) {
                differenceText = `הניחוש שלך היה גבוה ב-${formatPrice(Math.abs(difference))}`;
                differenceDiv.classList.add('difference');
            } else {
                differenceText = 'הניחוש שלך היה נכון!';
                differenceDiv.classList.add('correct'); // Assuming CSS styles
            }
            differenceDiv.innerHTML = differenceText;

            // Setup Yesterday's Game Option
            const yesterdayGameLink = document.getElementById('yesterday-game-link');
            const todayGameLink = document.getElementById('today-game-link');
            const yesterdayData = getYesterdayData(dateParam, typeParam, idParam, data);

            if (yesterdayData) {
                const { dateStr, type, productName, weekday, id } = yesterdayData;

                // Build the URL for yesterday's game
                const yesterdayUrl = `game.html?date=${encodeURIComponent(dateStr)}&type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;

                // Update the link's href attribute
                yesterdayGameLink.href = yesterdayUrl;

                // Update the option title and subtitle
                const optionTitle = yesterdayGameLink.querySelector('.option-title');
                const optionSubtitle = yesterdayGameLink.querySelector('.option-subtitle');

                optionTitle.textContent = productName;
                if (type === 'product') {
                    optionSubtitle.textContent = `המוצר הבודד של ${weekday}, ${formatDateForDisplayStr(dateStr)}`;
                } else if (type === 'meal') {
                    optionSubtitle.textContent = `הארוחה של ${weekday}, ${formatDateForDisplayStr(dateStr)}`;
                }
            } else {
                // If yesterday's data is not available, hide the option or display a message
                yesterdayGameLink.style.display = 'none';
                const alternativeText = document.createElement('div');
                alternativeText.textContent = 'אין משחק לאתמול.';
                alternativeText.classList.add('no-yesterday-game');
                yesterdayGameLink.parentElement.appendChild(alternativeText);
            }

            // Setup Today's Complementary Game Option
            const todayData = getTodayComplementaryData(dateParam, typeParam, idParam, data);

            if (todayData) {
                const { dateStr, type, productName, weekday, id } = todayData;

                // Build the URL for today's complementary game
                const todayUrl = `game.html?date=${encodeURIComponent(dateStr)}&type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`;

                // Update the link's href attribute
                todayGameLink.href = todayUrl;

                // Update the option title and subtitle
                const todayOptionTitle = todayGameLink.querySelector('.option-title');
                const todayOptionSubtitle = todayGameLink.querySelector('.option-subtitle');

                todayOptionTitle.textContent = productName;
                if (type === 'product') {
                    todayOptionSubtitle.textContent = `המוצר הבודד של ${weekday}, ${formatDateForDisplayStr(dateStr)}`;
                } else if (type === 'meal') {
                    todayOptionSubtitle.textContent = `הארוחה של ${weekday}, ${formatDateForDisplayStr(dateStr)}`;
                }
            } else {
                // If today's complementary data is not available, hide the option or display a message
                todayGameLink.style.display = 'none';
                const alternativeText = document.createElement('div');
                alternativeText.textContent = 'אין משחק היום.';
                alternativeText.classList.add('no-today-game');
                todayGameLink.parentElement.appendChild(alternativeText);
            }

            // Update footer using common.js function
            updateFooter(dateParam, location);
        })
        .catch(error => {
            console.error('Error loading data:', error);
            displayError('שגיאה בטעינת הנתונים. אנא נסה שוב מאוחר יותר.');
        });

    // Function to format price from agorot to ₪X.XX
    function formatPrice(agorot) {
        const shekels = Math.floor(agorot / 100);
        const remainingAgorot = agorot % 100;
        return `₪${shekels}<span class="agorot">${remainingAgorot.toString().padStart(2, '0')}</span>`;
    }

    // Function to get yesterday's data based on the current date and type
    function getYesterdayData(currentDateStr, currentType, currentId, data) {
        const currentDate = parseDateString(currentDateStr);
        const yesterdayDate = new Date(currentDate);
        yesterdayDate.setDate(currentDate.getDate() - 1);
        const yesterdayStr = formatDateString(yesterdayDate); // Defined in common.js

        const yesterdayData = data.dates[yesterdayStr];
        if (!yesterdayData) {
            return null;
        }

        // Determine the type for yesterday's game based on current type
        let type = currentType;
        let id = null;
        let productName = '';
        if (type === 'product') {
            if (yesterdayData.products && yesterdayData.products.length > 0) {
                // Try to find the same product id from yesterday
                const product = yesterdayData.products.find(p => p.id === currentId);
                if (product) {
                    productName = product.productName;
                    id = product.id;
                } else {
                    // If the same id doesn't exist yesterday, use the first product
                    const firstProduct = yesterdayData.products[0];
                    productName = firstProduct ? firstProduct.productName : 'מוצר לא זמין';
                    id = firstProduct ? firstProduct.id : null;
                }
            } else {
                return null;
            }
        } else if (type === 'meal') {
            if (yesterdayData.meals && yesterdayData.meals.length > 0) {
                // Try to find the same meal id from yesterday
                const meal = yesterdayData.meals.find(m => m.id === currentId);
                if (meal) {
                    productName = meal.mealName;
                    id = meal.id;
                } else {
                    // If the same id doesn't exist yesterday, use the first meal
                    const firstMeal = yesterdayData.meals[0];
                    productName = firstMeal ? firstMeal.mealName : 'ארוחה לא זמינה';
                    id = firstMeal ? firstMeal.id : null;
                }
            } else {
                return null;
            }
        }

        if (id === null) {
            return null;
        }

        const weekday = getDayName(yesterdayDate);
        return {
            dateStr: yesterdayStr,
            type: type,
            id: id,
            productName: productName,
            weekday: weekday
        };
    }

    // Function to get today's complementary data based on the current type
    function getTodayComplementaryData(currentDateStr, currentType, currentId, data) {
        const todayStr = currentDateStr; // Assuming dateParam is today's date
        const todayData = data.dates[todayStr];
        if (!todayData) {
            return null;
        }

        // Determine the complementary type
        let complementaryType = currentType === 'product' ? 'meal' : 'product';
        let id = null;
        let productName = '';

        if (complementaryType === 'product') {
            if (todayData.products && todayData.products.length > 0) {
                // For simplicity, use the first product
                const product = todayData.products[0];
                productName = product ? product.productName : 'מוצר לא זמין';
                id = product ? product.id : null;
            } else {
                return null;
            }
        } else if (complementaryType === 'meal') {
            if (todayData.meals && todayData.meals.length > 0) {
                // For simplicity, use the first meal
                const meal = todayData.meals[0];
                productName = meal ? meal.mealName : 'ארוחה לא זמינה';
                id = meal ? meal.id : null;
            } else {
                return null;
            }
        }

        if (id === null) {
            return null;
        }

        const dateObj = parseDateString(todayStr);
        const weekday = getDayName(dateObj);

        return {
            dateStr: todayStr,
            type: complementaryType,
            id: id,
            productName: productName,
            weekday: weekday
        };
    }

    // Function to display error messages to the user
    function displayError(message) {
        const container = document.querySelector('.container');
        container.innerHTML = `<div class="error-message">${message}</div>`;
    }

    // Function to format date string for display (e.g., '12 בספטמבר 2024')
    function formatDateForDisplayStr(dateStr) {
        const dateObj = parseDateString(dateStr);
        return formatDateForDisplay(dateObj);
    }
});
