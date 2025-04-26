// Tile-specific functionality

// Add global variables for the current image and dimensions
let currentImageDimensions = { width: 0, height: 0 };

function updateTileSize() {
    const tileSize = document.getElementById('tileSize').value;
    const previewContainer = document.getElementById('previewContainer');

    // Calculate the appropriate width for the tileSize and the aspect ratio of the image
    const aspectRatio = currentImageDimensions.width / currentImageDimensions.height;
    const height = tileSize;
    const width = tileSize * aspectRatio;

    // Apply the width and height to the preview container background size
    previewContainer.style.backgroundSize = `${width}px ${height}px`;
}

function updateImage() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';
    
    if (!currentImage) return;

    // Set the background image of the preview container
    previewContainer.style.backgroundImage = `url(${currentImage})`;

    updateTileSize();
    updatePixelated();
}

// Function to handle image loading and setting dimensions
function handleImageLoad(src) {
    // Create a new image to get dimensions
    const img = new Image();
    img.onload = function() {
        currentImageDimensions.width = this.width;
        currentImageDimensions.height = this.height;
        currentImage = src;
        updateImage();
    };
    img.src = src;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupCommonEventListeners();
    
    // Set up dynamic tooltips for sliders
    setupDynamicTooltips();
    
    const tileSizeSlider = document.getElementById('tileSize');
    tileSizeSlider.addEventListener('input', () => {
        updateTileSize();
        
        // Update the tooltip for the tile size slider
        const container = tileSizeSlider.parentElement;
        if (container && container.dataset.baseTooltip) {
            updateSliderTooltip(tileSizeSlider, container.dataset.baseTooltip);
        }
    });

    // Setup image input handling
    const imageInput = document.getElementById('imageInput');
    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                handleImageLoad(event.target.result);
                
                // Update filename display
                const fileName = e.target.files[0].name;
                document.getElementById('fileNameDisplay').textContent = fileName;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Setup paste functionality
    document.getElementById('pasteImage').addEventListener('click', function() {
        navigator.clipboard.read().then(clipboardItems => {
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        clipboardItem.getType(type).then(blob => {
                            const reader = new FileReader();
                            reader.onload = function(event) {
                                handleImageLoad(event.target.result);
                                document.getElementById('fileNameDisplay').textContent = 'Pasted Image';
                            };
                            reader.readAsDataURL(blob);
                        });
                    }
                }
            }
        });
    });

    // Setup paste from clipboard using Ctrl+V
    document.addEventListener('paste', function(e) {
        if (e.clipboardData && e.clipboardData.items) {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        handleImageLoad(event.target.result);
                        document.getElementById('fileNameDisplay').textContent = 'Pasted Image';
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    });
});
