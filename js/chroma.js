//#region Variables
let colourCount = 3;
let targetColours = [];
let newColours = [];

// Default colours - red, green, blue for target; yellow, magenta, cyan for new
const defaultTargetColours = [
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue
    '#000000', // Black (default for additional colours)
];

const defaultNewColours = [
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan
    '#000000', // Black (default for additional colours)
];

// UI elements
const colourCountSlider = document.getElementById('colorCount');
const targetColourContainer = document.getElementById('targetColorContainer');
const newColourContainer = document.getElementById('newColorContainer');

const multiplierModeToggle = document.getElementById('multiplierMode');
const colourSensitivitySlider = document.getElementById('colourSensitivity');
const imageZoomSlider = document.getElementById('imageSize');
const detectColoursButton = document.getElementById('detectColors');
const downloadButton = document.getElementById('downloadButton');
//#endregion

//#region Functions
function initializeColourInputs() {
    // Create arrays to store input elements
    targetColours = [];
    newColours = [];
    
    // Update display
    updateColourPairCount();
    
    // Initial recolour if image is loaded
    if (currentImage) {
        recolourImage();
    }
}

function updateColourPairCount() {
    const newColourCount = parseInt(colourCountSlider.value);
    
    // Store existing colour values
    const existingTargetColours = [];
    const existingNewColours = [];
    
    targetColours.forEach(input => {
        existingTargetColours.push(input.value);
    });
    
    newColours.forEach(input => {
        existingNewColours.push(input.value);
    });
    
    // Clear existing colour inputs
    targetColourContainer.innerHTML = '';
    newColourContainer.innerHTML = '';
    
    // Reset arrays
    targetColours = [];
    newColours = [];
    
    // Generate new colour inputs (horizontal layout)
    for (let i = 0; i < newColourCount; i++) {
        // Target colour
        const targetColourInput = document.createElement('input');
        targetColourInput.type = 'color';
        targetColourInput.id = `targetColour${i + 1}`;
        
        // Use existing colour, default defined colour, or black for new colours
        if (i < existingTargetColours.length) {
            targetColourInput.value = existingTargetColours[i];
        } else if (i < defaultTargetColours.length) {
            targetColourInput.value = defaultTargetColours[i];
        } else {
            targetColourInput.value = '#000000'; // Black for any additional colours
        }
        
        targetColourInput.addEventListener('input', recolourImage);
        
        // Add shift-click to remove colour pairs
        targetColourInput.addEventListener('click', (e) => {
            if (e.shiftKey && colourCount > 3) { // Don't allow removing if only 3 pairs remain
                removeColourPair(i);
                e.preventDefault(); // Prevent color picker from opening
            }
        });
        
        // Add hover events to update visual indicators
        targetColourInput.addEventListener('mouseenter', updateShiftHoverState);
        targetColourInput.addEventListener('mouseleave', updateShiftHoverState);
        
        targetColourInput.dataset.tooltip = "Shift+click to remove this colour pair";
        targetColourContainer.appendChild(targetColourInput);
        
        // New colour
        const newColourInput = document.createElement('input');
        newColourInput.type = 'color';
        newColourInput.id = `colour${i + 1}`;
        
        // Use existing colour, default defined colour, or black for new colours
        if (i < existingNewColours.length) {
            newColourInput.value = existingNewColours[i];
        } else if (i < defaultNewColours.length) {
            newColourInput.value = defaultNewColours[i];
        } else {
            newColourInput.value = '#000000'; // Black for any additional colours
        }
        
        newColourInput.addEventListener('input', recolourImage);
        
        // Add shift-click to remove colour pairs
        newColourInput.addEventListener('click', (e) => {
            if (e.shiftKey && colourCount > 3) { // Don't allow removing if only 3 pairs remain
                removeColourPair(i);
                e.preventDefault(); // Prevent color picker from opening
            }
        });
        
        // Add hover events to update visual indicators
        newColourInput.addEventListener('mouseenter', updateShiftHoverState);
        newColourInput.addEventListener('mouseleave', updateShiftHoverState);
        
        if (i === 1) { // Secondary colour can be disabled in multiplier mode
            if (multiplierModeToggle.checked) {
                newColourInput.disabled = true;
            }
            
            newColourInput.classList.add('secondary-colour');
        }
        
        newColourInput.dataset.tooltip = "Shift+click to remove this colour pair";
        newColourContainer.appendChild(newColourInput);
        
        // Store references to inputs
        targetColours.push(targetColourInput);
        newColours.push(newColourInput);
    }
    
    // Only update the colour count if it actually changed
    if (colourCount !== newColourCount) {
        colourCount = newColourCount;
    }
    
    // Make colour arrays globally available for the shift-hover functionality
    window.targetColours = targetColours;
    window.newColours = newColours;
    window.colourCount = colourCount;
    
    // Apply colour changes immediately
    recolourImage();
}

function removeColourPair(index) {
    // Store all current colour values
    const currentTargetColours = targetColours.map(input => input.value);
    const currentNewColours = newColours.map(input => input.value);
    
    // Remove the colour at the specified index
    currentTargetColours.splice(index, 1);
    currentNewColours.splice(index, 1);
    
    // Update the colour count slider
    colourCount--;
    colourCountSlider.value = colourCount;
    
    // Update global values
    window.colourCount = colourCount;
    
    // Clear existing colour inputs and arrays
    targetColourContainer.innerHTML = '';
    newColourContainer.innerHTML = '';
    targetColours = [];
    newColours = [];
    
    // Regenerate colour inputs with updated values
    for (let i = 0; i < colourCount; i++) {
        // Target colour
        const targetColourInput = document.createElement('input');
        targetColourInput.type = 'color';
        targetColourInput.id = `targetColour${i + 1}`;
        targetColourInput.value = currentTargetColours[i];
        targetColourInput.addEventListener('input', recolourImage);
        
        // Add shift-click to remove colour pairs
        targetColourInput.addEventListener('click', (e) => {
            if (e.shiftKey && colourCount > 3) {
                removeColourPair(i);
                e.preventDefault();
            }
        });
        
        // Add hover events to update visual indicators
        targetColourInput.addEventListener('mouseenter', updateShiftHoverState);
        targetColourInput.addEventListener('mouseleave', updateShiftHoverState);
        
        targetColourInput.dataset.tooltip = "Shift+click to remove this colour pair";
        targetColourContainer.appendChild(targetColourInput);
        
        // New colour
        const newColourInput = document.createElement('input');
        newColourInput.type = 'color';
        newColourInput.id = `colour${i + 1}`;
        newColourInput.value = currentNewColours[i];
        newColourInput.addEventListener('input', recolourImage);
        
        // Add shift-click to remove colour pairs
        newColourInput.addEventListener('click', (e) => {
            if (e.shiftKey && colourCount > 3) {
                removeColourPair(i);
                e.preventDefault();
            }
        });
        
        // Add hover events to update visual indicators
        newColourInput.addEventListener('mouseenter', updateShiftHoverState);
        newColourInput.addEventListener('mouseleave', updateShiftHoverState);
        
        if (i === 1) { // Secondary colour can be disabled in multiplier mode
            if (multiplierModeToggle.checked) {
                newColourInput.disabled = true;
            }
            
            newColourInput.classList.add('secondary-colour');
        }
        
        newColourInput.dataset.tooltip = "Shift+click to remove this colour pair";
        newColourContainer.appendChild(newColourInput);
        
        // Store references to inputs
        targetColours.push(targetColourInput);
        newColours.push(newColourInput);
    }
    
    // Update global references for shift-hover functionality
    window.targetColours = targetColours;
    window.newColours = newColours;
    
    // Apply colour changes immediately
    recolourImage();
}

function updateImage() {
    recolourImage();
}

function recolourImage() {
    if (!currentImage) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = currentImage;

    image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const sensitivity = parseInt(colourSensitivitySlider.value);
        
        // If multiplier mode is enabled, calculate secondary colour
        if (multiplierModeToggle.checked && newColours.length > 1) {
            const primaryColour = hexToRgb(newColours[0].value);
            const secondaryColour = primaryColour.map(value => Math.round(value * 0.85));
            
            // Convert back to hex and update the input
            const r = secondaryColour[0].toString(16).padStart(2, '0');
            const g = secondaryColour[1].toString(16).padStart(2, '0');
            const b = secondaryColour[2].toString(16).padStart(2, '0');
            newColours[1].value = `#${r}${g}${b}`;
        }

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            // Check each colour pair
            for (let j = 0; j < colourCount; j++) {
                const targetColour = hexToRgb(targetColours[j].value);
                if (isTargetColour(data, i, targetColour, sensitivity)) {
                    const newColour = hexToRgb(newColours[j].value);
                    setColour(data, i, newColour);
                    break; // Once we've recolored for this pair, don't check others
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);

        const originalImageWrapper = document.createElement('div');
        originalImageWrapper.classList.add('image-wrapper', 'original');
        const originalImage = new Image();
        originalImage.src = currentImage;
        originalImageWrapper.appendChild(originalImage);

        const recolouredImageWrapper = document.createElement('div');
        recolouredImageWrapper.classList.add('image-wrapper', 'recoloured');
        const recolouredImage = new Image();
        recolouredImage.src = canvas.toDataURL();
        recolouredImageWrapper.appendChild(recolouredImage);

        previewContainer.innerHTML = '';
        previewContainer.appendChild(originalImageWrapper);
        previewContainer.appendChild(recolouredImageWrapper);
    };
}

function detectDominantColours() {
    if (!currentImage) {
        alert('Please upload an image first');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = currentImage;

    image.onload = () => {
        // Scale down the image to reduce processing time if needed
        const maxDimension = 300;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Create a colour map to count occurrences of each colour
        const colourMap = new Map();
        
        // Sampling interval - not every pixel is necessary for a good sample
        const samplingInterval = Math.max(1, Math.floor(data.length / 4 / 100000));
        
        // Process pixels to find unique colours
        for (let i = 0; i < data.length; i += 4 * samplingInterval) {
            // Skip transparent pixels
            if (data[i + 3] < 128) continue;
            
            // Quantize the colours to reduce the number of unique colours
            // This bins similar colours together
            const r = Math.floor(data[i] / 8) * 8;
            const g = Math.floor(data[i + 1] / 8) * 8;
            const b = Math.floor(data[i + 2] / 8) * 8;
            
            const key = `${r},${g},${b}`;
            
            if (colourMap.has(key)) {
                colourMap.set(key, colourMap.get(key) + 1);
            } else {
                colourMap.set(key, 1);
            }
        }
        
        // Convert map to array and sort by count (descending)
        const colourCounts = Array.from(colourMap.entries())
            .map(([key, count]) => {
                const [r, g, b] = key.split(',').map(Number);
                return { colour: `#${rgbToHex(r, g, b)}`, count, rgb: [r, g, b] };
            })
            .sort((a, b) => b.count - a.count);
        
        // Filter colours by ensuring enough distance between them to avoid too-similar colours
        const distinctColours = [];
        const minDistance = 30; // Euclidean distance threshold in RGB space
        
        for (const colourInfo of colourCounts) {
            // Check if this colour is distinct enough from colours we've already selected
            let isDistinct = true;
            for (const selectedColour of distinctColours) {
                const distance = colourDistance(colourInfo.rgb, selectedColour.rgb);
                if (distance < minDistance) {
                    isDistinct = false;
                    break;
                }
            }
            
            if (isDistinct) {
                distinctColours.push(colourInfo);
                if (distinctColours.length >= 12) {  // Maximum supported colours
                    break;
                }
            }
        }
        
        // Update the colour count and target colours
        const detectedCount = Math.min(distinctColours.length, 12);
        
        // Update the colour count slider
        colourCountSlider.value = detectedCount;
        colourCount = detectedCount;
        
        // Update the colour UI
        updateColourPairCount();
        
        // Set the target colours to the detected colours
        for (let i = 0; i < detectedCount; i++) {
            targetColours[i].value = distinctColours[i].colour;
        }
        
        // Apply colour changes immediately
        recolourImage();
    };
}

function updateMultiplierMode() {
    const secondaryColourInputs = document.querySelectorAll('.secondary-colour');
    secondaryColourInputs.forEach(input => {
        input.disabled = multiplierModeToggle.checked;
    });
    recolourImage();
}

function updateImageZoom() {
    const scale = imageZoomSlider.value / 100;
    document.documentElement.style.setProperty('--image-scale', scale);
}

function defaultImageZoom() {
    imageZoomSlider.value = window.innerWidth / 2 * 0.45;
    updateImageZoom();
}

function downloadRecolouredImage() {
    downloadProcessedImage(callback => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Load the original image
        const image = new Image();
        image.src = currentImage;
        
        image.onload = () => {
            // Set canvas dimensions to match image
            canvas.width = image.width;
            canvas.height = image.height;
            
            // Draw the original image
            ctx.drawImage(image, 0, 0);
            
            // Get image data for processing
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const sensitivity = parseInt(colourSensitivitySlider.value);
            
            // If multiplier mode is enabled, calculate secondary colour
            if (multiplierModeToggle.checked && newColours.length > 1) {
                const primaryColour = hexToRgb(newColours[0].value);
                const secondaryColour = primaryColour.map(value => Math.round(value * 0.85));
                
                // Convert back to hex and update the input
                const r = secondaryColour[0].toString(16).padStart(2, '0');
                const g = secondaryColour[1].toString(16).padStart(2, '0');
                const b = secondaryColour[2].toString(16).padStart(2, '0');
                newColours[1].value = `#${r}${g}${b}`;
            }
            
            // Process each pixel as in recolourImage()
            for (let i = 0; i < data.length; i += 4) {
                // Check each colour pair
                for (let j = 0; j < colourCount; j++) {
                    const targetColour = hexToRgb(targetColours[j].value);
                    if (isTargetColour(data, i, targetColour, sensitivity)) {
                        const newColour = hexToRgb(newColours[j].value);
                        setColour(data, i, newColour);
                        break; // Once we've recolored for this pair, don't check others
                    }
                }
            }
            
            // Update the canvas with the recolored image data
            ctx.putImageData(imageData, 0, 0);
            
            // Execute callback with the canvas
            callback(canvas);
        };
    }, 'recoloured');
}
//#endregion

//#region Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupCommonEventListeners();
    
    // Set up dynamic tooltips for sliders
    setupDynamicTooltips();
    
    colourCountSlider.addEventListener('input', () => {
        updateColourPairCount();
        
        // Update the tooltip for the colour count slider
        const container = colourCountSlider.parentElement;
        if (container && container.dataset.baseTooltip) {
            updateSliderTooltip(colourCountSlider, container.dataset.baseTooltip);
        }
    });
    
    multiplierModeToggle.addEventListener('change', updateMultiplierMode);
    colourSensitivitySlider.addEventListener('input', recolourImage);
    imageZoomSlider.addEventListener('input', updateImageZoom);
    detectColoursButton.addEventListener('click', detectDominantColours);
    downloadButton.addEventListener('click', downloadRecolouredImage);
    
    // Initialize colour inputs
    initializeColourInputs();
    
    defaultImageZoom();
});
//#endregion
