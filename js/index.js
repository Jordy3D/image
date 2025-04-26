document.addEventListener('DOMContentLoaded', () => {
    // Load tool data and create cards
    loadTools();
    
    const darkModeToggle = document.getElementById('darkMode');
    
    // Load saved dark mode preference
    darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    updateTheme();

    // Set up dark mode toggle
    darkModeToggle.addEventListener('change', () => {
        localStorage.setItem('darkMode', darkModeToggle.checked);
        updateTheme();
    });
});

// Load tools from JSON file and create cards
async function loadTools() {
    try {
        const response = await fetch('tools.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const tools = await response.json();
        const toolsContainer = document.getElementById('tools-container');
        
        // Create tool cards
        tools.forEach(tool => {
            const toolCard = createToolCard(tool);
            toolsContainer.appendChild(toolCard);
        });
    } catch (error) {
        console.error('Error loading tools:', error);
        document.getElementById('tools-container').innerHTML = `
            <div class="error-message">
                <p>Failed to load tools. Please try refreshing the page.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

// Create a tool card element from tool data
function createToolCard(tool) {
    // Create the card element
    const card = document.createElement('a');
    card.href = tool.url;
    card.className = 'tool-card';
    card.dataset.tool = tool.id;
    
    // Create the icon container
    const iconDiv = document.createElement('div');
    iconDiv.className = 'tool-icon';
    
    const iconImg = document.createElement('img');
    iconImg.src = tool.icon;
    iconImg.alt = `${tool.name} Tool`;
    iconDiv.appendChild(iconImg);
    
    // Create the info container
    const infoDiv = document.createElement('div');
    infoDiv.className = 'tool-info';
    
    const title = document.createElement('h2');
    title.textContent = tool.name;
    
    const description = document.createElement('p');
    description.textContent = tool.description;
    
    infoDiv.appendChild(title);
    infoDiv.appendChild(description);
    
    // Assemble the card
    card.appendChild(iconDiv);
    card.appendChild(infoDiv);
    
    return card;
}