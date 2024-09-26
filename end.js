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
    const typeParam = params.type; // 'product' or 'basket'
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

            // Access the product or basket based on type and id
            let item;
            if (typeParam === 'product') {
                item = dateData.products.find(p => p.id === idParam);
            } else if (typeParam === 'basket') {
                item = dateData.baskets.find(m => m.id === idParam);
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
            } else if (typeParam === 'basket') {
                if (!Array.isArray(item.products)) {
                    console.error('Invalid products data for basket.');
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

            // Display Price Breakdown
            const priceBreakdownDiv = document.getElementById('price-breakdown');
            if (typeParam === 'basket') {
                // For baskets, display each product in the basket with its price
                item.products.forEach(pid => {
                    const product = dateData.products.find(p => p.id === pid);
                    if (product) {
                        const productName = product.productName;
                        const price = parseFloat(product.productPrice).toFixed(2);
                        const productLine = document.createElement('h3');
                        productLine.innerHTML = `${productName}: ${formatPrice(Math.round(price * 100))}`;
                        priceBreakdownDiv.appendChild(productLine);
                    }
                });
            }

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
            const yesterdayData = getYesterdayData(dateParam, typeParam, data);

            // Function to create a game option link
            function createGameOptionLink(url, title, subtitle) {
                const link = document.createElement('a');
                link.classList.add('option-button');
                link.href = url;
                link.innerHTML = `
                    <div class="option-title">${title}</div>
                    <div class="option-subtitle">${subtitle}</div>
                `;
                return link;
            }

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

                // Set subtitle based on type
                if (type === 'product') {
                    optionSubtitle.textContent = `המוצר של ${weekday}, ${formatDateForDisplayStr(dateStr)}`;
                } else if (type === 'basket') {
                    optionSubtitle.textContent = `הסל של ${weekday}, ${formatDateForDisplayStr(dateStr)}`;
                }

                // **Add Second Option Based on Current Type**
                let secondOption = null;

                if (typeParam === 'product') {
                    // Add today's basket
                    const today = new Date();
                    const todayStr = formatDateString(today);
                    const todayData = data.dates[todayStr];

                    if (todayData && todayData.baskets && todayData.baskets.length > 0) {
                        const todaybasket = todayData.baskets[0]; // Assuming the first basket
                        const todaybasketUrl = `game.html?date=${encodeURIComponent(todayStr)}&type=basket&id=${encodeURIComponent(todaybasket.id)}`;

                        secondOption = createGameOptionLink(
                            todaybasketUrl,
                            todaybasket.basketName,
                            `הסל של ${getDayName(today)}, ${formatDateForDisplayStr(todayStr)}`
                        );
                    }
                } else if (typeParam === 'basket') {
                    // Add today's product
                    const today = new Date();
                    const todayStr = formatDateString(today);
                    const todayData = data.dates[todayStr];

                    if (todayData && todayData.products && todayData.products.length > 0) {
                        const todayProduct = todayData.products[0]; // Assuming the first product
                        const todayProductUrl = `game.html?date=${encodeURIComponent(todayStr)}&type=product&id=${encodeURIComponent(todayProduct.id)}`;

                        secondOption = createGameOptionLink(
                            todayProductUrl,
                            todayProduct.productName,
                            `המוצר של ${getDayName(today)}, ${formatDateForDisplayStr(todayStr)}`
                        );
                    }
                }

                if (secondOption) {
                    const optionsDiv = document.querySelector('.container .options');
                    optionsDiv.appendChild(secondOption);
                }

            } else {
                // If yesterday's data is not available, hide the option or display a message
                yesterdayGameLink.style.display = 'none';
                const alternativeText = document.createElement('div');
                alternativeText.textContent = 'אין משחק לאתמול.';
                alternativeText.classList.add('no-yesterday-game');
                yesterdayGameLink.parentElement.appendChild(alternativeText);
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
    function getYesterdayData(currentDateStr, currentType, data) {
        const currentDate = parseDateString(currentDateStr);
        const yesterdayDate = new Date(currentDate);
        yesterdayDate.setDate(currentDate.getDate() - 1);
        const yesterdayStr = formatDateString(yesterdayDate); // Now defined in common.js

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
                const product = yesterdayData.products.find(p => p.id === idParam); // Use the same id if exists
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
        } else if (type === 'basket') {
            if (yesterdayData.baskets && yesterdayData.baskets.length > 0) {
                const basket = yesterdayData.baskets.find(m => m.id === idParam); // Use the same id if exists
                if (basket) {
                    productName = basket.basketName;
                    id = basket.id;
                } else {
                    // If the same id doesn't exist yesterday, use the first basket
                    const firstbasket = yesterdayData.baskets[0];
                    productName = firstbasket ? firstbasket.basketName : 'סל לא זמין';
                    id = firstbasket ? firstbasket.id : null;
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
