// TODO: Spawn the controls programmatically rather than in the HTML
// Potentially decide on different layouts for different screen sizes

// TODO: Make the Controls draggable to anywhere on the page

// TODO: Add more custom context menu options to the controls
//  - Save Image as PNG
//  - Copy Image to Clipboard
//  - Copy Image to Base64

// Controls and UI management for image manipulation tools

/**
 * Sets up the custom context menu for the application
 * @deprecated Use the new context menu system in contextMenus.js instead
 */
function setupContextMenu() {
    // For backward compatibility, call the new context menu system
    if (typeof defineDefaultContextMenus === 'function') {
        defineDefaultContextMenus();
        return;
    }

    // Legacy context menu setup (kept for backward compatibility)
    const fileInputContainer = document.querySelector('.file-input-container');
    
    // Set up context menu
    if (fileInputContainer) {
        fileInputContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            const contextMenu = document.querySelector('.context-menu');
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
        });
    }
    
    // Hide context menu on click elsewhere
    document.addEventListener('click', (e) => {
        const contextMenu = document.querySelector('.context-menu');
        if (contextMenu && contextMenu.style.display === 'block') {
            contextMenu.style.display = 'none';
        }
    });
    
    // Assign paste action to context menu
    const pasteMenuItem = document.getElementById('pasteImage');
    if (pasteMenuItem) {
        pasteMenuItem.addEventListener('click', requestClipboardAccess);
    }
}

/**
 * Programmatically create and add the context menu to the DOM
 * This replaces the static HTML context menu elements in the HTML files
 */
function createContextMenuElement() {
    // Check if a context menu already exists
    let contextMenu = document.querySelector('.context-menu');
    
    // If it doesn't exist, create it
    if (!contextMenu) {
        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        document.body.appendChild(contextMenu);
    }
    
    return contextMenu;
}

/**
 * Add custom context menus for specific elements
 * @param {Object} options - Custom context menu options to add
 */
function addCustomContextMenu(options) {
    if (typeof registerContextMenu === 'function') {
        registerContextMenu(options.id, options);
        initContextMenus();
    } else {
        console.warn('Context menu system not loaded');
    }
}

/**
 * Get a specific context menu definition
 * @param {string} id - ID of the context menu to get
 * @returns {Object|null} - The context menu definition or null if not found
 */
function getContextMenu(id) {
    if (typeof contextMenus !== 'undefined' && contextMenus[id]) {
        return contextMenus[id];
    }
    return null;
}