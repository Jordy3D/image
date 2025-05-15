/**
 * Context Menu System
 * Provides a flexible system for creating and managing custom context menus
 * for different elements in the application.
 */

// Store registered context menus
const contextMenus = {};

/**
 * Register a context menu for a specific element or element type
 * @param {string} id - Unique identifier for this context menu
 * @param {Object} options - Configuration for the context menu
 * @param {string|function} options.selector - CSS selector or function returning element(s) to attach menu to
 * @param {Array} options.items - Array of menu items to display
 * @param {boolean} [options.preventDefault=true] - Whether to prevent the default context menu
 */
function registerContextMenu(id, options) {
    contextMenus[id] = {
        selector: options.selector,
        items: options.items,
        preventDefault: options.preventDefault !== false,
        elements: [] // Will store references to elements with this menu
    };
}

/**
 * Initialize all registered context menus
 */
function initContextMenus() {
    // First remove existing context menu element if it exists
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create the context menu container
    const menuContainer = document.createElement('div');
    menuContainer.className = 'context-menu';
    menuContainer.style.display = 'none';
    document.body.appendChild(menuContainer);
    
    // For each registered menu, set up the event handlers
    Object.keys(contextMenus).forEach(id => {
        const menu = contextMenus[id];
        
        // Get elements matching the selector
        let elements;
        if (typeof menu.selector === 'function') {
            elements = menu.selector();
        } else {
            elements = document.querySelectorAll(menu.selector);
        }
        
        // Store references to elements
        menu.elements = Array.from(elements);
        
        // Add context menu event listeners to each element
        menu.elements.forEach(element => {
            element.addEventListener('contextmenu', (e) => {
                if (menu.preventDefault) {
                    e.preventDefault();
                }
                
                // Clear existing menu items
                menuContainer.innerHTML = '';
                
                // Add menu items for this context menu
                menu.items.forEach(item => {
                    if (item.isSeparator || item.label === '---') {
                        // Create a separator instead of a regular menu item
                        const separator = document.createElement('div');
                        separator.className = 'menu-separator';
                        menuContainer.appendChild(separator);
                        return;
                    }
                    
                    const menuItem = document.createElement('div');
                    menuItem.className = 'menu-item';
                    if (item.id) menuItem.id = item.id;
                    menuItem.textContent = item.label;
                    
                    // Add classes
                    if (item.className) {
                        const classes = item.className.split(' ');
                        classes.forEach(cls => menuItem.classList.add(cls));
                    }
                    
                    // Handle disabled state
                    if (item.disabled) {
                        menuItem.classList.add('disabled');
                    } else if (typeof item.disabled === 'function' && item.disabled(e, element)) {
                        menuItem.classList.add('disabled');
                    }
                    
                    // Add click handler
                    if (item.action && !menuItem.classList.contains('disabled')) {
                        menuItem.addEventListener('click', () => {
                            item.action(e, element);
                            menuContainer.style.display = 'none';
                        });
                    }
                    
                    menuContainer.appendChild(menuItem);
                });
                
                // Position and show the menu
                menuContainer.style.display = 'block';
                
                // Ensure menu doesn't go off screen
                const rect = menuContainer.getBoundingClientRect();
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                let menuX = e.clientX;
                let menuY = e.clientY;
                
                if (menuX + rect.width > windowWidth) {
                    menuX = windowWidth - rect.width;
                }
                
                if (menuY + rect.height > windowHeight) {
                    menuY = windowHeight - rect.height;
                }
                
                menuContainer.style.left = `${menuX}px`;
                menuContainer.style.top = `${menuY}px`;
            });
        });
    });
    
    // Hide the menu when clicking outside
    document.addEventListener('click', () => {
        menuContainer.style.display = 'none';
    });
    
    // Also hide when window is resized or scrolled
    window.addEventListener('resize', () => {
        menuContainer.style.display = 'none';
    });
    
    window.addEventListener('scroll', () => {
        menuContainer.style.display = 'none';
    });
}

/**
 * Reattach context menus to new dynamic elements
 * Call this when new elements are added to the DOM that should have context menus
 */
function reattachContextMenus() {
    Object.keys(contextMenus).forEach(id => {
        const menu = contextMenus[id];
        
        // Get elements matching the selector
        let elements;
        if (typeof menu.selector === 'function') {
            elements = menu.selector();
        } else {
            elements = document.querySelectorAll(menu.selector);
        }
        
        // Find new elements that don't have event listeners yet
        Array.from(elements).forEach(element => {
            if (!menu.elements.includes(element)) {
                // Add this element to the tracked elements
                menu.elements.push(element);
                
                // Attach the context menu event listener
                element.addEventListener('contextmenu', (e) => {
                    if (menu.preventDefault) {
                        e.preventDefault();
                    }
                    
                    const menuContainer = document.querySelector('.context-menu');
                    if (!menuContainer) return;
                    
                    // Clear existing menu items
                    menuContainer.innerHTML = '';
                    
                    // Add menu items for this context menu
                    menu.items.forEach(item => {
                        if (item.isSeparator || item.label === '---') {
                            // Create a separator
                            const separator = document.createElement('div');
                            separator.className = 'menu-separator';
                            menuContainer.appendChild(separator);
                            return;
                        }
                        
                        const menuItem = document.createElement('div');
                        menuItem.className = 'menu-item';
                        if (item.id) menuItem.id = item.id;
                        menuItem.textContent = item.label;
                        
                        // Add classes
                        if (item.className) {
                            const classes = item.className.split(' ');
                            classes.forEach(cls => menuItem.classList.add(cls));
                        }
                        
                        // Handle disabled state
                        if (item.disabled) {
                            menuItem.classList.add('disabled');
                        } else if (typeof item.disabled === 'function' && item.disabled(e, element)) {
                            menuItem.classList.add('disabled');
                        }
                        
                        // Add click handler
                        if (item.action && !menuItem.classList.contains('disabled')) {
                            menuItem.addEventListener('click', () => {
                                item.action(e, element);
                                menuContainer.style.display = 'none';
                            });
                        }
                        
                        menuContainer.appendChild(menuItem);
                    });
                    
                    // Position and show the menu
                    menuContainer.style.display = 'block';
                    
                    // Ensure menu doesn't go off screen
                    const rect = menuContainer.getBoundingClientRect();
                    const windowWidth = window.innerWidth;
                    const windowHeight = window.innerHeight;
                    
                    let menuX = e.clientX;
                    let menuY = e.clientY;
                    
                    if (menuX + rect.width > windowWidth) {
                        menuX = windowWidth - rect.width;
                    }
                    
                    if (menuY + rect.height > windowHeight) {
                        menuY = windowHeight - rect.height;
                    }
                    
                    menuContainer.style.left = `${menuX}px`;
                    menuContainer.style.top = `${menuY}px`;
                });
            }
        });
    });
}

/**
 * Special case function to reattach context menus after images are loaded
 * This will specifically look for newly added image elements and their wrappers
 */
function reattachImageContextMenus() {
    // Get image wrappers first
    const wrappers = getOrCreateImageWrappers();
    if (wrappers) {
        // Reattach to both source and output wrappers
        reattachContextMenus();
        
        // Also reattach to any images inside the wrappers
        const images = document.querySelectorAll('.image-wrapper img, canvas');
        if (images.length > 0) {
            // Delay slightly to ensure DOM is fully updated
            setTimeout(reattachContextMenus, 50);
        }
    }
}

/**
 * Predefined menu items that can be reused across different context menus
 */
const commonMenuItems = {
    pasteImage: {
        id: 'pasteImage',
        label: 'Paste Image',
        action: () => requestClipboardAccess()
    },
    copyToClipboard: {
        label: 'Copy Image Data',
        action: (e, element) => {
            // Implementation depends on the element type
            if (element.tagName === 'IMG') {
                // For regular images
                const canvas = document.createElement('canvas');
                canvas.width = element.naturalWidth;
                canvas.height = element.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(element, 0, 0);
                
                canvas.toBlob(blob => {
                    const clipboardItem = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([clipboardItem])
                        .then(() => console.log('Image copied to clipboard'))
                        .catch(err => {
                            console.error('Failed to copy to clipboard: ', err);
                            alert('Failed to copy image to clipboard');
                        });
                });
            } 
            else if (element.tagName === 'CANVAS') {
                // For canvas elements
                element.toBlob(blob => {
                    const clipboardItem = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([clipboardItem])
                        .then(() => console.log('Canvas copied to clipboard'))
                        .catch(err => {
                            console.error('Failed to copy to clipboard: ', err);
                            alert('Failed to copy canvas to clipboard');
                        });
                });
            }
            else if (element.querySelector('canvas')) {
                // For containers with a canvas inside (like preview container)
                const canvas = element.querySelector('canvas');
                canvas.toBlob(blob => {
                    const clipboardItem = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([clipboardItem])
                        .then(() => console.log('Canvas copied to clipboard'))
                        .catch(err => {
                            console.error('Failed to copy to clipboard: ', err);
                            alert('Failed to copy canvas to clipboard');
                        });
                });
            }
            else if (element.querySelector('img')) {
                // For containers with an image inside
                const img = element.querySelector('img');
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                canvas.toBlob(blob => {
                    const clipboardItem = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([clipboardItem])
                        .then(() => console.log('Image copied to clipboard'))
                        .catch(err => {
                            console.error('Failed to copy to clipboard: ', err);
                            alert('Failed to copy image to clipboard');
                        });
                });
            }
            else {
                console.error('Element type not supported for copy to clipboard', element);
                alert('Cannot copy. Please ensure an image is loaded');
            }
        }
    },
    copyToBase64: {
        label: 'Copy Base64 Data',
        action: (e, element) => {
            let base64Data = '';
            
            if (element.tagName === 'IMG') {
                // For regular images
                const canvas = document.createElement('canvas');
                canvas.width = element.naturalWidth;
                canvas.height = element.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(element, 0, 0);
                base64Data = canvas.toDataURL('image/png').split(',')[1];
            } 
            else if (element.tagName === 'CANVAS') {
                // For canvas elements
                base64Data = element.toDataURL('image/png').split(',')[1];
            }
            else if (element.querySelector('canvas')) {
                // For containers with a canvas inside
                const canvas = element.querySelector('canvas');
                base64Data = canvas.toDataURL('image/png').split(',')[1];
            }
            else if (element.querySelector('img')) {
                // For containers with an image inside
                const img = element.querySelector('img');
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                base64Data = canvas.toDataURL('image/png').split(',')[1];
            }
            
            if (base64Data) {
                navigator.clipboard.writeText(base64Data)
                    .then(() => {
                        console.log('Base64 data copied to clipboard');
                        // Show a quick toast notification
                        const toast = document.createElement('div');
                        toast.className = 'toast-notification';
                        toast.textContent = 'Base64 data copied to clipboard';
                        document.body.appendChild(toast);
                        
                        // Remove toast after animation
                        setTimeout(() => {
                            toast.classList.add('fade-out');
                            setTimeout(() => toast.remove(), 500);
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy Base64 to clipboard: ', err);
                        alert('Failed to copy Base64 data to clipboard');
                    });
            } else {
                console.error('Element type not supported for Base64 copy', element);
                alert('Cannot copy. Please ensure an image is loaded');
            }
        }
    },
    downloadImage: {
        label: 'Download Image',
        action: (e, element) => {
            // Create link for download
            const link = document.createElement('a');
            const filename = 'image.png';
            
            if (element.tagName === 'CANVAS') {
                // For canvas elements
                link.href = element.toDataURL('image/png');
                link.download = filename;
                link.click();
            }
            else if (element.tagName === 'IMG') {
                // For regular images
                const canvas = document.createElement('canvas');
                canvas.width = element.naturalWidth;
                canvas.height = element.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(element, 0, 0);
                link.href = canvas.toDataURL('image/png');
                link.download = filename;
                link.click();
            }
            else if (element.querySelector('canvas')) {
                // For containers with a canvas inside
                const canvas = element.querySelector('canvas');
                link.href = canvas.toDataURL('image/png');
                link.download = filename;
                link.click();
            }
            else if (element.querySelector('img')) {
                // For containers with an image inside
                const img = element.querySelector('img');
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                link.href = canvas.toDataURL('image/png');
                link.download = filename;
                link.click();
            }
            else {
                console.error('Element type not supported for download', element);
                alert('Cannot download. Please ensure an image is loaded');
            }
        }
    },
    separator: {
        isSeparator: true, // Flag to identify separators
        label: '---',     // Keep this for backward compatibility
        className: 'separator'
    },
    resetSlider: {
        label: 'Reset to Default',
        action: (e, element) => {
            // Find the closest slider
            let slider;
            if (element.tagName === 'INPUT' && element.type === 'range') {
                slider = element;
            } else {
                slider = element.querySelector('input[type="range"]');
            }
            
            if (slider) {
                // Reset to default value
                slider.value = slider.defaultValue;
                
                // Trigger events to update UI
                slider.dispatchEvent(new Event('input', { bubbles: true }));
                slider.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Update tooltip if available
                const container = slider.parentElement;
                if (container && container.dataset.baseTooltip) {
                    updateSliderTooltip(slider, container.dataset.baseTooltip);
                }
            }
        }
    }
};

/**
 * Define default context menus for the application
 */
function defineDefaultContextMenus() {
    // For the file input container
    registerContextMenu('fileInput', {
        selector: '.file-input-container',
        items: [
            commonMenuItems.pasteImage
        ]
    });
    
    
    // For source image wrapper (input image)
    registerContextMenu('sourceImageWrapper', {
        selector: '.source-image-wrapper',
        items: [
            commonMenuItems.pasteImage,
            commonMenuItems.separator,
            commonMenuItems.copyToClipboard,
            commonMenuItems.copyToBase64,
            commonMenuItems.downloadImage
        ]
    });
    
    // For output image wrapper (processed image)
    registerContextMenu('outputImageWrapper', {
        selector: '.output-image-wrapper',
        items: [
            commonMenuItems.copyToClipboard,
            commonMenuItems.copyToBase64,
            commonMenuItems.downloadImage
        ]
    });
        
    // For canvas elements
    registerContextMenu('canvas', {
        selector: 'canvas',
        items: [
            commonMenuItems.copyToClipboard,
            commonMenuItems.copyToBase64,
            commonMenuItems.downloadImage
        ]
    });
    
    // For individual images
    registerContextMenu('images', {
        selector: 'img:not(.controls img, .tool-icon img)',
        items: [
            commonMenuItems.copyToClipboard,
            commonMenuItems.copyToBase64,
            commonMenuItems.downloadImage
        ]
    });
    
    // For slider containers
    registerContextMenu('sliders', {
        selector: '.slider-container',
        items: [
            commonMenuItems.resetSlider
        ]
    });
    
    // Initialize all context menus
    initContextMenus();
}

/**
 * Create a helper function to get or create image wrappers with proper classes
 * @returns {Object} Object containing references to source and output image wrappers
 */
function getOrCreateImageWrappers() {
    const previewContainer = document.getElementById('previewContainer');
    if (!previewContainer) return null;
    
    let sourceWrapper = previewContainer.querySelector('.source-image-wrapper');
    let outputWrapper = previewContainer.querySelector('.output-image-wrapper');
    
    // Create source wrapper if it doesn't exist
    if (!sourceWrapper) {
        sourceWrapper = document.createElement('div');
        sourceWrapper.className = 'source-image-wrapper';
        
        // If there's already a first child that's not classed properly
        const firstChild = previewContainer.firstElementChild;
        if (firstChild && !firstChild.classList.contains('output-image-wrapper')) {
            // Replace it with our properly classed wrapper
            sourceWrapper.appendChild(...firstChild.childNodes);
            previewContainer.replaceChild(sourceWrapper, firstChild);
        } else {
            previewContainer.prepend(sourceWrapper);
        }
    }
    
    // Create output wrapper if it doesn't exist
    if (!outputWrapper) {
        outputWrapper = document.createElement('div');
        outputWrapper.className = 'output-image-wrapper';
        
        // Find any element that might be an output element but not properly classed
        const potentialOutput = Array.from(previewContainer.children).find(
            child => child !== sourceWrapper && !child.classList.contains('source-image-wrapper')
        );
        
        if (potentialOutput) {
            // Replace it with our properly classed wrapper
            outputWrapper.appendChild(...potentialOutput.childNodes);
            previewContainer.replaceChild(outputWrapper, potentialOutput);
        } else {
            previewContainer.appendChild(outputWrapper);
        }
    }
    
    // Reattach context menus after creating/updating wrappers
    setTimeout(() => reattachContextMenus(), 0);
    
    return { sourceWrapper, outputWrapper };
}

// Export the helper function for use in other files
window.getOrCreateImageWrappers = getOrCreateImageWrappers;
window.reattachContextMenus = reattachContextMenus;
window.reattachImageContextMenus = reattachImageContextMenus;