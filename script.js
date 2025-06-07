// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('datetime').textContent = now.toLocaleDateString('en-US', options);
}

// Rotating quotes
const quotes = [
    "Today a reader, tomorrow a leader.",
    "A room without books is like a body without a soul.",
    "The more that you read, the more things you will know.",
    "Books are a uniquely portable magic.",
    "Reading is to the mind what exercise is to the body.",
    "A book is a dream that you hold in your hand.",
    "Libraries: The medicine chest of the soul."
];

let currentQuoteIndex = 0;

function rotateQuote() {
    const quoteBanner = document.getElementById('quoteBanner');
    quoteBanner.style.opacity = '0';
    
    setTimeout(() => {
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        quoteBanner.textContent = quotes[currentQuoteIndex];
        quoteBanner.style.opacity = '1';
    }, 250);
}

// Navigation function
function navigateTo(section) {
    // Add a subtle animation effect
    event.target.style.transform = "scale(0.95)"
    setTimeout(() => {
      event.target.style.transform = "scale(1)"
    }, 150)
  
    // Navigate to different pages based on section
    switch (section) {
      case "view-books":
        window.location.href = "view-books.html"
        break
      case "add-book":
        // window.location.href = 'add-book.html';
        alert("Add Book page - Coming Soon!")
        break
      case "search-books":
        // window.location.href = 'search-books.html';
        alert("Search Books page - Coming Soon!")
        break
      case "register-user":
        // window.location.href = 'register-user.html';
        alert("Register User page - Coming Soon!")
        break
      case "view-users":
        // window.location.href = 'view-users.html';
        alert("View Users page - Coming Soon!")
        break
      case "borrow-return":
        // window.location.href = 'borrow-return.html';
        alert("Borrow/Return page - Coming Soon!")
        break
      case "transaction-history":
        // window.location.href = 'transaction-history.html';
        alert("Transaction History page - Coming Soon!")
        break
      case "reports":
        // window.location.href = 'reports.html';
        alert("Reports page - Coming Soon!")
        break
      case "statistics":
        // window.location.href = 'statistics.html';
        alert("Statistics page - Coming Soon!")
        break
      default:
        console.log(`Navigation to ${section} not implemented yet`)
        alert(`${section.replace("-", " ").toUpperCase()} - Coming Soon!`)
    }
  }
  

// Exit application function
function exitApplication() {
    if (confirm('Are you sure you want to exit the Library Management System?')) {
        alert('Thank you for using the Library Management System!');
        // In a real application, you might close the window or redirect
        // window.close();
    }
}

// Simulate dynamic statistics updates
function updateStatistics() {
    const totalBooks = Math.floor(Math.random() * 50) + 100;
    const borrowedBooks = Math.floor(Math.random() * 30) + 20;
    const availableBooks = totalBooks - borrowedBooks;
    const totalUsers = Math.floor(Math.random() * 20) + 35;

    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('availableBooks').textContent = availableBooks;
    document.getElementById('borrowedBooks').textContent = borrowedBooks;
    document.getElementById('totalUsers').textContent = totalUsers;
}

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        exitApplication();
    }
});

// Initialize the application
function initializeApp() {
    updateDateTime();
    setInterval(updateDateTime, 1000); // Update every second
    setInterval(rotateQuote, 5000); // Rotate quote every 5 seconds
    setInterval(updateStatistics, 30000); // Update stats every 30 seconds
    
    // Add fade-in animation to elements
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });
}

// Start the application when the page loads
window.addEventListener('load', initializeApp);

// Add some interactivity to stat cards
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.transform = 'scale(1.05)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
    });
});