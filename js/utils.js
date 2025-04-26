// Common utility functions for image manipulation tools

/**
 * Convert RGB values to hex string
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Hex color string without leading #
 */
function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Convert hex color to RGB array
 * @param {string} hex - Hex color string with leading #
 * @returns {number[]} Array of [r, g, b] values (0-255)
 */
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

/**
 * Calculate Euclidean distance between two RGB colors
 * @param {number[]} rgb1 - First RGB color as [r, g, b]
 * @param {number[]} rgb2 - Second RGB color as [r, g, b]
 * @returns {number} Euclidean distance in RGB space
 */
function colourDistance(rgb1, rgb2) {
    return Math.sqrt(
        Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2)
    );
}

/**
 * Checks if a pixel's color is within sensitivity range of target color
 * @param {Uint8ClampedArray} data - Image data array
 * @param {number} index - Starting index of pixel in data array
 * @param {number[]} targetColour - Target RGB color as [r, g, b]
 * @param {number} sensitivity - Tolerance for color matching
 * @returns {boolean} True if pixel matches target color within sensitivity
 */
function isTargetColour(data, index, targetColour, sensitivity) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];

    return (
        Math.abs(r - targetColour[0]) <= sensitivity &&
        Math.abs(g - targetColour[1]) <= sensitivity &&
        Math.abs(b - targetColour[2]) <= sensitivity
    );
}

/**
 * Set a pixel's color in image data array
 * @param {Uint8ClampedArray} data - Image data array
 * @param {number} index - Starting index of pixel in data array
 * @param {number[]} colour - RGB color as [r, g, b]
 */
function setColour(data, index, colour) {
    data[index] = colour[0];
    data[index + 1] = colour[1];
    data[index + 2] = colour[2];
}

/**
 * Updates the tooltip for a slider to show the current value
 * @param {HTMLElement} slider - The slider element
 * @param {string} baseTooltip - The base text for the tooltip
 */
function updateSliderTooltip(slider, baseTooltip) {
    const currentValue = slider.value;
    slider.parentElement.dataset.tooltip = `${baseTooltip}: ${currentValue}`;
}

/**
 * Sets up dynamic tooltips for all sliders
 * Stores the base tooltip text and updates it with current value
 */
function setupDynamicTooltips() {
    // Get all sliders
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
        // Get the parent container which has the data-tooltip attribute
        const container = slider.parentElement;
        if (container && container.hasAttribute('data-tooltip')) {
            // Store the original tooltip text
            const baseTooltip = container.getAttribute('data-tooltip');
            container.dataset.baseTooltip = baseTooltip;
            
            // Update tooltip to include current value
            updateSliderTooltip(slider, baseTooltip);
            
            // Add event listener to update tooltip when slider changes
            slider.addEventListener('input', () => {
                updateSliderTooltip(slider, container.dataset.baseTooltip);
            });
        }
    });
}

/**
 * Handles the mousewheel events on sliders with modifier key support
 * @param {WheelEvent} e - The wheel event
 * @param {HTMLElement} slider - The slider element
 */
function handleSliderWheel(e, slider) {
    // Determine step size based on modifier keys
    let step = 1;
    if (window.isShiftPressed) step = 10;
    if (window.isAltPressed) step = 100;
    
    // Determine direction
    const direction = e.deltaY < 0 ? 1 : -1;
    
    // Calculate new value
    let newValue = parseInt(slider.value) + (direction * step);
    
    // Clamp to min/max
    newValue = Math.min(Math.max(newValue, parseInt(slider.min)), parseInt(slider.max));
    
    // Update slider value
    slider.value = newValue;
}

/**
 * Sets up enhanced slider controls for all range inputs
 * Allows using the mousewheel to change values with modifier key support
 */
function setupEnhancedSliders() {
    const sliders = document.querySelectorAll('input[type="range"]');
    
    sliders.forEach(slider => {
        slider.addEventListener('wheel', (e) => {
            e.preventDefault(); // Prevent page scrolling
            handleSliderWheel(e, slider);
            
            // Trigger the input event to update any related components
            const inputEvent = new Event('input', { bubbles: true });
            slider.dispatchEvent(inputEvent);
            
            // Update tooltip if available
            const container = slider.parentElement;
            if (container && container.dataset.baseTooltip) {
                updateSliderTooltip(slider, container.dataset.baseTooltip);
            }
        });
    });
}

/**
 * Update the shift-hover class on all colour inputs
 */
function updateShiftHoverState() {
    if (!window.targetColours || !window.newColours) return;
    
    // Remove all shift-hover classes first
    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.classList.remove('shift-hover');
    });
    
    // If shift is not pressed, no need to update further
    if (!window.isShiftPressed) return;
    
    // Find any currently hovered colour input
    const hoveredTargetInput = Array.from(window.targetColours).find(input => 
        input === document.activeElement || input.matches(':hover')
    );
    
    const hoveredNewInput = Array.from(window.newColours).find(input => 
        input === document.activeElement || input.matches(':hover')
    );
    
    // Get indices and apply classes to matching pairs
    if (hoveredTargetInput) {
        const index = window.targetColours.indexOf(hoveredTargetInput);
        if (index >= 0 && window.colourCount > 3) {
            hoveredTargetInput.classList.add('shift-hover');
            if (window.newColours[index]) {
                window.newColours[index].classList.add('shift-hover');
            }
        }
    }
    
    if (hoveredNewInput) {
        const index = window.newColours.indexOf(hoveredNewInput);
        if (index >= 0 && window.colourCount > 3) {
            hoveredNewInput.classList.add('shift-hover');
            if (window.targetColours[index]) {
                window.targetColours[index].classList.add('shift-hover');
            }
        }
    }
}

/**
 * Update theme based on toggle state
 */
function updateTheme() {
    const darkModeToggle = document.getElementById('darkMode');
    document.documentElement.setAttribute(
        'data-theme',
        darkModeToggle.checked ? 'dark' : 'light'
    );
}

/**
 * Common function to update pixelated state
 */
function updatePixelated() {
    const pixelatedToggle = document.getElementById('pixelated');
    const previewContainer = document.getElementById('previewContainer');
    
    if (pixelatedToggle.checked) {
        previewContainer.classList.add('pixelated');
    } else {
        previewContainer.classList.remove('pixelated');
    }
}

/**
 * Get the download filename based on the original image name with a custom suffix
 * @param {string} suffix - Suffix to append to filename (e.g., "-resized", "-recoloured")
 * @param {string} [dimensions] - Optional dimensions to add to filename (e.g., "512x512")
 * @returns {string} Filename for the download
 */
function getDownloadFilename(suffix, dimensions) {
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    let fileName = `image${suffix}.png`;
    
    if (fileNameDisplay.textContent !== 'Choose Image') {
        const originalName = fileNameDisplay.textContent;
        const nameParts = originalName.split('.');
        // Remove the extension and add suffix
        if (nameParts.length > 1) {
            nameParts.pop(); // Remove extension
        }
        
        if (dimensions) {
            fileName = `${nameParts.join('.')}-${suffix}-${dimensions}.png`;
        } else {
            fileName = `${nameParts.join('.')}-${suffix}.png`;
        }
    }
    
    return fileName;
}