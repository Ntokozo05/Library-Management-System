// Sample book data - In a real application, this would come from a database
let booksData = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        category: "Fiction",
        year: 1925,
        status: "Available",
        description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
        pages: 180,
        publisher: "Scribner",
        location: "A-1-001"
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        category: "Fiction",
        year: 1960,
        status: "Borrowed",
        description: "A gripping tale of racial injustice and childhood innocence in the American South.",
        pages: 324,
        publisher: "J.B. Lippincott & Co.",
        location: "A-1-002",
        borrowedBy: "John Smith",
        dueDate: "2024-01-15"
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        category: "Fiction",
        year: 1949,
        status: "Available",
        description: "A dystopian social science fiction novel about totalitarian control and surveillance.",
        pages: 328,
        publisher: "Secker & Warburg",
        location: "A-1-003"
    },
    {
        id: 4,
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        isbn: "978-0-316-76948-0",
        category: "Fiction",
        year: 1951,
        status: "Reserved",
        description: "A controversial novel about teenage rebellion and alienation.",
        pages: 277,
        publisher: "Little, Brown and Company",
        location: "A-1-004",
        reservedBy: "Jane Doe"
    },
    {
        id: 5,
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        isbn: "978-0-553-38016-3",
        category: "Science",
        year: 1988,
        status: "Available",
        description: "A landmark volume in science writing that explores the nature of time and the universe.",
        pages: 256,
        publisher: "Bantam Books",
        location: "B-2-001"
    },
    {
        id: 6,
        title: "The Art of War",
        author: "Sun Tzu",
        isbn: "978-1-59030-963-7",
        category: "History",
        year: -500,
        status: "Available",
        description: "An ancient Chinese military treatise on strategy and tactics.",
        pages: 273,
        publisher: "Various",
        location: "C-3-001"
    },
    {
        id: 7,
        title: "Steve Jobs",
        author: "Walter Isaacson",
        isbn: "978-1-4516-4853-9",
        category: "Biography",
        year: 2011,
        status: "Borrowed",
        description: "The exclusive biography of Apple's co-founder based on extensive interviews.",
        pages: 656,
        publisher: "Simon & Schuster",
        location: "D-4-001",
        borrowedBy: "Mike Johnson",
        dueDate: "2024-01-20"
    },
    {
        id: 8,
        title: "Clean Code",
        author: "Robert C. Martin",
        isbn: "978-0-13-235088-4",
        category: "Technology",
        year: 2008,
        status: "Available",
        description: "A handbook of agile software craftsmanship for writing clean, maintainable code.",
        pages: 464,
        publisher: "Prentice Hall",
        location: "E-5-001"
    }
];

// Global variables
let filteredBooks = [...booksData];
let currentPage = 1;
let booksPerPage = 6;
let currentView = 'grid';
let selectedBooks = new Set();

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    displayBooks();
    updateStatistics();
});

function initializePage() {
    // Show loading spinner initially
    document.getElementById('loadingSpinner').style.display = 'flex';
    
    // Simulate loading delay
    setTimeout(() => {
        document.getElementById('loadingSpinner').style.display = 'none';
        displayBooks();
    }, 1000);
}

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    
    // Filter selects
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);
    
    // Modal close on outside click
    document.getElementById('bookModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm === '') {
        document.getElementById('clearSearch').style.display = 'none';
    } else {
        document.getElementById('clearSearch').style.display = 'block';
    }
    
    applyFilters();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearSearch').style.display = 'none';
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Filter books
    filteredBooks = booksData.filter(book => {
        const matchesSearch = searchTerm === '' || 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.isbn.includes(searchTerm);
        
        const matchesCategory = categoryFilter === '' || book.category === categoryFilter;
        const matchesStatus = statusFilter === '' || book.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Sort books
    filteredBooks.sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            case 'author':
                return a.author.localeCompare(b.author);
            case 'author-desc':
                return b.author.localeCompare(a.author);
            case 'year':
                return b.year - a.year;
            case 'year-desc':
                return a.year - b.year;
            default:
                return 0;
        }
    });
    
    currentPage = 1;
    displayBooks();
    updateStatistics();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('sortBy').value = 'title';
    document.getElementById('clearSearch').style.display = 'none';
    
    filteredBooks = [...booksData];
    currentPage = 1;
    displayBooks();
    updateStatistics();
}

function displayBooks() {
    const container = document.getElementById('booksContainer');
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);
    
    if (booksToShow.length === 0) {
        container.innerHTML = '';
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('paginationContainer').innerHTML = '';
        return;
    }
    
    document.getElementById('noResults').style.display = 'none';
    
    container.innerHTML = booksToShow.map(book => createBookCard(book)).join('');
    generatePagination();
    updateStatistics();
}

function createBookCard(book) {
    const isSelected = selectedBooks.has(book.id);
    const statusClass = `status-${book.status.toLowerCase()}`;
    
    return `
        <div class="book-card ${currentView === 'list' ? 'list-view' : ''}" onclick="openBookModal(${book.id})">
            <input type="checkbox" class="book-checkbox" ${isSelected ? 'checked' : ''} 
                   onclick="event.stopPropagation(); toggleBookSelection(${book.id})" />
            
            <div class="book-cover">
                📖
            </div>
            
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                
                <div class="book-details">
                    <span>📅 ${book.year}</span>
                    <span>📚 ${book.category}</span>
                    <span>📍 ${book.location}</span>
                    ${book.isbn ? `<span>🔢 ${book.isbn}</span>` : ''}
                </div>
                
                <span class="book-status ${statusClass}">${book.status}</span>
                
                <div class="book-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); viewBook(${book.id})">
                        👁️ View
                    </button>
                    <button class="action-btn edit" onclick="event.stopPropagation(); editBook(${book.id})">
                        ✏️ Edit
                    </button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); deleteBook(${book.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

function toggleView(view) {
    currentView = view;
    
    // Update button states
    document.getElementById('gridView').classList.toggle('active', view === 'grid');
    document.getElementById('listView').classList.toggle('active', view === 'list');
    
    // Update container class
    const container = document.getElementById('booksContainer');
    container.classList.toggle('list-view', view === 'list');
    
    displayBooks();
}

function generatePagination() {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const container = document.getElementById('paginationContainer');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            ← Previous
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            Next →
        </button>
    `;
    
    container.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    displayBooks();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStatistics() {
    const totalBooks = booksData.length;
    const availableBooks = booksData.filter(book => book.status === 'Available').length;
    const borrowedBooks = booksData.filter(book => book.status === 'Borrowed').length;
    const filteredCount = filteredBooks.length;
    
    document.getElementById('totalBooksCount').textContent = totalBooks;
    document.getElementById('availableBooksCount').textContent = availableBooks;
    document.getElementById('borrowedBooksCount').textContent = borrowedBooks;
    document.getElementById('filteredBooksCount').textContent = filteredCount;
}

function toggleBookSelection(bookId) {
    if (selectedBooks.has(bookId)) {
        selectedBooks.delete(bookId);
    } else {
        selectedBooks.add(bookId);
    }
}

function selectAll() {
    const visibleBooks = filteredBooks.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);
    visibleBooks.forEach(book => selectedBooks.add(book.id));
    displayBooks();
}

function deselectAll() {
    selectedBooks.clear();
    displayBooks();
}

function deleteSelected() {
    if (selectedBooks.size === 0) {
        alert('Please select books to delete.');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedBooks.size} selected book(s)?`)) {
        booksData = booksData.filter(book => !selectedBooks.has(book.id));
        selectedBooks.clear();
        applyFilters();
        alert('Selected books have been deleted.');
    }
}

function openBookModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    const modal = document.getElementById('bookModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 15px; align-items: start;">
            <div class="book-cover" style="width: 120px; height: 180px; margin: 0;">📖</div>
            <div>
                <h3 style="margin-bottom: 10px; color: #2c3e50;">${book.title}</h3>
                <p style="margin-bottom: 15px; color: #7f8c8d; font-size: 1.1rem;">by ${book.author}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div><strong>ISBN:</strong> ${book.isbn}</div>
                    <div><strong>Category:</strong> ${book.category}</div>
                    <div><strong>Year:</strong> ${book.year}</div>
                    <div><strong>Pages:</strong> ${book.pages}</div>
                    <div><strong>Publisher:</strong> ${book.publisher}</div>
                    <div><strong>Location:</strong> ${book.location}</div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <span class="book-status status-${book.status.toLowerCase()}">${book.status}</span>
                    ${book.status === 'Borrowed' ? `<span style="margin-left: 10px; color: #e74c3c;">Due: ${book.dueDate}</span>` : ''}
                    ${book.status === 'Reserved' ? `<span style="margin-left: 10px; color: #f39c12;">Reserved by: ${book.reservedBy}</span>` : ''}
                </div>
                
                <p style="line-height: 1.6; color: #2c3e50;">${book.description}</p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('bookModal').classList.remove('active');
}

function viewBook(bookId) {
    openBookModal(bookId);
}

function editBook(bookId) {
    alert(`Edit functionality for book ID ${bookId} would be implemented here.`);
    // In a real application, this would open an edit form
}

function deleteBook(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
        booksData = booksData.filter(b => b.id !== bookId);
        applyFilters();
        alert('Book has been deleted successfully.');
    }
}

function goBack() {
    window.location.href = 'hlengiwe_library.html';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    } else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
});