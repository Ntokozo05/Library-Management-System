// Borrow/Return Page JavaScript

let currentTab = "borrow"
const selectedBooks = new Set()
const selectedUser = null
let searchTimeout = null

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  initializePage()
  setupEventListeners()
  updateStats()
  loadRecentTransactions()
})

function initializePage() {
  // Set default due date (2 weeks from today)
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 14)
  document.getElementById("dueDate").value = defaultDueDate.toISOString().split("T")[0]

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("dueDate").min = today
  document.getElementById("newDueDate").min = today

  // Set default renewal date (2 weeks from today)
  document.getElementById("newDueDate").value = defaultDueDate.toISOString().split("T")[0]
}

function setupEventListeners() {
  // Search inputs
  setupSearchInput("borrowUserSearch", "borrowUserResults", searchUsers, selectBorrowUser)
  setupSearchInput("borrowBookSearch", "borrowBookResults", searchBooks, selectBorrowBook)
  setupSearchInput("returnUserSearch", "returnUserResults", searchUsers, selectReturnUser)
  setupSearchInput("renewUserSearch", "renewUserResults", searchUsers, selectRenewUser)

  // Form submissions
  document.getElementById("borrowForm").addEventListener("submit", handleBorrowSubmit)
  document.getElementById("returnForm").addEventListener("submit", handleReturnSubmit)
  document.getElementById("renewForm").addEventListener("submit", handleRenewSubmit)

  // Modal close on outside click
  document.getElementById("successModal").addEventListener("click", function (e) {
    if (e.target === this) {
      closeSuccessModal()
    }
  })
}

function setupSearchInput(inputId, resultsId, searchFunction, selectFunction) {
  const input = document.getElementById(inputId)
  const results = document.getElementById(resultsId)

  input.addEventListener("input", function () {
    clearTimeout(searchTimeout)
    const query = this.value.trim()

    if (query.length >= 2) {
      searchTimeout = setTimeout(() => {
        const items = searchFunction(query)
        displaySearchResults(results, items, selectFunction)
      }, 300)
    } else {
      results.classList.remove("show")
    }
  })

  input.addEventListener("blur", () => {
    setTimeout(() => {
      results.classList.remove("show")
    }, 200)
  })

  input.addEventListener("focus", function () {
    if (this.value.trim().length >= 2) {
      const items = searchFunction(this.value.trim())
      displaySearchResults(results, items, selectFunction)
    }
  })
}

function searchUsers(query) {
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  return users
    .filter(
      (user) =>
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.membershipNumber.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 5)
}

function searchBooks(query) {
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")
  return books
    .filter(
      (book) =>
        book.status === "Available" &&
        (book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase()) ||
          (book.isbn && book.isbn.toLowerCase().includes(query.toLowerCase()))),
    )
    .slice(0, 5)
}

function displaySearchResults(container, items, selectFunction) {
  if (items.length === 0) {
    container.innerHTML = '<div class="search-result-item">No results found</div>'
  } else {
    container.innerHTML = items
      .map((item) => {
        if (item.firstName) {
          // User item
          return `
                    <div class="search-result-item" onclick="selectFunction(${item.id})">
                        <div class="result-title">${item.firstName} ${item.lastName}</div>
                        <div class="result-subtitle">${item.email} • ${item.membershipNumber}</div>
                    </div>
                `
        } else {
          // Book item
          return `
                    <div class="search-result-item" onclick="selectFunction(${item.id})">
                        <div class="result-title">${item.title}</div>
                        <div class="result-subtitle">by ${item.author} • ${item.isbn || "No ISBN"}</div>
                    </div>
                `
        }
      })
      .join("")
  }
  container.classList.add("show")
}

function selectBorrowUser(userId) {
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const user = users.find((u) => u.id === userId)
  if (user) {
    document.getElementById("borrowUserSearch").value = `${user.firstName} ${user.lastName}`
    document.getElementById("borrowUserId").value = userId
    document.getElementById("borrowUserResults").classList.remove("show")
    updateBorrowPreview()
  }
}

function selectBorrowBook(bookId) {
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")
  const book = books.find((b) => b.id === bookId)
  if (book) {
    document.getElementById("borrowBookSearch").value = `${book.title} by ${book.author}`
    document.getElementById("borrowBookId").value = bookId
    document.getElementById("borrowBookResults").classList.remove("show")
    updateBorrowPreview()
  }
}

function selectReturnUser(userId) {
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const user = users.find((u) => u.id === userId)
  if (user) {
    document.getElementById("returnUserSearch").value = `${user.firstName} ${user.lastName}`
    document.getElementById("returnUserId").value = userId
    document.getElementById("returnUserResults").classList.remove("show")
    loadBorrowedBooks(userId)
  }
}

function selectRenewUser(userId) {
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const user = users.find((u) => u.id === userId)
  if (user) {
    document.getElementById("renewUserSearch").value = `${user.firstName} ${user.lastName}`
    document.getElementById("renewUserId").value = userId
    document.getElementById("renewUserResults").classList.remove("show")
    loadRenewableBooks(userId)
  }
}

function updateBorrowPreview() {
  const userId = document.getElementById("borrowUserId").value
  const bookId = document.getElementById("borrowBookId").value
  const dueDate = document.getElementById("dueDate").value

  if (userId && bookId && dueDate) {
    const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
    const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")
    const user = users.find((u) => u.id == userId)
    const book = books.find((b) => b.id == bookId)

    if (user && book) {
      const previewContent = `
                <div class="preview-item">
                    <h4>👤 User</h4>
                    <div class="preview-details">
                        <div><strong>Name:</strong> ${user.firstName} ${user.lastName}</div>
                        <div><strong>Email:</strong> ${user.email}</div>
                        <div><strong>Member ID:</strong> ${user.membershipNumber}</div>
                        <div><strong>Type:</strong> ${user.membershipType}</div>
                    </div>
                </div>
                <div class="preview-item">
                    <h4>📖 Book</h4>
                    <div class="preview-details">
                        <div><strong>Title:</strong> ${book.title}</div>
                        <div><strong>Author:</strong> ${book.author}</div>
                        <div><strong>ISBN:</strong> ${book.isbn || "N/A"}</div>
                        <div><strong>Location:</strong> ${book.location}</div>
                    </div>
                </div>
                <div class="preview-item">
                    <h4>📅 Borrowing Details</h4>
                    <div class="preview-details">
                        <div><strong>Borrow Date:</strong> ${new Date().toLocaleDateString()}</div>
                        <div><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</div>
                        <div><strong>Loan Period:</strong> ${calculateDaysDifference(new Date(), new Date(dueDate))} days</div>
                    </div>
                </div>
            `

      document.getElementById("borrowPreviewContent").innerHTML = previewContent
      document.getElementById("borrowPreview").style.display = "block"
    }
  } else {
    document.getElementById("borrowPreview").style.display = "none"
  }
}

function loadBorrowedBooks(userId) {
  const transactions = JSON.parse(localStorage.getItem("libraryTransactions") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")

  // Find borrowed books for this user
  const borrowedTransactions = transactions.filter(
    (t) => t.userId == userId && t.type === "borrow" && t.status === "active",
  )

  const container = document.getElementById("borrowedBooksList")

  if (borrowedTransactions.length === 0) {
    container.innerHTML = '<p class="no-books">This user has no borrowed books</p>'
    document.getElementById("returnSubmitBtn").disabled = true
    return
  }

  const borrowedBooksHTML = borrowedTransactions
    .map((transaction) => {
      const book = books.find((b) => b.id == transaction.bookId)
      if (!book) return ""

      const dueDate = new Date(transaction.dueDate)
      const today = new Date()
      const isOverdue = dueDate < today
      const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

      let statusClass = ""
      let statusText = ""

      if (isOverdue) {
        statusClass = "status-overdue"
        statusText = `Overdue by ${Math.abs(daysDiff)} days`
      } else if (daysDiff <= 3) {
        statusClass = "status-due-soon"
        statusText = `Due in ${daysDiff} days`
      } else {
        statusClass = "status-renewable"
        statusText = `Due in ${daysDiff} days`
      }

      return `
            <div class="book-item ${isOverdue ? "overdue" : ""}" onclick="selectBookForReturn(${transaction.id})">
                <div class="book-header">
                    <div>
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">by ${book.author}</div>
                    </div>
                    <span class="book-status ${statusClass}">${statusText}</span>
                </div>
                <div class="book-details">
                    <div><strong>Borrowed:</strong> ${new Date(transaction.borrowDate).toLocaleDateString()}</div>
                    <div><strong>Due:</strong> ${dueDate.toLocaleDateString()}</div>
                    <div><strong>ISBN:</strong> ${book.isbn || "N/A"}</div>
                    <div><strong>Location:</strong> ${book.location}</div>
                </div>
            </div>
        `
    })
    .join("")

  container.innerHTML = borrowedBooksHTML
  document.getElementById("returnSubmitBtn").disabled = true
}

function loadRenewableBooks(userId) {
  const transactions = JSON.parse(localStorage.getItem("libraryTransactions") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")

  // Find renewable books for this user (not overdue and not already renewed recently)
  const borrowedTransactions = transactions.filter(
    (t) => t.userId == userId && t.type === "borrow" && t.status === "active",
  )

  const container = document.getElementById("renewableBooksList")

  if (borrowedTransactions.length === 0) {
    container.innerHTML = '<p class="no-books">This user has no books available for renewal</p>'
    document.getElementById("renewSubmitBtn").disabled = true
    return
  }

  const renewableBooksHTML = borrowedTransactions
    .map((transaction) => {
      const book = books.find((b) => b.id == transaction.bookId)
      if (!book) return ""

      const dueDate = new Date(transaction.dueDate)
      const today = new Date()
      const isOverdue = dueDate < today
      const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

      // Don't allow renewal if overdue
      if (isOverdue) return ""

      const statusClass = "status-renewable"
      const statusText = `Due in ${daysDiff} days`

      return `
            <div class="book-item" onclick="selectBookForRenewal(${transaction.id})">
                <div class="book-header">
                    <div>
                        <div class="book-title">${book.title}</div>
                        <div class="book-author">by ${book.author}</div>
                    </div>
                    <span class="book-status ${statusClass}">${statusText}</span>
                </div>
                <div class="book-details">
                    <div><strong>Borrowed:</strong> ${new Date(transaction.borrowDate).toLocaleDateString()}</div>
                    <div><strong>Current Due:</strong> ${dueDate.toLocaleDateString()}</div>
                    <div><strong>ISBN:</strong> ${book.isbn || "N/A"}</div>
                    <div><strong>Renewals:</strong> ${transaction.renewalCount || 0}</div>
                </div>
            </div>
        `
    })
    .filter((html) => html !== "")
    .join("")

  if (renewableBooksHTML === "") {
    container.innerHTML = '<p class="no-books">No books available for renewal (overdue books cannot be renewed)</p>'
    document.getElementById("renewSubmitBtn").disabled = true
  } else {
    container.innerHTML = renewableBooksHTML
    document.getElementById("renewSubmitBtn").disabled = true
  }
}

function selectBookForReturn(transactionId) {
  // Clear previous selections
  document.querySelectorAll("#borrowedBooksList .book-item").forEach((item) => {
    item.classList.remove("selected")
  })

  // Select this book
  event.currentTarget.classList.add("selected")

  // Calculate late fee
  const transactions = JSON.parse(localStorage.getItem("libraryTransactions") || "[]")
  const transaction = transactions.find((t) => t.id === transactionId)

  if (transaction) {
    const dueDate = new Date(transaction.dueDate)
    const today = new Date()
    const daysLate = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)))
    const lateFee = daysLate * 0.25 // $0.25 per day

    document.getElementById("lateFee").value = lateFee.toFixed(2)
    document.getElementById("returnSubmitBtn").disabled = false

    // Store selected transaction ID
    document.getElementById("returnSubmitBtn").dataset.transactionId = transactionId
  }
}

function selectBookForRenewal(transactionId) {
  // Clear previous selections
  document.querySelectorAll("#renewableBooksList .book-item").forEach((item) => {
    item.classList.remove("selected")
  })

  // Select this book
  event.currentTarget.classList.add("selected")
  document.getElementById("renewSubmitBtn").disabled = false

  // Store selected transaction ID
  document.getElementById("renewSubmitBtn").dataset.transactionId = transactionId
}

function switchTab(tab) {
  currentTab = tab

  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
  document.getElementById(tab + "Tab").classList.add("active")

  // Show/hide sections
  document.getElementById("borrowSection").style.display = tab === "borrow" ? "block" : "none"
  document.getElementById("returnSection").style.display = tab === "return" ? "block" : "none"
  document.getElementById("renewSection").style.display = tab === "renew" ? "block" : "none"
}

function handleBorrowSubmit(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const userId = formData.get("userId")
  const bookId = formData.get("bookId")
  const dueDate = formData.get("dueDate")
  const notes = formData.get("notes")

  if (!userId || !bookId || !dueDate) {
    alert("Please fill in all required fields.")
    return
  }

  const submitBtn = e.target.querySelector('button[type="submit"]')
  showLoading(submitBtn)

  setTimeout(() => {
    processBorrowing(userId, bookId, dueDate, notes)
    hideLoading(submitBtn)
  }, 1500)
}

function handleReturnSubmit(e) {
  e.preventDefault()

  const transactionId = document.getElementById("returnSubmitBtn").dataset.transactionId
  const condition = document.getElementById("returnCondition").value
  const lateFee = Number.parseFloat(document.getElementById("lateFee").value) || 0
  const notes = document.getElementById("returnNotes").value

  if (!transactionId) {
    alert("Please select a book to return.")
    return
  }

  const submitBtn = e.target.querySelector('button[type="submit"]')
  showLoading(submitBtn)

  setTimeout(() => {
    processReturn(transactionId, condition, lateFee, notes)
    hideLoading(submitBtn)
  }, 1500)
}

function handleRenewSubmit(e) {
  e.preventDefault()

  const transactionId = document.getElementById("renewSubmitBtn").dataset.transactionId
  const newDueDate = document.getElementById("newDueDate").value
  const notes = document.getElementById("renewNotes").value

  if (!transactionId || !newDueDate) {
    alert("Please select a book and set a new due date.")
    return
  }

  const submitBtn = e.target.querySelector('button[type="submit"]')
  showLoading(submitBtn)

  setTimeout(() => {
    processRenewal(transactionId, newDueDate, notes)
    hideLoading(submitBtn)
  }, 1500)
}

function processBorrowing(userId, bookId, dueDate, notes) {
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")
  const transactions = JSON.parse(localStorage.getItem("libraryTransactions") || "[]")

  const user = users.find((u) => u.id == userId)
  const book = books.find((b) => b.id == bookId)

  if (!user || !book) {
    alert("User or book not found.")
    return
  }

  // Create transaction
  const transaction = {
    id: Date.now(),
    type: "borrow",
    userId: Number.parseInt(userId),
    bookId: Number.parseInt(bookId),
    borrowDate: new Date().toISOString().split("T")[0],
    dueDate: dueDate,
    status: "active",
    notes: notes || "",
    renewalCount: 0,
  }

  transactions.push(transaction)

  // Update book status
  const updatedBooks = books.map((b) => {
    if (b.id == bookId) {
      return { ...b, status: "Borrowed", borrowedBy: `${user.firstName} ${user.lastName}`, dueDate: dueDate }
    }
    return b
  })

  // Update user's borrowed count
  const updatedUsers = users.map((u) => {
    if (u.id == userId) {
      return {
        ...u,
        booksCheckedOut: (u.booksCheckedOut || 0) + 1,
        totalBooksBorrowed: (u.totalBooksBorrowed || 0) + 1,
      }
    }
    return u
  })

  // Save to localStorage
  localStorage.setItem("libraryTransactions", JSON.stringify(transactions))
  localStorage.setItem("libraryBooks", JSON.stringify(updatedBooks))
  localStorage.setItem("libraryUsers", JSON.stringify(updatedUsers))

  // Show success modal
  showSuccessModal("Borrowing Successful!", {
    type: "borrow",
    user: user,
    book: book,
    dueDate: dueDate,
    transactionId: transaction.id,
  })

  // Reset form and update stats
  resetBorrowForm()
  updateStats()
  loadRecentTransactions()
}

function processReturn(transactionId, condition, lateFee, notes) {
  const transactions = JSON.parse(localStorage.getItem("libraryTransactions") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")

  const transaction = transactions.find((t) => t.id == transactionId)
  if (!transaction) {
    alert("Transaction not found.")
    return
  }

  const user = users.find((u) => u.id == transaction.userId)
  const book = books.find((b) => b.id == transaction.bookId)

  // Update transaction
  const updatedTransactions = transactions.map((t) => {
    if (t.id == transactionId) {
      return {
        ...t,
        status: "returned",
        returnDate: new Date().toISOString().split("T")[0],
        returnCondition: condition,
        lateFee: lateFee,
        returnNotes: notes,
      }
    }
    return t
  })

  // Update book status
  const updatedBooks = books.map((b) => {
    if (b.id == transaction.bookId) {
      return {
        ...b,
        status: "Available",
        borrowedBy: null,
        dueDate: null,
      }
    }
    return b
  })

  // Update user's borrowed count
  const updatedUsers = users.map((u) => {
    if (u.id == transaction.userId) {
      return {
        ...u,
        booksCheckedOut: Math.max(0, (u.booksCheckedOut || 0) - 1),
      }
    }
    return u
  })

  // Save to localStorage
  localStorage.setItem("libraryTransactions", JSON.stringify(updatedTransactions))
  localStorage.setItem("libraryBooks", JSON.stringify(updatedBooks))
  localStorage.setItem("libraryUsers", JSON.stringify(updatedUsers))

  // Show success modal
  showSuccessModal("Return Successful!", {
    type: "return",
    user: user,
    book: book,
    lateFee: lateFee,
    condition: condition,
    transactionId: transactionId,
  })

  // Reset form and update stats
  resetReturnForm()
  updateStats()
  loadRecentTransactions()
}

function processRenewal(transactionId, newDueDate, notes) {
  const transactions = JSON.parse(localStorage.getItem("libraryTransactions") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")

  const transaction = transactions.find((t) => t.id == transactionId)
  if (!transaction) {
    alert("Transaction not found.")
    return
  }

  const user = users.find((u) => u.id == transaction.userId)
  const book = books.find((b) => b.id == transaction.bookId)

  // Update transaction
  const updatedTransactions = transactions.map((t) => {
    if (t.id == transactionId) {
      return {
        ...t,
        dueDate: newDueDate,
        renewalCount: (t.renewalCount || 0) + 1,
        renewalDate: new Date().toISOString().split("T")[0],
        renewalNotes: notes,
      }
    }
    return t
  })

  // Update book due date
  const updatedBooks = books.map((b) => {
    if (b.id == transaction.bookId) {
      return { ...b, dueDate: newDueDate }
    }
    return b
  })

  // Save to localStorage
  localStorage.setItem("libraryTransactions", JSON.stringify(updatedTransactions))
  localStorage.setItem("libraryBooks", JSON.stringify(updatedBooks))

  // Show success modal
  showSuccessModal("Renewal Successful!", {
    type: "renew",
    user: user,
    book: book,
    newDueDate: newDueDate,
    renewalCount: (transaction.renewalCount || 0) + 1,
    transactionId: transactionId,
  })

  // Reset form and update stats
  resetRenewForm()
  updateStats()
  loadRecentTransactions()
}

function showSuccessModal(title, details) {
  document.getElementById("successTitle").textContent = title

  let detailsHTML = ""

  if (details.type === "borrow") {
    detailsHTML = `
            <div class="preview-item">
                <h4>👤 User</h4>
                <div class="preview-details">
                    <div><strong>Name:</strong> ${details.user.firstName} ${details.user.lastName}</div>
                    <div><strong>Member ID:</strong> ${details.user.membershipNumber}</div>
                </div>
            </div>
            <div class="preview-item">
                <h4>📖 Book</h4>
                <div class="preview-details">
                    <div><strong>Title:</strong> ${details.book.title}</div>
                    <div><strong>Author:</strong> ${details.book.author}</div>
                </div>
            </div>
            <div class="preview-item">
                <h4>📅 Details</h4>
                <div class="preview-details">
                    <div><strong>Borrowed:</strong> ${new Date().toLocaleDateString()}</div>
                    <div><strong>Due Date:</strong> ${new Date(details.dueDate).toLocaleDateString()}</div>
                    <div><strong>Transaction ID:</strong> ${details.transactionId}</div>
                </div>
            </div>
        `
  } else if (details.type === "return") {
    detailsHTML = `
            <div class="preview-item">
                <h4>👤 User</h4>
                <div class="preview-details">
                    <div><strong>Name:</strong> ${details.user.firstName} ${details.user.lastName}</div>
                    <div><strong>Member ID:</strong> ${details.user.membershipNumber}</div>
                </div>
            </div>
            <div class="preview-item">
                <h4>📖 Book</h4>
                <div class="preview-details">
                    <div><strong>Title:</strong> ${details.book.title}</div>
                    <div><strong>Author:</strong> ${details.book.author}</div>
                </div>
            </div>
            <div class="preview-item">
                <h4>📅 Return Details</h4>
                <div class="preview-details">
                    <div><strong>Returned:</strong> ${new Date().toLocaleDateString()}</div>
                    <div><strong>Condition:</strong> ${details.condition}</div>
                    <div><strong>Late Fee:</strong> $${details.lateFee.toFixed(2)}</div>
                    <div><strong>Transaction ID:</strong> ${details.transactionId}</div>
                </div>
            </div>
        `
  } else if (details.type === "renew") {
    detailsHTML = `
            <div class="preview-item">
                <h4>👤 User</h4>
                <div class="preview-details">
                    <div><strong>Name:</strong> ${details.user.firstName} ${details.user.lastName}</div>
                    <div><strong>Member ID:</strong> ${details.user.membershipNumber}</div>
                </div>
            </div>
            <div class="preview-item">
                <h4>📖 Book</h4>
                <div class="preview-details">
                    <div><strong>Title:</strong> ${details.book.title}</div>
                    <div><strong>Author:</strong> ${details.book.author}</div>
                </div>
            </div>
            <div class="preview-item">
                <h4>🔄 Renewal Details</h4>
                <div class="preview-details">
                    <div><strong>Renewed:</strong> ${new Date().toLocaleDateString()}</div>
                    <div><strong>New Due Date:</strong> ${new Date(details.newDueDate).toLocaleDateString()}</div>
                    <div><strong>Renewal Count:</strong> ${details.renewalCount}</div>
                    <div><strong>Transaction ID:</strong> ${details.transactionId}</div>
                </div>
            </div>
        `
  }

  document.getElementById("successDetails").innerHTML = detailsHTML
  document.getElementById("successModal").classList.add("active")
}

function closeSuccessModal() {
  document.getElementById("successModal").classList.remove("active")
}

function printReceipt() {
  // In a real application, this would generate a printable receipt
  alert("Receipt printing functionality would be implemented here.")
}

function updateStats() {
  const transactions = JSON.parse(localStorage.getItem("libraryTransactions") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")

  const activeBorrows = transactions.filter((t) => t.type === "borrow" && t.status === "active")
  const today = new Date().toISOString().split("T")[0]
  const todayTransactions = transactions.filter(
    (t) => t.borrowDate === today || t.returnDate === today || t.renewalDate === today,
  )

  // Calculate overdue books
  const overdueBooks = activeBorrows.filter((t) => {
    const dueDate = new Date(t.dueDate)
    const today = new Date()
    return dueDate < today
  })

  const availableBooks = books.filter((b) => b.status === "Available")

  document.getElementById("totalBorrowedCount").textContent = activeBorrows.length
  document.getElementById("overdueCount").textContent = overdueBooks.length
  document.getElementById("todayTransactionsCount").textContent = todayTransactions.length
  document.getElementById("availableBooksCount").textContent = availableBooks.length
}

function loadRecentTransactions() {
  const transactions = JSON.parse(localStorage.getItem("libraryTransactions") || "[]")
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => {
      const dateA = new Date(a.borrowDate || a.returnDate || a.renewalDate)
      const dateB = new Date(b.borrowDate || b.returnDate || b.renewalDate)
      return dateB - dateA
    })
    .slice(0, 5)

  const container = document.getElementById("recentTransactionsList")

  if (recentTransactions.length === 0) {
    container.innerHTML = '<p class="no-books">No recent transactions</p>'
    return
  }

  const transactionsHTML = recentTransactions
    .map((transaction) => {
      const user = users.find((u) => u.id == transaction.userId)
      const book = books.find((b) => b.id == transaction.bookId)

      if (!user || !book) return ""

      let typeClass = ""
      let typeText = ""
      let dateText = ""

      if (transaction.status === "returned") {
        typeClass = "type-return"
        typeText = "Returned"
        dateText = new Date(transaction.returnDate).toLocaleDateString()
      } else if (transaction.renewalDate) {
        typeClass = "type-renew"
        typeText = "Renewed"
        dateText = new Date(transaction.renewalDate).toLocaleDateString()
      } else {
        typeClass = "type-borrow"
        typeText = "Borrowed"
        dateText = new Date(transaction.borrowDate).toLocaleDateString()
      }

      return `
            <div class="transaction-item">
                <div class="transaction-header">
                    <span class="transaction-type ${typeClass}">${typeText}</span>
                    <span class="transaction-time">${dateText}</span>
                </div>
                <div class="transaction-details">
                    <div><strong>User:</strong> ${user.firstName} ${user.lastName}</div>
                    <div><strong>Book:</strong> ${book.title}</div>
                    <div><strong>Author:</strong> ${book.author}</div>
                    <div><strong>Due Date:</strong> ${new Date(transaction.dueDate).toLocaleDateString()}</div>
                </div>
            </div>
        `
    })
    .filter((html) => html !== "")
    .join("")

  container.innerHTML = transactionsHTML
}

function resetBorrowForm() {
  document.getElementById("borrowForm").reset()
  document.getElementById("borrowUserSearch").value = ""
  document.getElementById("borrowBookSearch").value = ""
  document.getElementById("borrowUserId").value = ""
  document.getElementById("borrowBookId").value = ""
  document.getElementById("borrowPreview").style.display = "none"

  // Reset due date to 2 weeks from today
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 14)
  document.getElementById("dueDate").value = defaultDueDate.toISOString().split("T")[0]
}

function resetReturnForm() {
  document.getElementById("returnForm").reset()
  document.getElementById("returnUserSearch").value = ""
  document.getElementById("returnUserId").value = ""
  document.getElementById("borrowedBooksList").innerHTML =
    '<p class="no-books">Select a user to see their borrowed books</p>'
  document.getElementById("returnSubmitBtn").disabled = true
  document.getElementById("lateFee").value = ""

  // Clear selected books
  document.querySelectorAll("#borrowedBooksList .book-item").forEach((item) => {
    item.classList.remove("selected")
  })
}

function resetRenewForm() {
  document.getElementById("renewForm").reset()
  document.getElementById("renewUserSearch").value = ""
  document.getElementById("renewUserId").value = ""
  document.getElementById("renewableBooksList").innerHTML =
    '<p class="no-books">Select a user to see their renewable books</p>'
  document.getElementById("renewSubmitBtn").disabled = true

  // Reset new due date to 2 weeks from today
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 14)
  document.getElementById("newDueDate").value = defaultDueDate.toISOString().split("T")[0]

  // Clear selected books
  document.querySelectorAll("#renewableBooksList .book-item").forEach((item) => {
    item.classList.remove("selected")
  })
}

function showLoading(button) {
  button.disabled = true
  button.querySelector(".btn-text").style.display = "none"
  button.querySelector(".btn-loading").style.display = "flex"
}

function hideLoading(button) {
  button.disabled = false
  button.querySelector(".btn-text").style.display = "block"
  button.querySelector(".btn-loading").style.display = "none"
}

function calculateDaysDifference(date1, date2) {
  const timeDifference = date2.getTime() - date1.getTime()
  return Math.ceil(timeDifference / (1000 * 3600 * 24))
}

function goBack() {
  window.location.href = "hlengiwe_library.html"
}

function goToTransactionHistory() {
  window.location.href = "transaction-history.html"
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSuccessModal()
  }
})

// Make search functions globally accessible
window.selectBorrowUser = selectBorrowUser
window.selectBorrowBook = selectBorrowBook
window.selectReturnUser = selectReturnUser
window.selectRenewUser = selectRenewUser
