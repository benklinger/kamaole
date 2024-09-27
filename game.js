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
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok (status: ${response.status})`);
            }
            return response.json();
        })
        .then(data => {
            const dateData = data.dates[dateParam];

            if (!dateData) {
                console.error(`Error: No data found for the date "${dateParam}".`);
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
                console.error(`Error: Invalid type "${typeParam}". Expected "product" or "basket".`);
                return;
            }

            if (!item) {
                console.error(`Error: No item found for type "${typeParam}" with id "${idParam}".`);
                return;
            }

            // DOM Elements
            const productTitle = document.getElementById('product-title');
            const productSubtitle = document.getElementById('product-subtitle');
            let productImage = document.getElementById('product-image'); // Changed to let
            const dotsContainer = document.getElementById('dots-container');

            let productsInBasket = [];
            let currentProductIndex = 0; // Default to first product
            let isFirstLoad = true; // Flag to prevent animation on first load

            if (typeParam === 'product') {
                // For a single product, use the selected product
                const product = item;
                productsInBasket = [product];

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
                productsInBasket = item.products.map(pid => dateData.products.find(p => p.id === pid)).filter(p => p);
                if (productsInBasket.length === 0) {
                    console.error('Error: No valid products found for this basket.');
                    return;
                }

                // Set basket title
                productTitle.textContent = item.basketName;
                productTitle.style.color = 'green';

                // Show the product subtitle
                productSubtitle.style.display = 'block';
                // Set the initial product subtitle
                productSubtitle.textContent = productsInBasket[currentProductIndex].productName;

                // Show the dots container
                dotsContainer.style.display = 'flex';

				// Initialize dots for product navigation
		        dotsContainer.innerHTML = '';
		        const totalProducts = productsInBasket.length;
		        for (let index = 0; index < totalProducts; index++) {
		            const dot = document.createElement('span');
		            dot.classList.add('dot');
		            if (index === currentProductIndex) {
		                dot.classList.add('active');
		            }
		            dot.addEventListener('click', () => {
		                if (index === currentProductIndex) return; // Do nothing if the same dot is clicked

		                const direction = index < currentProductIndex ? 'right' : 'left';
		                currentProductIndex = index;
		                updateProductDisplay(direction);
		                updateDots();
		            });
		            // Prepend the dot to the container to reverse the order
		            dotsContainer.insertBefore(dot, dotsContainer.firstChild);
		        }

                // Preload all images
                preloadImages(productsInBasket);

                // Add click event to the image to toggle products
                productImage.addEventListener('click', () => {
                    // Move to the next product
                    const previousIndex = currentProductIndex;
                    currentProductIndex = (currentProductIndex + 1) % productsInBasket.length;
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
                            currentProductIndex = (currentProductIndex - 1 + productsInBasket.length) % productsInBasket.length;
                            direction = 'right';
                        } else {
                            // Swipe left - go to next product
                            currentProductIndex = (currentProductIndex + 1) % productsInBasket.length;
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

            /**
             * Update the displayed product image with sliding animations.
             * @param {string} [direction=null] - 'left' or 'right' indicating slide direction.
             */
            function updateProductDisplay(direction = null) {
                const currentProduct = productsInBasket[currentProductIndex];

                // Update the subtitle
                if (typeParam === 'basket') {
                    productSubtitle.textContent = currentProduct.productName;
                }

                // If it's the first load, just set the image without animation
                if (isFirstLoad && !direction) {
                    productImage.src = currentProduct.imageUrl;
                    isFirstLoad = false;
                    return;
                }

                if (!direction) {
                    direction = 'left'; // Default direction if not provided
                }

                // Remove any existing animation classes to prevent conflicts
                productImage.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');

                // Determine the slide-out and slide-in classes based on direction
                const slideOutClass = direction === 'left' ? 'slide-out-left' : 'slide-out-right';
                const slideInClass = direction === 'left' ? 'slide-in-right' : 'slide-in-left';

                // Apply the slide-out class to initiate the slide-out animation
                productImage.classList.add(slideOutClass);

                // Define the animationend handler
                function onAnimationEnd(e) {
                    if (e.animationName === 'slideOutLeft' || e.animationName === 'slideOutRight') {
                        // Slide-out animation ended

                        // Remove slide-out class
                        productImage.classList.remove(slideOutClass);

                        // Update the image source to the new product
                        productImage.src = currentProduct.imageUrl;

                        // Apply slide-in class to initiate the slide-in animation
                        productImage.classList.add(slideInClass);
                    } else if (e.animationName === 'slideInLeft' || e.animationName === 'slideInRight') {
                        // Slide-in animation ended

                        // Remove slide-in class
                        productImage.classList.remove(slideInClass);

                        // Remove this event listener to prevent memory leaks
                        productImage.removeEventListener('animationend', onAnimationEnd);
                    }
                }

                // Add event listener for animationend
                productImage.addEventListener('animationend', onAnimationEnd);
            }

	 /**
	         * Update the active state of navigation dots.
	         */
	        function updateDots() {
	            const dots = dotsContainer.getElementsByClassName('dot');
	            const totalDots = dots.length;
	            for (let i = 0; i < totalDots; i++) {
	                const index = totalDots - 1 - i; // Adjust index since dots are reversed
	                dots[i].classList.toggle('active', index === currentProductIndex);
	            }
	        }

            // Get minPrice, maxPrice, and actualPrice
            let minPrice = 0;
            let maxPrice = 0;
            let actualPrice = 0;

            if (typeParam === 'product') {
                const product = productsInBasket[0];
                minPrice = parseFloat(product.minPrice);
                maxPrice = parseFloat(product.maxPrice);
                actualPrice = parseFloat(product.productPrice);
            } else if (typeParam === 'basket') {
                productsInBasket.forEach(product => {
                    minPrice += parseFloat(product.minPrice);
                    maxPrice += parseFloat(product.maxPrice);
                    actualPrice += parseFloat(product.productPrice);
                });
            }

            if (isNaN(minPrice) || isNaN(maxPrice) || isNaN(actualPrice)) {
                console.error('Prices must be valid numbers.');
                return;
            }

            // Define adjustedMin and adjustedMax based on stepSize
            const minPriceAgorot = Math.round(minPrice * 100);
            const maxPriceAgorot = Math.round(maxPrice * 100);

            let stepSize = 10; // 10 agorot steps
            let numSteps = (maxPriceAgorot - minPriceAgorot) / stepSize;
            if (numSteps < 20) {
                stepSize = Math.ceil((maxPriceAgorot - minPriceAgorot) / 20 / 10) * 10;
                if (stepSize === 0) stepSize = 10; // Ensure stepSize is not zero
            }

            const adjustedMin = Math.floor(minPriceAgorot / stepSize) * stepSize;
            const adjustedMax = Math.ceil(maxPriceAgorot / stepSize) * stepSize;

            // Set initial price to adjustedMin
            let currentPriceValue = adjustedMin;

            // DOM Elements for the confirm button
            const confirmButton = document.getElementById('confirm-button');
            const buttonPriceDisplay = document.getElementById('button-price');

            /**
             * Function to update the confirm button's price display and background.
             * @param {number} newValue - The new price value in agorot.
             */
            function updatePriceDisplays(newValue) {
                // Update the price display
                const shekels = Math.floor(newValue / 100);
                const agorot = newValue % 100;
                const agorotStr = agorot.toString().padStart(2, '0');

                buttonPriceDisplay.innerHTML = `₪${shekels}<span class="agorot">${agorotStr}</span>`;

                // Update the button's background gradient based on the current value
                const percentage = ((newValue - adjustedMin) / (adjustedMax - adjustedMin)) * 100;
                confirmButton.style.background = `linear-gradient(to right, #008000 0%, #008000 ${percentage}%, #48a860 ${percentage}%, #48a860 100%)`;

                // Update the data attribute with the current guessPrice
                confirmButton.dataset.guessPrice = newValue;
            }

            /**
             * Animates the price from adjustedMin to middle value on page load.
             * Runs twice as fast by reducing the interval duration.
             */
            function animateInitialPrice() {
                const animationDuration = 750; // Total duration of animation in milliseconds
                const animationInterval = 10; // Interval between updates in milliseconds (twice as fast)
                const middleValue = Math.round((adjustedMin + adjustedMax) / 2);
                const steps = animationDuration / animationInterval;
                const stepValue = (middleValue - adjustedMin) / steps;

                let currentValue = adjustedMin;
                const initialAnimation = setInterval(() => {
                    if (currentValue < middleValue) {
                        currentValue += stepValue;
                        if (currentValue > middleValue) currentValue = middleValue;
                        updatePriceDisplays(Math.round(currentValue));
                    } else {
                        clearInterval(initialAnimation);
                        currentPriceValue = middleValue; // Set the current value to the middle value
                    }
                }, animationInterval);
            }

            // Initialize button with adjustedMin
            updatePriceDisplays(currentPriceValue);

            // Start the initial animation
            animateInitialPrice();

            /**
             * Variables for dragging
             */
            let isDragging = false;
            let hasDragged = false;
            let startX = 0;

            /**
             * Handles the start of dragging.
             * @param {PointerEvent} e
             */
            function handlePointerDown(e) {
                e.preventDefault(); // Prevent default behavior (like text selection)
                isDragging = true;
                hasDragged = false;
                startX = e.clientX;
                confirmButton.setPointerCapture(e.pointerId);
            }

            /**
             * Handles the movement during dragging.
             * @param {PointerEvent} e
             */
            function handlePointerMove(e) {
                if (!isDragging) return;

                const rect = confirmButton.getBoundingClientRect();
                let x = e.clientX - rect.left; // x position within the button
                const width = rect.width;

                // Calculate the percentage
                let percentage = x / width;
                percentage = Math.max(0, Math.min(1, percentage)); // Clamp between 0 and 1

                // Calculate the new price value
                const newValue = Math.round(adjustedMin + percentage * (adjustedMax - adjustedMin));

                // Check if the pointer has moved enough to consider it a drag
                if (!hasDragged && Math.abs(e.movementX) > 5) {
                    hasDragged = true;
                }

                if (hasDragged) {
                    // Snap to the nearest stepSize
                    const snappedValue = Math.round(newValue / stepSize) * stepSize;
                    const clampedValue = Math.max(adjustedMin, Math.min(adjustedMax, snappedValue));

                    if (clampedValue !== currentPriceValue) {
                        updatePriceDisplays(clampedValue);
                    }
                }
            }

            /**
             * Handles the end of dragging.
             * @param {PointerEvent} e
             */
            function handlePointerUp(e) {
                if (isDragging) {
                    isDragging = false;
                    confirmButton.releasePointerCapture(e.pointerId);
                }
            }

            /**
             * Handles the click event.
             * Prevents navigation if a drag occurred; otherwise, proceeds to end.html.
             * @param {MouseEvent} e
             */
            confirmButton.addEventListener('click', (e) => {
                if (hasDragged) {
                    e.preventDefault(); // Prevent navigation if it was a drag
                    hasDragged = false;  // Reset the flag
                } else {
                    e.preventDefault(); // Prevent default action

                    // Get the current price value in agorot from the data attribute
                    const guessPrice = confirmButton.dataset.guessPrice;

                    // Build the URL with parameters, including 'id', 'date', 'type', 'guessPrice'
                    const endUrl = `end.html?date=${encodeURIComponent(dateParam)}&type=${encodeURIComponent(typeParam)}&id=${encodeURIComponent(idParam)}&guessPrice=${encodeURIComponent(guessPrice)}`;

                    // Redirect to end.html with the parameters
                    window.location.href = endUrl;
                }
            });

            // Attach Pointer Event Listeners for Confirm Button Dragging
            confirmButton.addEventListener('pointerdown', handlePointerDown);
            confirmButton.addEventListener('pointermove', handlePointerMove);
            confirmButton.addEventListener('pointerup', handlePointerUp);
            confirmButton.addEventListener('pointercancel', handlePointerUp);

            /**
             * Prevents default drag behavior to avoid unintended issues.
             * @param {DragEvent} e
             */
            confirmButton.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });

            /**
             * Prevent text selection and other default behaviors.
             */
            confirmButton.addEventListener('selectstart', (e) => {
                e.preventDefault();
            });

            /**
             * Update footer using common.js function
             */
            if (typeof updateFooter === 'function') {
                updateFooter(dateParam, location);
            } else {
                // If updateFooter is not defined, manually create the footer
                const footer = document.createElement('footer');
                footer.textContent = 'המחיר נכון להיום, בשופרסל עזריאלי ת״א';
                footer.style.textAlign = 'center';
                footer.style.marginTop = '20px';
                footer.style.fontFamily = 'Rubik, sans-serif';
                document.body.appendChild(footer);
            }
        })
        .catch(error => {
            console.error('Error loading data:', error);
        });
});
