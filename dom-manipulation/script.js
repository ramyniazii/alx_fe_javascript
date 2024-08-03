
// Initial quotes array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Inspiration" },
    { text: "The purpose of our lives is to be happy.", category: "Happiness" }
];

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        const serverQuotes = data.map(post => ({ text: post.title, category: 'Server' }));
        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
        const mergedQuotes = [...serverQuotes, ...localQuotes];
        localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
        quotes = mergedQuotes;
        populateCategories();
        filterQuotes();
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// Function to sync quotes with the server
async function syncQuotesWithServer() {
    const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
    try {
        for (const quote of localQuotes) {
            await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: quote.text,
                    body: quote.category
                })
            });
        }
        alert('Quotes synced with server!');
    } catch (error) {
        console.error('Error syncing quotes with server:', error);
    }
}

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = `<p>${randomQuote.text}</p><p><em>${randomQuote.category}</em></p>`;
    // Save last viewed quote to session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        localStorage.setItem('quotes', JSON.stringify(quotes)); // Save to local storage

        // Update the DOM with the new quote
        const quoteDisplay = document.getElementById('quoteDisplay');
        const newQuoteElement = document.createElement('p');
        newQuoteElement.innerHTML = `${newQuote.text} <em>(${newQuote.category})</em>`;
        quoteDisplay.appendChild(newQuoteElement);

        // Clear the input fields
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';

        // Update category filter dropdown
        populateCategories();

        // Sync new quote with the server
        syncQuotesWithServer();
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Function to export quotes to a JSON file
function exportQuotes() {
    const dataStr = JSON.stringify(quotes);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const exportFileDefaultName = 'quotes.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.textContent = 'Export Quotes';
    document.body.appendChild(linkElement);
    linkElement.click();

    // Clean up
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        localStorage.setItem('quotes', JSON.stringify(quotes)); // Save to local storage
        alert('Quotes imported successfully!');
        populateCategories();
    };
    fileReader.readAsText(event.target.files[0]);
}

// Function to create the add quote form
function createAddQuoteForm() {
    const formContainer = document.createElement('div');

    const quoteInput = document.createElement('input');
    quoteInput.id = 'newQuoteText';
    quoteInput.type = 'text';
    quoteInput.placeholder = 'Enter a new quote';

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote;

    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);

    document.body.appendChild(formContainer);
}

// Function to populate the category filter dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Populate with unique categories
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');

    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);

    quoteDisplay.innerHTML = '';
    filteredQuotes.forEach(quote => {
        const quoteElement = document.createElement('p');
        quoteElement.innerHTML = `${quote.text} <em>(${quote.category})</em>`;
        quoteDisplay.appendChild(quoteElement);
    });

    // Save selected category to local storage
    localStorage.setItem('selectedCategory', selectedCategory);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    document.getElementById('exportQuotesBtn').addEventListener('click', exportQuotes);
    createAddQuoteForm();
    populateCategories();

    // Fetch quotes from server
    fetchQuotesFromServer();

    // Periodically sync quotes with the server
    setInterval(syncQuotesWithServer, 60000); // Sync every 60 seconds

    // Display last viewed quote if exists in session storage
    const lastViewedQuote = JSON.parse(sessionStorage.getItem('lastViewedQuote'));
    if (lastViewedQuote) {
        const quoteDisplay = document.getElementById('quoteDisplay');
        quoteDisplay.innerHTML = `<p>${lastViewedQuote.text}</p><p><em>${lastViewedQuote.category}</em></p>`;
    }

    // Apply last selected category filter if exists in local storage
    const selectedCategory = localStorage.getItem('selectedCategory');
    if (selectedCategory) {
        document.getElementById('categoryFilter').value = selectedCategory;
        filterQuotes();
    }
});
