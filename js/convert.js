// Convert-specific functionality

//#region Variables
let currentFormat = 'image/png'; // Default format
let quality = 85; // Default quality for lossy formats (0-100)
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

    // Create wrapper for the original image on the left
    const originalImageWrapper = document.createElement('div');
    originalImageWrapper.classList.add('image-wrapper', 'original', 'source-image-wrapper');
    const originalImage = new Image();
    originalImage.src = currentImage;
    originalImageWrapper.appendChild(originalImage);

    // Create wrapper for the converted image on the right
    const convertedImageWrapper = document.createElement('div');
    convertedImageWrapper.classList.add('image-wrapper', 'recoloured', 'output-image-wrapper');
    
    previewContainer.appendChild(originalImageWrapper);
    previewContainer.appendChild(convertedImageWrapper);
    
    // Apply pixelation setting
    updatePixelated();
    
    // Update the image zoom
    updateImageZoom();

    // Generate converted image when the original image loads
    originalImage.onload = () => {
        convertImage();
        
        // Reattach context menus to the new images
        if (typeof reattachImageContextMenus === 'function') {
            reattachImageContextMenus();
        }
    };
}

/**
 * Convert the image to the selected format and display it
 */
function convertImage() {
    if (!currentImage) return;
    
    const format = document.getElementById('exportFormat').value;
    const qualityValue = document.getElementById('quality').value / 100; // Convert to 0-1 range
    const qualitySlider = document.querySelector('.quality-slider');
    
    // Show/hide quality slider based on format
    if (format === 'image/png' || format === 'image/gif') {
        qualitySlider.style.display = 'none';
    } else {
        qualitySlider.style.display = 'flex';
    }
    
    // Create canvas to convert the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load the original image
    const image = new Image();
    image.src = currentImage;
    
    image.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Draw the image on the canvas
        ctx.drawImage(image, 0, 0);
        
        // Get the data URL with the selected format and quality
        let convertedDataUrl;
        if (format === 'image/jpeg' || format === 'image/webp') {
            convertedDataUrl = canvas.toDataURL(format, qualityValue);
        } else {
            convertedDataUrl = canvas.toDataURL(format);
        }
        
        // Update the converted image in the preview
        const convertedImageWrapper = document.querySelector('.image-wrapper.recoloured');
        if (convertedImageWrapper) {
            // Clear previous content
            convertedImageWrapper.innerHTML = '';
            
            // Create and add the new image
            const convertedImage = new Image();
            convertedImage.src = convertedDataUrl;
            convertedImageWrapper.appendChild(convertedImage);
            
            // Store the converted data URL for download/copy
            convertedImageWrapper.dataset.convertedUrl = convertedDataUrl;
            
            // Calculate file size reduction
            const originalSize = calculateDataUrlSize(currentImage);
            const convertedSize = calculateDataUrlSize(convertedDataUrl);

            const sizeReduction = ((originalSize - convertedSize) / originalSize * 100).toFixed(1);
            const reductionText = sizeReduction < 0 ? 'Increase' : 'Reduction';
            
            // Display file size information
            const sizeInfo = document.createElement('div');
            sizeInfo.classList.add('size-info');
            sizeInfo.innerHTML = `
                <div>Original: ${formatFileSize(originalSize)}</div>
                <div>Converted: ${formatFileSize(convertedSize)}</div>
                <div>${reductionText}: ${Math.abs(sizeReduction)}%</div>
            `;
            convertedImageWrapper.appendChild(sizeInfo);
        }
    };
}

/**
 * Calculate the approximate size of a data URL in bytes
 */
function calculateDataUrlSize(dataUrl) {
    // Remove the data: URL prefix and get just the base64 part
    const base64 = dataUrl.split(',')[1];
    // Base64 encodes 3 bytes in 4 chars, so we calculate actual size
    return Math.floor((base64.length * 3) / 4);
}

/**
 * Format a byte size into a human-readable format
 */
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

/**
 * Download the converted image
 */
function downloadConvertedImage() {
    if (!currentImage) {
        alert('Please upload an image first');
        return;
    }
    
    const format = document.getElementById('exportFormat').value;
    const qualityValue = document.getElementById('quality').value / 100;
    const extension = format.split('/')[1];
    
    // Create a canvas for the conversion
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load the original image
    const image = new Image();
    image.src = currentImage;
    
    image.onload = () => {
        // Set canvas dimensions
        canvas.width = image.width;
        canvas.height = image.height;
        
        // Draw the image
        ctx.drawImage(image, 0, 0);
        
        // Create a temporary link for download
        const link = document.createElement('a');
        
        // Generate filename
        const fileName = getDownloadFilename('converted', extension);
        
        // Set download properties
        link.download = fileName;
        
        // Generate the appropriate data URL based on format
        if (format === 'image/jpeg' || format === 'image/webp') {
            link.href = canvas.toDataURL(format, qualityValue);
        } else {
            link.href = canvas.toDataURL(format);
        }
        
        // Trigger the download
        link.click();
    };
}

/**
 * Copy the Data URL to clipboard
 */
function copyDataUrlToClipboard() {
    const convertedImageWrapper = document.querySelector('.image-wrapper.recoloured');
    if (!convertedImageWrapper || !convertedImageWrapper.dataset.convertedUrl) {
        alert('Please upload and convert an image first');
        return;
    }
    
    const dataUrl = convertedImageWrapper.dataset.convertedUrl;
    
    // Copy to clipboard
    navigator.clipboard.writeText(dataUrl)
        .then(() => {
            // Create a toast notification
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.textContent = 'Data URL copied to clipboard';
            document.body.appendChild(toast);
            
            // Remove toast after animation
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 500);
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy data URL: ', err);
            alert('Failed to copy data URL to clipboard');
        });
}
//#endregion

//#region Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Set up common event listeners
    setupCommonEventListeners();
    
    // Set up dynamic tooltips
    setupDynamicTooltips();
    
    // Get elements
    const imageSizeSlider = document.getElementById('imageSize');
    const exportFormatSelect = document.getElementById('exportFormat');
    const qualitySlider = document.getElementById('quality');
    const downloadButton = document.getElementById('downloadButton');
    const copyDataUrlButton = document.getElementById('copyDataUrlButton');
    
    // Add custom styles for the size info
    const style = document.createElement('style');
    style.textContent = `
        .size-info {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: var(--control-bg);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            color: var(--text-color);
            display: flex;
            flex-direction: column;
            gap: 4px;
            backdrop-filter: blur(8px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .toast-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--control-bg);
            color: var(--text-color);
            padding: 10px 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            z-index: 2000;
            animation: fade-in 0.3s;
            backdrop-filter: blur(8px);
        }
        
        .toast-notification.fade-out {
            animation: fade-out 0.3s;
        }
        
        @keyframes fade-in {
            from { opacity: 0; transform: translate(-50%, 20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
        
        @keyframes fade-out {
            from { opacity: 1; transform: translate(-50%, 0); }
            to { opacity: 0; transform: translate(-50%, 20px); }
        }
    `;
    document.head.appendChild(style);
    
    // Add event listeners
    imageSizeSlider.addEventListener('input', () => {
        updateImageZoom();
        
        // Update tooltip
        const container = imageSizeSlider.parentElement;
        if (container && container.dataset.baseTooltip) {
            updateSliderTooltip(imageSizeSlider, container.dataset.baseTooltip);
        }
    });
    
    exportFormatSelect.addEventListener('change', convertImage);
    
    qualitySlider.addEventListener('input', () => {
        // Only reconvert if it's a format that uses quality
        const format = exportFormatSelect.value;
        if (format === 'image/jpeg' || format === 'image/webp') {
            convertImage();
        }
        
        // Update tooltip
        const container = qualitySlider.parentElement;
        if (container && container.dataset.baseTooltip) {
            updateSliderTooltip(qualitySlider, container.dataset.baseTooltip);
        }
    });
    
    downloadButton.addEventListener('click', downloadConvertedImage);
    copyDataUrlButton.addEventListener('click', copyDataUrlToClipboard);
    
    // Initialize quality slider visibility
    const initialFormat = exportFormatSelect.value;
    const qualitySliderContainer = document.querySelector('.quality-slider');
    qualitySliderContainer.style.display = (initialFormat === 'image/png' || initialFormat === 'image/gif') ? 'none' : 'flex';
    
    // Initialize the context menus - use the default ones
    if (typeof defineDefaultContextMenus === 'function') {
        defineDefaultContextMenus();
    }
});
//#endregion