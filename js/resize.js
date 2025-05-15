// Resize-specific functionality

//#region Variables
let lockAspectRatio = true;
let originalAspectRatio = 1; // Will be calculated when image loads
let resizeMode = 'linear'; // Default resize mode: 'linear' or 'point'
//#endregion

//#region Functions
function updateImageZoom() {
    const scale = document.getElementById('imageSize').value / 100;
    document.documentElement.style.setProperty('--image-scale', scale);
}

function updateImage() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';
    
    if (!currentImage) return;

    // Create canvas for the original image on the left
    const originalImageWrapper = document.createElement('div');
    originalImageWrapper.classList.add('image-wrapper', 'original', 'source-image-wrapper');
    const originalImage = new Image();
    originalImage.src = currentImage;
    originalImageWrapper.appendChild(originalImage);

    // Create canvas for the resized image on the right
    const resizedImageWrapper = document.createElement('div');
    resizedImageWrapper.classList.add('image-wrapper', 'recoloured', 'output-image-wrapper'); // Reuse the 'recoloured' class for styling
    
    // Resized image will be created in resizeImage()
    
    previewContainer.appendChild(originalImageWrapper);
    previewContainer.appendChild(resizedImageWrapper);
    
    // Apply pixelation setting
    updatePixelated();
    
    // Update the image zoom
    updateImageZoom();

    // Calculate original aspect ratio when image loads
    originalImage.onload = () => {
        originalAspectRatio = originalImage.width / originalImage.height;
        
        // Set initial slider values based on the image dimensions
        const widthSlider = document.getElementById('resizeWidth');
        const heightSlider = document.getElementById('resizeHeight');
        
        // Set initial width and height to maintain aspect ratio within slider limits
        let initialWidth = Math.min(originalImage.width, 512);
        let initialHeight = Math.round(initialWidth / originalAspectRatio);
        
        // Make sure height is also within limits
        if (initialHeight > 4096) {
            initialHeight = 4096;
            initialWidth = Math.round(initialHeight * originalAspectRatio);
        }
        
        // Update sliders and display values
        widthSlider.value = initialWidth;
        heightSlider.value = initialHeight;
        
        // Resize the image with the initial dimensions
        resizeImage();
        
        // Reattach context menus to the new images
        if (typeof reattachImageContextMenus === 'function') {
            reattachImageContextMenus();
        }
    };
}

function resizeImage() {
    if (!currentImage) return;
    
    const width = parseInt(document.getElementById('resizeWidth').value);
    const height = parseInt(document.getElementById('resizeHeight').value);
        
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to the target resize dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Apply the selected resize mode
    if (resizeMode === 'point') {
        // Point resize (pixelated)
        ctx.imageSmoothingEnabled = false;
    } else {
        // Linear resize (smooth)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
    
    const image = new Image();
    image.src = currentImage;
    
    image.onload = () => {
        // Draw the image at the specified dimensions
        ctx.drawImage(image, 0, 0, width, height);
        
        // Get the data URL for the resized image
        const resizedDataUrl = canvas.toDataURL();
        
        // Update the resized image in the preview
        const resizedImageWrapper = document.querySelector('.image-wrapper.recoloured');
        if (resizedImageWrapper) {
            // Clear previous content
            resizedImageWrapper.innerHTML = '';
            
            // Create and add the new image
            const resizedImage = new Image();
            resizedImage.src = resizedDataUrl;
            resizedImageWrapper.appendChild(resizedImage);
        }
    };
}

function handleAspectRatioChange(dimension) {
    if (!currentImage) return;
    
    const widthSlider = document.getElementById('resizeWidth');
    const heightSlider = document.getElementById('resizeHeight');
    
    if (lockAspectRatio) {
        if (dimension === 'width') {
            // Width changed, update height
            const newWidth = parseInt(widthSlider.value);
            const newHeight = Math.round(newWidth / originalAspectRatio);
            
            // Check if the new height is within limits
            if (newHeight >= 1 && newHeight <= 4096) {
                heightSlider.value = newHeight;
            }
        } else {
            // Height changed, update width
            const newHeight = parseInt(heightSlider.value);
            const newWidth = Math.round(newHeight * originalAspectRatio);
            
            // Check if the new width is within limits
            if (newWidth >= 1 && newWidth <= 4096) {
                widthSlider.value = newWidth;
            }
        }
    }
    
    resizeImage();
}

function downloadResizedImage() {
    const width = parseInt(document.getElementById('resizeWidth').value);
    const height = parseInt(document.getElementById('resizeHeight').value);
    
    downloadProcessedImage(callback => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions to the target resize dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Apply the selected resize mode
        if (resizeMode === 'point') {
            ctx.imageSmoothingEnabled = false;
        } else {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }
        
        const image = new Image();
        image.src = currentImage;
        
        image.onload = () => {
            // Draw the image at the specified dimensions
            ctx.drawImage(image, 0, 0, width, height);
            // Execute callback with the canvas
            callback(canvas);
        };
    }, 'resized', `${width}x${height}`);
}

function updateResizeMode() {
    resizeMode = document.getElementById('resizeMode').value;
    resizeImage(); // Update image with new resize mode
}
//#endregion

//#region Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupCommonEventListeners();
    
    // Set up dynamic tooltips for sliders
    setupDynamicTooltips();
    
    // Get elements
    const resizeWidthSlider = document.getElementById('resizeWidth');
    const resizeHeightSlider = document.getElementById('resizeHeight');
    const lockAspectRatioToggle = document.getElementById('lockAspectRatio');
    const imageSizeSlider = document.getElementById('imageSize');
    const downloadButton = document.getElementById('downloadButton');
    const resizeModeSelect = document.getElementById('resizeMode');
    
    // Add event listeners
    resizeWidthSlider.addEventListener('input', () => {
        handleAspectRatioChange('width');
        
        // Update the tooltip
        const container = resizeWidthSlider.parentElement;
        if (container && container.dataset.baseTooltip) {
            updateSliderTooltip(resizeWidthSlider, container.dataset.baseTooltip);
            updateSliderTooltip(resizeHeightSlider, container.dataset.baseTooltip);
        }
    });
    
    resizeHeightSlider.addEventListener('input', () => {
        handleAspectRatioChange('height');
        
        // Update the tooltip
        const container = resizeHeightSlider.parentElement;
        if (container && container.dataset.baseTooltip) {
            updateSliderTooltip(resizeHeightSlider, container.dataset.baseTooltip);
            updateSliderTooltip(resizeWidthSlider, container.dataset.baseTooltip);
        }
    });
    
    lockAspectRatioToggle.addEventListener('change', () => {
        lockAspectRatio = lockAspectRatioToggle.checked;
    });
    
    imageSizeSlider.addEventListener('input', () => {
        updateImageZoom();
        
        // Update the tooltip
        const container = imageSizeSlider.parentElement;
        if (container && container.dataset.baseTooltip) {
            updateSliderTooltip(imageSizeSlider, container.dataset.baseTooltip);
        }
    });
    
    downloadButton.addEventListener('click', downloadResizedImage);
    
    // Add event listener for resize mode
    if (resizeModeSelect) {
        resizeModeSelect.addEventListener('change', updateResizeMode);
    }
});

//#endregion