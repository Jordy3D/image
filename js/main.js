// Common variables and event listeners for all tools

//#region Variables
let currentImage = null; // Will store the data URL of the current image

// Track key states for enhanced controls
window.isShiftPressed = false;
window.isCtrlPressed = false;
window.isAltPressed = false;
//#endregion

//#region Functions
function setupCommonEventListeners() {
    // Add listeners for files
    const imageInput = document.getElementById('imageInput');
    const fileInputContainer = document.querySelector('.file-input-container');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const previewContainer = document.getElementById('previewContainer');

    if (imageInput) {
        // Handle file input changes
        imageInput.addEventListener('change', handleImageSelection);
        
        // Handle drag and drop on the container
        fileInputContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileInputContainer.classList.add('drag-over');
        });
        
        fileInputContainer.addEventListener('dragleave', () => {
            fileInputContainer.classList.remove('drag-over');
        });
        
        fileInputContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            fileInputContainer.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length) {
                imageInput.files = e.dataTransfer.files;
                handleImageSelection(e);
            }
        });

        // Also handle drag and drop specifically on the file name display button
        if (fileNameDisplay) {
            fileNameDisplay.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileInputContainer.classList.add('drag-over');
            });
            
            fileNameDisplay.addEventListener('dragleave', () => {
                fileInputContainer.classList.remove('drag-over');
            });
            
            fileNameDisplay.addEventListener('drop', (e) => {
                e.preventDefault();
                fileInputContainer.classList.remove('drag-over');
                
                if (e.dataTransfer.files.length) {
                    imageInput.files = e.dataTransfer.files;
                    handleImageSelection({target: {files: e.dataTransfer.files}});
                }
            });
        }
    }
    
    // Handle key presses for modifier keys
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift') {
            window.isShiftPressed = true;
            updateShiftHoverState();
        } else if (e.key === 'Control') {
            window.isCtrlPressed = true;
        } else if (e.key === 'Alt') {
            window.isAltPressed = true;
        }
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
            window.isShiftPressed = false;
            updateShiftHoverState();
        } else if (e.key === 'Control') {
            window.isCtrlPressed = false;
        } else if (e.key === 'Alt') {
            window.isAltPressed = false;
        }
    });
    
    // Handle paste from clipboard
    document.addEventListener('paste', handlePaste);
    
    // Set up context menu
    if (typeof setupContextMenu === 'function') {
        setupContextMenu();
    } else if (typeof defineDefaultContextMenus === 'function') {
        defineDefaultContextMenus();
    }
    
    // Setup the dark mode toggle if it exists
    const darkModeToggle = document.getElementById('darkMode');
    if (darkModeToggle) {
        // Set initial state from localStorage
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        darkModeToggle.checked = isDarkMode;
        
        // Apply the current theme
        updateTheme();
        
        // Set up event listener
        darkModeToggle.addEventListener('change', () => {
            updateTheme();
            localStorage.setItem('darkMode', darkModeToggle.checked);
        });
    }
    
    // Setup the pixelated toggle if it exists
    const pixelatedToggle = document.getElementById('pixelated');
    if (pixelatedToggle) {
        // Set initial state from localStorage
        const isPixelated = localStorage.getItem('pixelated') === 'true';
        pixelatedToggle.checked = isPixelated;
        
        // Apply the current pixelated state
        updatePixelated();
        
        // Set up event listener
        pixelatedToggle.addEventListener('change', () => {
            updatePixelated();
            localStorage.setItem('pixelated', pixelatedToggle.checked);
        });
    }
    
    // Set up slider enhancements
    setupEnhancedSliders();
    
    // Set up controls collapse/expand
    const hidebar = document.getElementById('hidebar');
    if (hidebar) {
        let controlsFolded = localStorage.getItem('controlsFolded') === 'true';
        const controls = document.querySelector('.controls');
        
        // Apply initial state
        if (controlsFolded) {
            controls.classList.add('folded');
            hidebar.dataset.tooltip = 'Show Controls';
        } else {
            hidebar.dataset.tooltip = 'Hide Controls';
        }
        
        hidebar.addEventListener('click', () => {
            controlsFolded = !controlsFolded;
            localStorage.setItem('controlsFolded', controlsFolded);
            
            if (controlsFolded) {
                controls.classList.add('folded');
                hidebar.dataset.tooltip = 'Show Controls';
            } else {
                controls.classList.remove('folded');
                hidebar.dataset.tooltip = 'Hide Controls';
            }
        });
    }
    
    // Initialize image wrappers with proper classes for context menus
    if (typeof getOrCreateImageWrappers === 'function') {
        getOrCreateImageWrappers();
    }
}

function handleImageSelection(event) {
    const file = event.target.files[0];
    if (file) {
        const fileNameDisplay = document.getElementById('fileNameDisplay');
        
        // Update the file name display
        if (fileNameDisplay) {
            fileNameDisplay.textContent = file.name;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            updateImage();
        };
        reader.readAsDataURL(file);
    }
}

function handlePaste(e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImage = e.target.result;
                
                // Update the displayed file name
                const fileNameDisplay = document.getElementById('fileNameDisplay');
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = 'Pasted Image';
                }
                
                updateImage(); // This function will be defined in each tool's JS file
            };
            reader.readAsDataURL(blob);
            break;
        }
    }
}

function requestClipboardAccess() {
    navigator.clipboard.read().then(data => {
        for (const item of data) {
            if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
                item.getType(item.types.find(t => t.startsWith('image/')))
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            currentImage = e.target.result;
                            
                            // Update the displayed file name
                            const fileNameDisplay = document.getElementById('fileNameDisplay');
                            if (fileNameDisplay) {
                                fileNameDisplay.textContent = 'Pasted Image';
                            }
                            
                            updateImage();
                        };
                        reader.readAsDataURL(blob);
                    });
                break;
            }
        }
    }).catch(err => {
        console.error('Failed to read clipboard: ', err);
        alert('Couldn\'t access clipboard. Please use Ctrl+V to paste directly.');
    });
}

/**
 * Common download function for processed images
 * @param {Function} imageProcessor - Function that processes the image and returns a canvas
 * @param {string} suffix - Suffix for the downloaded filename
 * @param {string} [dimensions] - Optional dimensions string (e.g., "512x512")
 */
function downloadProcessedImage(imageProcessor, suffix, dimensions) {
    if (!currentImage) {
        alert('Please upload an image first');
        return;
    }
    
    // Process the image and get a canvas
    imageProcessor(canvas => {
        // Create a temporary link to download the processed image
        const link = document.createElement('a');
        
        // Get filename with appropriate suffix
        const fileName = getDownloadFilename(suffix, dimensions);
        
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}
//#endregion