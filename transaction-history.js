// Transaction History Page JavaScript

let transactionsData = []
let filteredTransactions = []
let currentPage = 1
const transactionsPerPage = 10
let activeQuickFilter = null

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  loadTransactionsData()
  initializePage()
  setupEventListeners()
  displayTransactions()
  updateStatistics()
})

function loadTransactionsData() {
  // Load transactions from localStorage
  const storedTransactions = localStorage.getItem("libraryTransactions")
  if (storedTransactions) {
    transactionsData = JSON.parse(storedTransactions)
    filteredTransactions = [...transactionsData]
  }

  // If no transactions exist, create some sample data for demonstration
  if (transactionsData.length === 0) {
    createSampleTransactions()
  }
}

function createSampleTransactions() {
  // This function creates sample transaction data for demonstration
  // In a real application, this would not be needed
  const sampleTransactions = [
    {
      id: 1,
      type: "borrow",
      userId: 1,
      bookId: 1,
      borrowDate: "2024-01-15",
      dueDate: "2024-01-29",
      status: "active",
      notes: "Regular borrowing",
    },
    {
      id: 2,
      type: "return",
      userId: 2,
      bookId: 2,
      borrowDate: "2024-01-10",
      dueDate: "2024-01-24",
      returnDate: "2024-01-20",
      status: "returned",
      returnCondition: "Good",
      lateFee: 0,
    },
  ]

  transactionsData = sampleTransactions
  filteredTransactions = [...transactionsData]
  localStorage.setItem("libraryTransactions", JSON.stringify(transactionsData))
}

function initializePage() {
  // Show loading spinner initially
  document.getElementById("loadingSpinner").style.display = "flex"

  // Set default date filters (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  document.getElementById("dateToFilter").value = today.toISOString().split("T")[0]
  document.getElementById("dateFromFilter").value = thirtyDaysAgo.toISOString().split("T")[0]

  // Simulate loading delay
  setTimeout(() => {
    document.getElementById("loadingSpinner").style.display = "none"
    displayTransactions()
  }, 1000)
}

function setupEventListeners() {
  // Search input
  document.getElementById("searchInput").addEventListener("input", debounce(handleSearch, 300))

  // Filter selects
  document.getElementById("transactionTypeFilter").addEventListener("change", applyFilters)
  document.getElementById("statusFilter").addEventListener("change", applyFilters)
  document.getElementById("dateFromFilter").addEventListener("change", applyFilters)
  document.getElementById("dateToFilter").addEventListener("change", applyFilters)
  document.getElementById("sortBy").addEventListener("change", applyFilters)

  // Modal close on outside click
  document.getElementById("transactionModal").addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal()
    }
  })
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function handleSearch() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()

  if (searchTerm === "") {
    document.getElementById("clearSearch").style.display = "none"
  } else {
    document.getElementById("clearSearch").style.display = "block"
  }

  applyFilters()
}

function clearSearch() {
  document.getElementById("searchInput").value = ""
  document.getElementById("clearSearch").style.display = "none"
  applyFilters()
}

function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  const typeFilter = document.getElementById("transactionTypeFilter").value
  const statusFilter = document.getElementById("statusFilter").value
  const dateFrom = document.getElementById("dateFromFilter").value
  const dateTo = document.getElementById("dateToFilter").value
  const sortBy = document.getElementById("sortBy").value

  // Get user and book data for searching
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")

  // Filter transactions
  filteredTransactions = transactionsData.filter((transaction) => {
    // Search filter
    let matchesSearch = true
    if (searchTerm) {
      const user = users.find((u) => u.id == transaction.userId)
      const book = books.find((b) => b.id == transaction.bookId)

      matchesSearch =
        (user && `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)) ||
        (book && book.title.toLowerCase().includes(searchTerm)) ||
        transaction.id.toString().includes(searchTerm)
    }

    // Type filter
    const matchesType = !typeFilter || transaction.type === typeFilter

    // Status filter
    let matchesStatus = true
    if (statusFilter) {
      if (statusFilter === "overdue") {
        matchesStatus = transaction.status === "active" && new Date(transaction.dueDate) < new Date()
      } else {
        matchesStatus = transaction.status === statusFilter
      }
    }

    // Date filter
    let matchesDate = true
    if (dateFrom || dateTo) {
      const transactionDate = new Date(transaction.borrowDate || transaction.returnDate || transaction.renewalDate)
      if (dateFrom) {
        matchesDate = matchesDate && transactionDate >= new Date(dateFrom)
      }
      if (dateTo) {
        matchesDate = matchesDate && transactionDate <= new Date(dateTo)
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate
  })

  // Sort transactions
  filteredTransactions.sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return (
          new Date(b.borrowDate || b.returnDate || b.renewalDate) -
          new Date(a.borrowDate || a.returnDate || a.renewalDate)
        )
      case "date-asc":
        return (
          new Date(a.borrowDate || a.returnDate || a.renewalDate) -
          new Date(b.borrowDate || b.returnDate || b.renewalDate)
        )
      case "user":
        const userA = users.find((u) => u.id == a.userId)
        const userB = users.find((u) => u.id == b.userId)
        return `${userA?.firstName} ${userA?.lastName}`.localeCompare(`${userB?.firstName} ${userB?.lastName}`)
      case "book":
        const bookA = books.find((b) => b.id == a.bookId)
        const bookB = books.find((b) => b.id == b.bookId)
        return bookA?.title.localeCompare(bookB?.title) || 0
      case "type":
        return a.type.localeCompare(b.type)
      case "status":
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  currentPage = 1
  displayTransactions()
  updateStatistics()
}

function applyQuickFilter(filterType) {
  // Clear active quick filter styling
  document.querySelectorAll(".quick-filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })

  // Set active filter
  event.target.classList.add("active")
  activeQuickFilter = filterType

  const today = new Date()
  let dateFrom = null
  let dateTo = today.toISOString().split("T")[0]

  // Reset other filters
  document.getElementById("transactionTypeFilter").value = ""
  document.getElementById("statusFilter").value = ""

  switch (filterType) {
    case "today":
      dateFrom = today.toISOString().split("T")[0]
      break
    case "week":
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 7)
      dateFrom = weekAgo.toISOString().split("T")[0]
      break
    case "month":
      const monthAgo = new Date()
      monthAgo.setMonth(today.getMonth() - 1)
      dateFrom = monthAgo.toISOString().split("T")[0]
      break
    case "overdue":
      document.getElementById("statusFilter").value = "overdue"
      dateFrom = ""
      dateTo = ""
      break
    case "active":
      document.getElementById("statusFilter").value = "active"
      dateFrom = ""
      dateTo = ""
      break
  }

  if (dateFrom) document.getElementById("dateFromFilter").value = dateFrom
  if (dateTo) document.getElementById("dateToFilter").value = dateTo

  applyFilters()
}

function resetFilters() {
  document.getElementById("searchInput").value = ""
  document.getElementById("transactionTypeFilter").value = ""
  document.getElementById("statusFilter").value = ""
  document.getElementById("dateFromFilter").value = ""
  document.getElementById("dateToFilter").value = ""
  document.getElementById("sortBy").value = "date-desc"
  document.getElementById("clearSearch").style.display = "none"

  // Clear quick filter styling
  document.querySelectorAll(".quick-filter-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  activeQuickFilter = null

  filteredTransactions = [...transactionsData]
  currentPage = 1
  displayTransactions()
  updateStatistics()
}

function displayTransactions() {
  const container = document.getElementById("transactionsTable")
  const startIndex = (currentPage - 1) * transactionsPerPage
  const endIndex = startIndex + transactionsPerPage
  const transactionsToShow = filteredTransactions.slice(startIndex, endIndex)

  // Update filtered count
  document.getElementById("filteredCount").textContent = filteredTransactions.length

  if (transactionsToShow.length === 0) {
    container.innerHTML = ""
    document.getElementById("noResults").style.display = "block"
    document.getElementById("paginationContainer").innerHTML = ""
    return
  }

  document.getElementById("noResults").style.display = "none"

  // Get user and book data
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")

  const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>Type</th>
                    <th>User</th>
                    <th>Book</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Late Fee</th>
                </tr>
            </thead>
            <tbody>
                ${transactionsToShow.map((transaction) => createTransactionRow(transaction, users, books)).join("")}
            </tbody>
        </table>
    `

  container.innerHTML = tableHTML
  generatePagination()
}

function createTransactionRow(transaction, users, books) {
  const user = users.find((u) => u.id == transaction.userId)
  const book = books.find((b) => b.id == transaction.bookId)

  if (!user || !book) return ""

  // Determine status
  let status = transaction.status
  let statusClass = `status-${status}`

  if (status === "active" && new Date(transaction.dueDate) < new Date()) {
    status = "overdue"
    statusClass = "status-overdue"
  }

  // Determine transaction type display
  let typeDisplay = transaction.type
  if (transaction.renewalDate) {
    typeDisplay = "renew"
  } else if (transaction.returnDate) {
    typeDisplay = "return"
  }

  // Determine date to display
  let displayDate = transaction.borrowDate
  if (transaction.returnDate) {
    displayDate = transaction.returnDate
  } else if (transaction.renewalDate) {
    displayDate = transaction.renewalDate
  }

  // Calculate late fee if applicable
  let lateFee = transaction.lateFee || 0
  if (status === "overdue") {
    const daysLate = Math.ceil((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24))
    lateFee = daysLate * 0.25
  }

  return `
        <tr onclick="openTransactionModal(${transaction.id})">
            <td class="transaction-id">#${transaction.id}</td>
            <td><span class="transaction-type type-${typeDisplay}">${typeDisplay}</span></td>
            <td>
                <div class="user-info">
                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                    <div class="user-id">${user.membershipNumber}</div>
                </div>
            </td>
            <td>
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-author">by ${book.author}</div>
                </div>
            </td>
            <td class="date-info">${new Date(displayDate).toLocaleDateString()}</td>
            <td class="date-info">${new Date(transaction.dueDate).toLocaleDateString()}</td>
            <td><span class="transaction-status ${statusClass}">${status}</span></td>
            <td class="late-fee">${lateFee > 0 ? `$${lateFee.toFixed(2)}` : "-"}</td>
        </tr>
    `
}

function generatePagination() {
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage)
  const container = document.getElementById("paginationContainer")

  if (totalPages <= 1) {
    container.innerHTML = ""
    return
  }

  let paginationHTML = ""

  // Previous button
  paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} 
                onclick="changePage(${currentPage - 1})">
            ← Previous
        </button>
    `

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? "active" : ""}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHTML += '<span class="pagination-ellipsis">...</span>'
    }
  }

  // Next button
  paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""} 
                onclick="changePage(${currentPage + 1})">
            Next →
        </button>
    `

  container.innerHTML = paginationHTML
}

function changePage(page) {
  currentPage = page
  displayTransactions()
  window.scrollTo({ top: 0, behavior: "smooth" })
}

function updateStatistics() {
  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")

  const totalTransactions = transactionsData.length
  const activeBorrows = transactionsData.filter((t) => t.type === "borrow" && t.status === "active").length
  const totalReturns = transactionsData.filter((t) => t.status === "returned").length
  const totalRenewals = transactionsData.filter((t) => t.renewalDate).length

  // Calculate overdue transactions
  const overdueTransactions = transactionsData.filter(
    (t) => t.status === "active" && new Date(t.dueDate) < new Date(),
  ).length

  // Calculate total late fees
  const totalLateFees = transactionsData.reduce((total, t) => {
    if (t.lateFee) return total + t.lateFee
    if (t.status === "active" && new Date(t.dueDate) < new Date()) {
      const daysLate = Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24))
      return total + daysLate * 0.25
    }
    return total
  }, 0)

  document.getElementById("totalTransactionsCount").textContent = totalTransactions
  document.getElementById("activeBorrowsCount").textContent = activeBorrows
  document.getElementById("totalReturnsCount").textContent = totalReturns
  document.getElementById("totalRenewalsCount").textContent = totalRenewals
  document.getElementById("overdueTransactionsCount").textContent = overdueTransactions
  document.getElementById("totalLateFees").textContent = `$${totalLateFees.toFixed(2)}`
}

function openTransactionModal(transactionId) {
  const transaction = transactionsData.find((t) => t.id == transactionId)
  if (!transaction) return

  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")
  const user = users.find((u) => u.id == transaction.userId)
  const book = books.find((b) => b.id == transaction.bookId)

  if (!user || !book) return

  const modal = document.getElementById("transactionModal")
  const modalBody = document.getElementById("modalBody")

  // Determine status
  let status = transaction.status
  if (status === "active" && new Date(transaction.dueDate) < new Date()) {
    status = "overdue"
  }

  // Calculate late fee if applicable
  let lateFee = transaction.lateFee || 0
  if (status === "overdue") {
    const daysLate = Math.ceil((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24))
    lateFee = daysLate * 0.25
  }

  modalBody.innerHTML = `
        <div class="transaction-detail-view">
            <div class="detail-section">
                <h4>Transaction Information</h4>
                <div class="detail-grid">
                    <div><strong>Transaction ID:</strong> #${transaction.id}</div>
                    <div><strong>Type:</strong> ${transaction.type}</div>
                    <div><strong>Status:</strong> <span class="transaction-status status-${status}">${status}</span></div>
                    <div><strong>Borrow Date:</strong> ${new Date(transaction.borrowDate).toLocaleDateString()}</div>
                    <div><strong>Due Date:</strong> ${new Date(transaction.dueDate).toLocaleDateString()}</div>
                    ${transaction.returnDate ? `<div><strong>Return Date:</strong> ${new Date(transaction.returnDate).toLocaleDateString()}</div>` : ""}
                    ${transaction.renewalDate ? `<div><strong>Renewal Date:</strong> ${new Date(transaction.renewalDate).toLocaleDateString()}</div>` : ""}
                    ${transaction.renewalCount ? `<div><strong>Renewal Count:</strong> ${transaction.renewalCount}</div>` : ""}
                </div>
            </div>
            
            <div class="detail-section">
                <h4>User Information</h4>
                <div class="detail-grid">
                    <div><strong>Name:</strong> ${user.firstName} ${user.lastName}</div>
                    <div><strong>Email:</strong> ${user.email}</div>
                    <div><strong>Member ID:</strong> ${user.membershipNumber}</div>
                    <div><strong>Membership Type:</strong> ${user.membershipType}</div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Book Information</h4>
                <div class="detail-grid">
                    <div><strong>Title:</strong> ${book.title}</div>
                    <div><strong>Author:</strong> ${book.author}</div>
                    <div><strong>ISBN:</strong> ${book.isbn || "N/A"}</div>
                    <div><strong>Location:</strong> ${book.location}</div>
                </div>
            </div>
            
            ${
              transaction.returnCondition || lateFee > 0
                ? `
            <div class="detail-section">
                <h4>Return Information</h4>
                <div class="detail-grid">
                    ${transaction.returnCondition ? `<div><strong>Condition:</strong> ${transaction.returnCondition}</div>` : ""}
                    ${lateFee > 0 ? `<div><strong>Late Fee:</strong> <span class="late-fee">$${lateFee.toFixed(2)}</span></div>` : ""}
                </div>
            </div>
            `
                : ""
            }
            
            ${
              transaction.notes || transaction.returnNotes || transaction.renewalNotes
                ? `
            <div class="detail-section">
                <h4>Notes</h4>
                <div class="detail-grid">
                    ${transaction.notes ? `<div><strong>Borrow Notes:</strong> ${transaction.notes}</div>` : ""}
                    ${transaction.returnNotes ? `<div><strong>Return Notes:</strong> ${transaction.returnNotes}</div>` : ""}
                    ${transaction.renewalNotes ? `<div><strong>Renewal Notes:</strong> ${transaction.renewalNotes}</div>` : ""}
                </div>
            </div>
            `
                : ""
            }
        </div>
        
        <style>
            .transaction-detail-view { font-family: inherit; }
            .detail-section { margin-bottom: 25px; }
            .detail-section h4 { color: #2c3e50; margin-bottom: 15px; border-bottom: 1px solid #e9ecef; padding-bottom: 8px; }
            .detail-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
            .detail-grid div { padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        </style>
    `

  modal.classList.add("active")
}

function closeModal() {
  document.getElementById("transactionModal").classList.remove("active")
}

function printTransaction() {
  // In a real application, this would generate a printable transaction report
  alert("Print functionality would be implemented here.")
}

function exportTransactions() {
  if (filteredTransactions.length === 0) {
    alert("No transactions to export.")
    return
  }

  const users = JSON.parse(localStorage.getItem("libraryUsers") || "[]")
  const books = JSON.parse(localStorage.getItem("libraryBooks") || "[]")

  const csvContent = generateTransactionsCSV(filteredTransactions, users, books)
  downloadCSV(csvContent, "library_transactions.csv")
}

function generateTransactionsCSV(transactions, users, books) {
  const headers = [
    "Transaction ID",
    "Type",
    "User Name",
    "User Email",
    "Member ID",
    "Book Title",
    "Book Author",
    "ISBN",
    "Borrow Date",
    "Due Date",
    "Return Date",
    "Status",
    "Late Fee",
    "Condition",
    "Notes",
  ]

  const rows = transactions
    .map((transaction) => {
      const user = users.find((u) => u.id == transaction.userId)
      const book = books.find((b) => b.id == transaction.bookId)

      if (!user || !book) return null

      let status = transaction.status
      if (status === "active" && new Date(transaction.dueDate) < new Date()) {
        status = "overdue"
      }

      let lateFee = transaction.lateFee || 0
      if (status === "overdue") {
        const daysLate = Math.ceil((new Date() - new Date(transaction.dueDate)) / (1000 * 60 * 60 * 24))
        lateFee = daysLate * 0.25
      }

      return [
        transaction.id,
        transaction.type,
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.membershipNumber,
        book.title,
        book.author,
        book.isbn || "",
        transaction.borrowDate,
        transaction.dueDate,
        transaction.returnDate || "",
        status,
        lateFee.toFixed(2),
        transaction.returnCondition || "",
        transaction.notes || transaction.returnNotes || transaction.renewalNotes || "",
      ]
    })
    .filter((row) => row !== null)

  return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

function generateReport() {
  // In a real application, this would generate a comprehensive report
  alert("Report generation functionality would be implemented here.")
}

function goBack() {
  window.location.href = "hlengiwe_library.html"
}

function goToBorrowReturn() {
  window.location.href = "borrow-return.html"
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal()
  } else if (e.ctrlKey && e.key === "f") {
    e.preventDefault()
    document.getElementById("searchInput").focus()
  }
})
