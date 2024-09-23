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
    const idParam = params.id ? parseInt(params.id, 10) : null; // Extract and parse 'id'

    // Validate required parameters
    if (!dateParam || !typeParam || (typeParam === 'product' && isNaN(idParam)) || (typeParam === 'meal' && isNaN(idParam))) {
        console.error('Date, type, and valid id parameters are required in the URL.');
        return;
    }

    fetch('data.json?t=' + new Date().getTime())
        .then(response => response.json())
        .then(data => {
            const dateData = data.dates[dateParam];

            if (!dateData) {
                console.error('No data found for the given date.');
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
                return;
            }

            if (!item) {
                console.error('No item found for the given type and id.');
                return;
            }

            // Elements
            const productTitle = document.getElementById('product-title');
            const productSubtitle = document.getElementById('product-subtitle');
            const productImage = document.getElementById('product-image');
            const dotsContainer = document.getElementById('dots-container');

            let productsInMeal = [];
            let currentProductIndex = 0; // Default to first product

            if (typeParam === 'product') {
                // For a single product, use the selected product
                const product = item;
                productsInMeal = [product];

                // Set product title
                productTitle.textContent = product.productName;
                productTitle.style.color = 'green';

                // Hide the product subtitle and dots container
                productSubtitle.style.display = 'none';
                dotsContainer.style.display = 'none';

                // Set product image
                productImage.src = product.imageUrl;
                productImage.style.visibility = 'visible';
            } else if (typeParam === 'meal') {
                // For meals, get the products included
                productsInMeal = item.products.map(pid => dateData.products.find(p => p.id === pid)).filter(p => p);
                if (productsInMeal.length === 0) {
                    console.error('No valid products found for this meal.');
                    return;
                }

                // Set meal title
                productTitle.textContent = item.mealName;
                productTitle.style.color = 'green';

                // Show the product subtitle
                productSubtitle.style.display = 'block';
                // Set the initial product subtitle
                productSubtitle.textContent = productsInMeal[currentProductIndex].productName;

                // Show the dots container
                dotsContainer.style.display = 'flex';

                // Initialize dots for product navigation
                dotsContainer.innerHTML = '';
                productsInMeal.forEach((_, index) => {
                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    if (index === currentProductIndex) {
                        dot.classList.add('active');
                    }
                    dot.addEventListener('click', () => {
                        currentProductIndex = index;
                        updateProductDisplay();
                        updateDots();
                    });
                    dotsContainer.appendChild(dot);
                });

                // Add click event to the image to toggle products
                productImage.addEventListener('click', () => {
                    // Move to the next product
                    currentProductIndex = (currentProductIndex + 1) % productsInMeal.length;
                    updateProductDisplay();
                    updateDots();
                });

                // Initial display
                updateProductDisplay();
            }

            function updateProductDisplay() {
                const currentProduct = productsInMeal[currentProductIndex];

                // Fade out
                productImage.classList.add('fade-out');
                productSubtitle.classList.add('fade-out');

                setTimeout(() => {
                    // Update content
                    productSubtitle.textContent = currentProduct.productName;
                    productImage.src = currentProduct.imageUrl;

                    // Make the image visible
                    productImage.style.visibility = 'visible';

                    // Fade in
                    productImage.classList.remove('fade-out');
                    productImage.classList.add('fade-in');

                    productSubtitle.classList.remove('fade-out');
                    productSubtitle.classList.add('fade-in');
                }, 300); // Duration should match CSS animation duration
            }

            function updateDots() {
                const dots = dotsContainer.getElementsByClassName('dot');
                for (let i = 0; i < dots.length; i++) {
                    dots[i].classList.toggle('active', i === currentProductIndex);
                }
            }

            // Event listeners to remove fade-in class after animation
            productImage.addEventListener('animationend', () => {
                productImage.classList.remove('fade-in');
            });

            productSubtitle.addEventListener('animationend', () => {
                productSubtitle.classList.remove('fade-in');
            });

            // Get minPrice, maxPrice, and actualPrice
            let minPrice = 0;
            let maxPrice = 0;
            let actualPrice = 0;

            if (typeParam === 'product') {
                const product = productsInMeal[0];
                minPrice = parseFloat(product.minPrice);
                maxPrice = parseFloat(product.maxPrice);
                actualPrice = parseFloat(product.productPrice);
            } else if (typeParam === 'meal') {
                productsInMeal.forEach(product => {
                    minPrice += parseFloat(product.minPrice);
                    maxPrice += parseFloat(product.maxPrice);
                    actualPrice += parseFloat(product.productPrice);
                });
            }

            if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(actualPrice)) {
                console.error('Prices must be valid numbers.');
                return;
            }

            // Slider min and max values from minPrice and maxPrice
            const priceSlider = document.getElementById('price-slider');

            // Convert prices to agorot
            const minPriceAgorot = Math.round(minPrice * 100);
            const maxPriceAgorot = Math.round(maxPrice * 100);

            // Ensure at least 20 steps
            let stepSize = 10; // 10 agorot steps
            let numSteps = (maxPriceAgorot - minPriceAgorot) / stepSize;
            if (numSteps < 20) {
                stepSize = Math.ceil((maxPriceAgorot - minPriceAgorot) / 20 / 10) * 10;
                if (stepSize === 0) stepSize = 10; // Ensure stepSize is not zero
            }

            // Round min and max to nearest stepSize
            const adjustedMin = Math.floor(minPriceAgorot / stepSize) * stepSize;
            const adjustedMax = Math.ceil(maxPriceAgorot / stepSize) * stepSize;

            priceSlider.min = adjustedMin;
            priceSlider.max = adjustedMax;
            priceSlider.step = stepSize;
            priceSlider.value = Math.round((adjustedMin + adjustedMax) / 2); // Start in the middle

            // Ensure slider direction is correct in RTL
            priceSlider.style.direction = 'ltr';

            // Update confirm button text and price when slider moves
            const confirmButton = document.getElementById('confirm-button');
            const buttonPriceDisplay = document.getElementById('button-price');

            let currentPriceValue = parseInt(priceSlider.value);

            function updatePriceDisplays(newValue) {
                animatePriceChange(currentPriceValue, newValue, 300); // Adjust duration as needed
                currentPriceValue = newValue;
            }

            function animatePriceChange(oldValue, newValue, duration) {
                const startTime = performance.now();
                const change = newValue - oldValue;

                // Easing function (easeOutCubic)
                function easeOutCubic(t) {
                    return 1 - Math.pow(1 - t, 3);
                }

                function animate(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = easeOutCubic(progress);
                    const currentValue = Math.round(oldValue + change * easedProgress);

                    // Update the price display in the button during animation
                    const shekels = Math.floor(currentValue / 100);
                    const agorot = currentValue % 100;
                    const agorotStr = agorot.toString().padStart(2, '0');

                    buttonPriceDisplay.innerHTML = `₪${shekels}<span class="agorot">${agorotStr}</span>`;

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                }

                requestAnimationFrame(animate);
            }

            // Initial display
            updatePriceDisplays(parseInt(priceSlider.value));

            priceSlider.addEventListener('input', () => {
                const newValue = parseInt(priceSlider.value);
                updatePriceDisplays(newValue);
            });

            // Update footer using common.js function
            updateFooter(dateParam, location);

            // Confirm button click handler
            confirmButton.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default action

                // Get the current price value in agorot
                const guessPrice = currentPriceValue;

                // Build the URL with parameters, including 'id'
                const endUrl = `end.html?date=${encodeURIComponent(dateParam)}&type=${encodeURIComponent(typeParam)}&id=${encodeURIComponent(idParam)}&guessPrice=${guessPrice}`;

                // Redirect to end.html with the parameters
                window.location.href = endUrl;
            });
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
});
