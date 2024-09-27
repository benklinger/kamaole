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
    const idParam = params.id ? parseInt(params.id, 10) : null; // Extract and parse 'id'

    // Validate required parameters
    if (!dateParam || !typeParam || (typeParam === 'product' && isNaN(idParam)) || (typeParam === 'basket' && isNaN(idParam))) {
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

            // Access the product or basket based on type and id
            let item;
            if (typeParam === 'product') {
                item = dateData.products.find(p => p.id === idParam);
            } else if (typeParam === 'basket') {
                item = dateData.baskets.find(m => m.id === idParam);
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
            let productImage = document.getElementById('product-image'); // Changed to let
            const dotsContainer = document.getElementById('dots-container');

            let productsInbasket = [];
            let currentProductIndex = 0; // Default to first product
            let isFirstLoad = true; // Flag to prevent animation on first load

            if (typeParam === 'product') {
                // For a single product, use the selected product
                const product = item;
                productsInbasket = [product];

                // Set product title
                productTitle.textContent = product.productName;
                productTitle.style.color = 'green';

                // Hide the product subtitle and dots container
                productSubtitle.style.display = 'none';
                dotsContainer.style.display = 'none';

                // Set product image
                productImage.src = product.imageUrl;
                productImage.style.visibility = 'visible';
            } else if (typeParam === 'basket') {
                // For baskets, get the products included
                productsInbasket = item.products.map(pid => dateData.products.find(p => p.id === pid)).filter(p => p);
                if (productsInbasket.length === 0) {
                    console.error('No valid products found for this basket.');
                    return;
                }

                // Set basket title
                productTitle.textContent = item.basketName;
                productTitle.style.color = 'green';

                // Show the product subtitle
                productSubtitle.style.display = 'block';
                // Set the initial product subtitle
                productSubtitle.textContent = productsInbasket[currentProductIndex].productName;

                // Show the dots container
                dotsContainer.style.display = 'flex';

                // Initialize dots for product navigation
                dotsContainer.innerHTML = '';
                productsInbasket.forEach((_, index) => {
                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    if (index === currentProductIndex) {
                        dot.classList.add('active');
                    }
                    dot.addEventListener('click', () => {
                        if (index === currentProductIndex) return; // Do nothing if the same dot is clicked

                        const direction = index > currentProductIndex ? 'left' : 'right';
                        currentProductIndex = index;
                        updateProductDisplay(direction);
                        updateDots();
                    });
                    dotsContainer.appendChild(dot);
                });

                // Preload all images
                preloadImages(productsInbasket);

                // Add click event to the image to toggle products
                productImage.addEventListener('click', () => {
                    // Move to the next product
                    const previousIndex = currentProductIndex;
                    currentProductIndex = (currentProductIndex + 1) % productsInbasket.length;
                    const direction = 'left';
                    updateProductDisplay(direction);
                    updateDots();
                });

                // Add touch event listeners for swipe functionality
                let touchStartX = 0;
                let touchEndX = 0;

                productImage.addEventListener('touchstart', handleTouchStart, false);
                productImage.addEventListener('touchend', handleTouchEnd, false);

                function handleTouchStart(e) {
                    touchStartX = e.changedTouches[0].screenX;
                }

                function handleTouchEnd(e) {
                    touchEndX = e.changedTouches[0].screenX;
                    handleGesture();
                }

                function handleGesture() {
                    const swipeThreshold = 50; // Adjust this value as needed
                    const deltaX = touchEndX - touchStartX;

                    if (Math.abs(deltaX) > swipeThreshold) {
                        let direction = '';
                        if (deltaX > 0) {
                            // Swipe right - go to previous product
                            currentProductIndex = (currentProductIndex - 1 + productsInbasket.length) % productsInbasket.length;
                            direction = 'right';
                        } else {
                            // Swipe left - go to next product
                            currentProductIndex = (currentProductIndex + 1) % productsInbasket.length;
                            direction = 'left';
                        }
                        updateProductDisplay(direction);
                        updateDots();
                    }
                }

                // Initialize image gallery by ensuring the image is visible
                productImage.style.visibility = 'visible';

                // Initial display without animation
                updateProductDisplay();
            }

            /**
             * Preload all product images to ensure smooth transitions.
             * @param {Array} products - Array of product objects with imageUrl properties.
             */
            function preloadImages(products) {
                products.forEach(product => {
                    const img = new Image();
                    img.src = product.imageUrl;
                });
            }

            function updateProductDisplay(direction = null) {
                const currentProduct = productsInbasket[currentProductIndex];

                // Update the subtitle
                productSubtitle.textContent = currentProduct.productName;

                // If it's the first load, just set the image without animation
                if (isFirstLoad && !direction) {
                    productImage.src = currentProduct.imageUrl;
                    isFirstLoad = false;
                    return;
                }

                if (!direction) {
                    direction = 'left'; // Default direction if not provided
                }

                // Apply slide-out class
                productImage.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
                productImage.classList.add(direction === 'left' ? 'slide-out-left' : 'slide-out-right');

                // Listen for the end of the slide-out animation
                productImage.addEventListener('animationend', function animationEndHandler() {
                    // Remove slide-out class
                    productImage.classList.remove(direction === 'left' ? 'slide-out-left' : 'slide-out-right');

                    // Update the image source
                    productImage.src = currentProduct.imageUrl;

                    // Apply slide-in class
                    productImage.classList.add(direction === 'left' ? 'slide-in-right' : 'slide-in-left');

                    // Remove the event listener to prevent multiple triggers
                    productImage.removeEventListener('animationend', animationEndHandler);
                });
            }

            function updateDots() {
                const dots = dotsContainer.getElementsByClassName('dot');
                for (let i = 0; i < dots.length; i++) {
                    dots[i].classList.toggle('active', i === currentProductIndex);
                }
            }

            // Get minPrice, maxPrice, and actualPrice
            let minPrice = 0;
            let maxPrice = 0;
            let actualPrice = 0;

            if (typeParam === 'product') {
                const product = productsInbasket[0];
                minPrice = parseFloat(product.minPrice);
                maxPrice = parseFloat(product.maxPrice);
                actualPrice = parseFloat(product.productPrice);
            } else if (typeParam === 'basket') {
                productsInbasket.forEach(product => {
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

                function animateFrame(currentTime) {
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
                        requestAnimationFrame(animateFrame);
                    }
                }

                requestAnimationFrame(animateFrame);
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
