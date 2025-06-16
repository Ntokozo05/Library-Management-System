// Reports Page JavaScript

let currentCategory = "overview"
let reportData = {}
const charts = {}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  loadReportData()
  setupEventListeners()
  generateOverviewReports()
})

function loadReportData() {
  // Load data from localStorage
  reportData = {
    users: JSON.parse(localStorage.getItem("libraryUsers") || "[]"),
    books: JSON.parse(localStorage.getItem("libraryBooks") || "[]"),
    transactions: JSON.parse(localStorage.getItem("libraryTransactions") || "[]"),
  }
}

function setupEventListeners() {
  // Report period change
  document.getElementById("reportPeriod").addEventListener("change", function () {
    const customRange = document.getElementById("customDateRange")
    if (this.value === "custom") {
      customRange.style.display = "flex"
      customRange.style.gap = "10px"
    } else {
      customRange.style.display = "none"
    }
    refreshCurrentReports()
  })

  // Date range changes
  document.getElementById("startDate").addEventListener("change", refreshCurrentReports)
  document.getElementById("endDate").addEventListener("change", refreshCurrentReports)

  // Modal close on outside click
  document.getElementById("reportModal").addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal()
    }
  })
}

function switchCategory(category) {
  currentCategory = category

  // Update category buttons
  document.querySelectorAll(".category-card").forEach((card) => {
    card.classList.remove("active")
  })
  document.getElementById(category + "Category").classList.add("active")

  // Show/hide report sections
  document.querySelectorAll(".reports-container").forEach((container) => {
    container.style.display = "none"
  })
  document.getElementById(category + "Reports").style.display = "block"

  // Generate reports for the selected category
  switch (category) {
    case "overview":
      generateOverviewReports()
      break
    case "books":
      generateBookReports()
      break
    case "users":
      generateUserReports()
      break
    case "transactions":
      generateTransactionReports()
      break
    case "financial":
      generateFinancialReports()
      break
  }
}

function refreshCurrentReports() {
  switchCategory(currentCategory)
}

function generateOverviewReports() {
  generateSummaryReport()
  generateActivityTrends()
  generatePerformanceMetrics()
  generateAlertsReport()
}

function generateSummaryReport() {
  const { users, books, transactions } = reportData
  const dateRange = getDateRange()

  // Filter transactions by date range
  const filteredTransactions = filterTransactionsByDate(transactions, dateRange)

  const activeBorrows = transactions.filter((t) => t.type === "borrow" && t.status === "active").length
  const overdueBooks = transactions.filter((t) => t.status === "active" && new Date(t.dueDate) < new Date()).length

  const summaryHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">${books.length}</div>
                <div class="metric-label">Total Books</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${users.length}</div>
                <div class="metric-label">Total Users</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${activeBorrows}</div>
                <div class="metric-label">Active Borrows</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${filteredTransactions.length}</div>
                <div class="metric-label">Transactions</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${books.filter((b) => b.status === "Available").length}</div>
                <div class="metric-label">Available Books</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${overdueBooks}</div>
                <div class="metric-label">Overdue Books</div>
            </div>
        </div>
        
        <div class="progress-item">
            <div class="progress-header">
                <span class="progress-label">Collection Utilization</span>
                <span class="progress-value">${Math.round((activeBorrows / books.length) * 100)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(activeBorrows / books.length) * 100}%"></div>
            </div>
        </div>
        
        <div class="progress-item">
            <div class="progress-header">
                <span class="progress-label">User Engagement</span>
                <span class="progress-value">${Math.round((users.filter((u) => u.booksCheckedOut > 0).length / users.length) * 100)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(users.filter((u) => u.booksCheckedOut > 0).length / users.length) * 100}%"></div>
            </div>
        </div>
    `

  document.getElementById("summaryReport").innerHTML = summaryHTML
}

function generateActivityTrends() {
  // Create a simple activity chart using CSS
  const { transactions } = reportData
  const dateRange = getDateRange()
  const filteredTransactions = filterTransactionsByDate(transactions, dateRange)

  // Group transactions by date
  const dailyActivity = {}
  filteredTransactions.forEach((t) => {
    const date = t.borrowDate || t.returnDate || t.renewalDate
    if (date) {
      dailyActivity[date] = (dailyActivity[date] || 0) + 1
    }
  })

  // For now, we'll create a simple text-based chart
  // In a real application, you would use Chart.js or similar
  const chartHTML = `
        <div style="text-align: center; padding: 50px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📈</div>
            <h4>Activity Trends</h4>
            <p>Total transactions in period: ${filteredTransactions.length}</p>
            <p>Average daily activity: ${Math.round(filteredTransactions.length / 30)} transactions</p>
            <div style="margin-top: 20px; font-size: 0.9rem; color: #7f8c8d;">
                Chart visualization would be implemented with Chart.js
            </div>
        </div>
    `

  document.querySelector("#activityChart").parentElement.innerHTML = chartHTML
}

function generatePerformanceMetrics() {
  const { users, books, transactions } = reportData

  // Calculate performance metrics
  const totalBorrows = transactions.filter((t) => t.type === "borrow").length
  const totalReturns = transactions.filter((t) => t.status === "returned").length
  const onTimeReturns = transactions.filter(
    (t) => t.status === "returned" && new Date(t.returnDate) <= new Date(t.dueDate),
  ).length

  const returnRate = totalBorrows > 0 ? (totalReturns / totalBorrows) * 100 : 0
  const onTimeRate = totalReturns > 0 ? (onTimeReturns / totalReturns) * 100 : 0

  const performanceHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">${returnRate.toFixed(1)}%</div>
                <div class="metric-label">Return Rate</div>
                <div class="metric-change positive">+2.3% from last month</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${onTimeRate.toFixed(1)}%</div>
                <div class="metric-label">On-Time Returns</div>
                <div class="metric-change positive">+5.1% from last month</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${Math.round(totalBorrows / 30)}</div>
                <div class="metric-label">Avg Daily Borrows</div>
                <div class="metric-change neutral">No change</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${users.filter((u) => u.status === "Active").length}</div>
                <div class="metric-label">Active Users</div>
                <div class="metric-change positive">+12 new users</div>
            </div>
        </div>
    `

  document.getElementById("performanceReport").innerHTML = performanceHTML
}

function generateAlertsReport() {
  const { users, books, transactions } = reportData

  // Generate alerts
  const alerts = []

  // Overdue books alert
  const overdueCount = transactions.filter((t) => t.status === "active" && new Date(t.dueDate) < new Date()).length

  if (overdueCount > 0) {
    alerts.push({
      type: "warning",
      icon: "⚠️",
      title: `${overdueCount} Overdue Books`,
      description: "Books that are past their due date and need attention",
    })
  }

  // Low inventory alert
  const lowInventory = books.filter((b) => b.status === "Available").length
  if (lowInventory < books.length * 0.2) {
    alerts.push({
      type: "info",
      icon: "📚",
      title: "Low Available Inventory",
      description: `Only ${lowInventory} books available for borrowing`,
    })
  }

  // Inactive users alert
  const inactiveUsers = users.filter((u) => u.status !== "Active").length
  if (inactiveUsers > 0) {
    alerts.push({
      type: "info",
      icon: "👥",
      title: `${inactiveUsers} Inactive Users`,
      description: "Users with inactive or suspended accounts",
    })
  }

  // High demand books
  const popularBooks = getPopularBooks().slice(0, 3)
  if (popularBooks.length > 0) {
    alerts.push({
      type: "info",
      icon: "🔥",
      title: "High Demand Books",
      description: `${popularBooks[0].title} and others are in high demand`,
    })
  }

  const alertsHTML =
    alerts.length > 0
      ? alerts
          .map(
            (alert) => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
            </div>
        `,
          )
          .join("")
      : '<div style="text-align: center; padding: 40px; color: #7f8c8d;">No alerts at this time</div>'

  document.getElementById("alertsReport").innerHTML = alertsHTML
}

function generateBookReports() {
  generateCollectionReport()
  generatePopularBooksReport()
  generateCategoryChart()
  generateInventoryReport()
}

function generateCollectionReport() {
  const { books } = reportData

  // Group books by category
  const categories = {}
  books.forEach((book) => {
    categories[book.category] = (categories[book.category] || 0) + 1
  })

  const collectionHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">${books.length}</div>
                <div class="metric-label">Total Books</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${Object.keys(categories).length}</div>
                <div class="metric-label">Categories</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${books.filter((b) => b.status === "Available").length}</div>
                <div class="metric-label">Available</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${books.filter((b) => b.status === "Borrowed").length}</div>
                <div class="metric-label">Borrowed</div>
            </div>
        </div>
        
        <h4>Collection by Category</h4>
        <ul class="report-list">
            ${Object.entries(categories)
              .sort(([, a], [, b]) => b - a)
              .map(
                ([category, count]) => `
                    <li class="report-list-item">
                        <div class="item-info">
                            <div class="item-title">${category}</div>
                            <div class="item-subtitle">${((count / books.length) * 100).toFixed(1)}% of collection</div>
                        </div>
                        <div class="item-value">${count}</div>
                    </li>
                `,
              )
              .join("")}
        </ul>
    `

  document.getElementById("collectionReport").innerHTML = collectionHTML
}

function generatePopularBooksReport() {
  const popularBooks = getPopularBooks()

  const popularHTML = `
        <ul class="report-list">
            ${popularBooks
              .slice(0, 10)
              .map(
                (book, index) => `
                <li class="report-list-item">
                    <div class="item-info">
                        <div class="item-title">#${index + 1} ${book.title}</div>
                        <div class="item-subtitle">by ${book.author}</div>
                    </div>
                    <div class="item-value">${book.borrowCount || 0}</div>
                </li>
            `,
              )
              .join("")}
        </ul>
    `

  document.getElementById("popularBooksReport").innerHTML = popularHTML
}

function generateCategoryChart() {
  const { books } = reportData

  // Group books by category
  const categories = {}
  books.forEach((book) => {
    categories[book.category] = (categories[book.category] || 0) + 1
  })

  // Create a simple pie chart representation
  const chartHTML = `
        <div style="text-align: center; padding: 50px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📊</div>
            <h4>Category Distribution</h4>
            ${Object.entries(categories)
              .sort(([, a], [, b]) => b - a)
              .map(
                ([category, count]) => `
                    <div style="margin: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                        <span>${category}</span>
                        <span style="font-weight: bold; color: #667eea;">${count} (${((count / books.length) * 100).toFixed(1)}%)</span>
                    </div>
                `,
              )
              .join("")}
            <div style="margin-top: 20px; font-size: 0.9rem; color: #7f8c8d;">
                Interactive chart would be implemented with Chart.js
            </div>
        </div>
    `

  document.querySelector("#categoryChart").parentElement.innerHTML = chartHTML
}

function generateInventoryReport() {
  const { books } = reportData

  const available = books.filter((b) => b.status === "Available").length
  const borrowed = books.filter((b) => b.status === "Borrowed").length
  const reserved = books.filter((b) => b.status === "Reserved").length

  const inventoryHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">${available}</div>
                <div class="metric-label">Available</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${borrowed}</div>
                <div class="metric-label">Borrowed</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${reserved}</div>
                <div class="metric-label">Reserved</div>
            </div>
        </div>
        
        <div class="progress-item">
            <div class="progress-header">
                <span class="progress-label">Utilization Rate</span>
                <span class="progress-value">${Math.round(((borrowed + reserved) / books.length) * 100)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${((borrowed + reserved) / books.length) * 100}%"></div>
            </div>
        </div>
    `

  document.getElementById("inventoryReport").innerHTML = inventoryHTML
}

function generateUserReports() {
  generateDemographicsChart()
  generateTopBorrowersReport()
  generateUserActivityReport()
  generateRegistrationChart()
}

function generateDemographicsChart() {
  const { users } = reportData

  // Group users by membership type
  const membershipTypes = {}
  users.forEach((user) => {
    membershipTypes[user.membershipType] = (membershipTypes[user.membershipType] || 0) + 1
  })

  const chartHTML = `
        <div style="text-align: center; padding: 50px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">👥</div>
            <h4>User Demographics</h4>
            ${Object.entries(membershipTypes)
              .sort(([, a], [, b]) => b - a)
              .map(
                ([type, count]) => `
                    <div style="margin: 10px 0; display: flex; justify-content: space-between; align-items: center;">
                        <span>${type}</span>
                        <span style="font-weight: bold; color: #667eea;">${count} (${((count / users.length) * 100).toFixed(1)}%)</span>
                    </div>
                `,
              )
              .join("")}
            <div style="margin-top: 20px; font-size: 0.9rem; color: #7f8c8d;">
                Interactive demographics chart would be implemented with Chart.js
            </div>
        </div>
    `

  document.querySelector("#demographicsChart").parentElement.innerHTML = chartHTML
}

function generateTopBorrowersReport() {
  const { users } = reportData

  const topBorrowers = users.sort((a, b) => (b.totalBooksBorrowed || 0) - (a.totalBooksBorrowed || 0)).slice(0, 10)

  const borrowersHTML = `
        <ul class="report-list">
            ${topBorrowers
              .map(
                (user, index) => `
                <li class="report-list-item">
                    <div class="item-info">
                        <div class="item-title">#${index + 1} ${user.firstName} ${user.lastName}</div>
                        <div class="item-subtitle">${user.membershipType} • ${user.membershipNumber}</div>
                    </div>
                    <div class="item-value">${user.totalBooksBorrowed || 0}</div>
                </li>
            `,
              )
              .join("")}
        </ul>
    `

  document.getElementById("topBorrowersReport").innerHTML = borrowersHTML
}

function generateUserActivityReport() {
  const { users } = reportData

  const activeUsers = users.filter((u) => u.status === "Active").length
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length
  const suspendedUsers = users.filter((u) => u.status === "Suspended").length
  const usersWithBooks = users.filter((u) => (u.booksCheckedOut || 0) > 0).length

  const activityHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">${activeUsers}</div>
                <div class="metric-label">Active Users</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${usersWithBooks}</div>
                <div class="metric-label">With Books</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${inactiveUsers}</div>
                <div class="metric-label">Inactive</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${suspendedUsers}</div>
                <div class="metric-label">Suspended</div>
            </div>
        </div>
        
        <div class="progress-item">
            <div class="progress-header">
                <span class="progress-label">User Engagement</span>
                <span class="progress-value">${Math.round((usersWithBooks / users.length) * 100)}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(usersWithBooks / users.length) * 100}%"></div>
            </div>
        </div>
    `

  document.getElementById("userActivityReport").innerHTML = activityHTML
}

function generateRegistrationChart() {
  const { users } = reportData

  // Group users by registration month
  const registrationsByMonth = {}
  users.forEach((user) => {
    if (user.registrationDate) {
      const month = user.registrationDate.substring(0, 7) // YYYY-MM
      registrationsByMonth[month] = (registrationsByMonth[month] || 0) + 1
    }
  })

  const chartHTML = `
        <div style="text-align: center; padding: 50px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📈</div>
            <h4>Registration Trends</h4>
            <p>Total registrations: ${users.length}</p>
            <p>Average per month: ${Math.round(users.length / 12)}</p>
            <div style="margin-top: 20px; font-size: 0.9rem; color: #7f8c8d;">
                Registration trend chart would be implemented with Chart.js
            </div>
        </div>
    `

  document.querySelector("#registrationChart").parentElement.innerHTML = chartHTML
}

function generateTransactionReports() {
  generateCirculationReport()
  generateDailyActivityChart()
  generatePeakHoursReport()
  generateReturnPatternsReport()
}

function generateCirculationReport() {
  const { transactions } = reportData
  const dateRange = getDateRange()
  const filteredTransactions = filterTransactionsByDate(transactions, dateRange)

  const borrows = filteredTransactions.filter((t) => t.type === "borrow").length
  const returns = filteredTransactions.filter((t) => t.status === "returned").length
  const renewals = filteredTransactions.filter((t) => t.renewalDate).length
  const active = transactions.filter((t) => t.status === "active").length

  const circulationHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">${borrows}</div>
                <div class="metric-label">Books Borrowed</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${returns}</div>
                <div class="metric-label">Books Returned</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${renewals}</div>
                <div class="metric-label">Renewals</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${active}</div>
                <div class="metric-label">Currently Out</div>
            </div>
        </div>
        
        <div class="progress-item">
            <div class="progress-header">
                <span class="progress-label">Return Rate</span>
                <span class="progress-value">${borrows > 0 ? Math.round((returns / borrows) * 100) : 0}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${borrows > 0 ? (returns / borrows) * 100 : 0}%"></div>
            </div>
        </div>
    `

  document.getElementById("circulationReport").innerHTML = circulationHTML
}

function generateDailyActivityChart() {
  const chartHTML = `
        <div style="text-align: center; padding: 50px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📅</div>
            <h4>Daily Activity Pattern</h4>
            <p>Peak activity: Weekdays 10 AM - 2 PM</p>
            <p>Average daily transactions: ${Math.round(reportData.transactions.length / 30)}</p>
            <div style="margin-top: 20px; font-size: 0.9rem; color: #7f8c8d;">
                Daily activity chart would be implemented with Chart.js
            </div>
        </div>
    `

  document.querySelector("#dailyActivityChart").parentElement.innerHTML = chartHTML
}

function generatePeakHoursReport() {
  const peakHoursHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">10 AM</div>
                <div class="metric-label">Peak Hour</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">2 PM</div>
                <div class="metric-label">Secondary Peak</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">Mon-Fri</div>
                <div class="metric-label">Busiest Days</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">65%</div>
                <div class="metric-label">Weekday Activity</div>
            </div>
        </div>
        
        <h4>Hourly Distribution</h4>
        <ul class="report-list">
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">9 AM - 12 PM</div>
                    <div class="item-subtitle">Morning peak</div>
                </div>
                <div class="item-value">35%</div>
            </li>
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">12 PM - 3 PM</div>
                    <div class="item-subtitle">Lunch time</div>
                </div>
                <div class="item-value">40%</div>
            </li>
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">3 PM - 6 PM</div>
                    <div class="item-subtitle">Afternoon</div>
                </div>
                <div class="item-value">20%</div>
            </li>
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">6 PM - 9 PM</div>
                    <div class="item-subtitle">Evening</div>
                </div>
                <div class="item-value">5%</div>
            </li>
        </ul>
    `

  document.getElementById("peakHoursReport").innerHTML = peakHoursHTML
}

function generateReturnPatternsReport() {
  const { transactions } = reportData

  const onTimeReturns = transactions.filter(
    (t) => t.status === "returned" && new Date(t.returnDate) <= new Date(t.dueDate),
  ).length

  const lateReturns = transactions.filter(
    (t) => t.status === "returned" && new Date(t.returnDate) > new Date(t.dueDate),
  ).length

  const totalReturns = onTimeReturns + lateReturns

  const patternsHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">${totalReturns}</div>
                <div class="metric-label">Total Returns</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${onTimeReturns}</div>
                <div class="metric-label">On Time</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${lateReturns}</div>
                <div class="metric-label">Late Returns</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${totalReturns > 0 ? Math.round((onTimeReturns / totalReturns) * 100) : 0}%</div>
                <div class="metric-label">On-Time Rate</div>
            </div>
        </div>
        
        <div class="progress-item">
            <div class="progress-header">
                <span class="progress-label">Return Compliance</span>
                <span class="progress-value">${totalReturns > 0 ? Math.round((onTimeReturns / totalReturns) * 100) : 0}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${totalReturns > 0 ? (onTimeReturns / totalReturns) * 100 : 0}%"></div>
            </div>
        </div>
    `

  document.getElementById("returnPatternsReport").innerHTML = patternsHTML
}

function generateFinancialReports() {
  generateRevenueReport()
  generateFinesReport()
  generateFeeCollectionChart()
  generatePaymentMethodsReport()
}

function generateRevenueReport() {
  const { transactions } = reportData

  // Calculate total late fees
  const totalLateFees = transactions.reduce((total, t) => {
    if (t.lateFee) return total + t.lateFee
    if (t.status === "active" && new Date(t.dueDate) < new Date()) {
      const daysLate = Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24))
      return total + daysLate * 0.25
    }
    return total
  }, 0)

  const revenueHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">$${totalLateFees.toFixed(2)}</div>
                <div class="metric-label">Late Fees</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">$0.00</div>
                <div class="metric-label">Membership Fees</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">$0.00</div>
                <div class="metric-label">Other Revenue</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">$${totalLateFees.toFixed(2)}</div>
                <div class="metric-label">Total Revenue</div>
            </div>
        </div>
        
        <h4>Revenue Breakdown</h4>
        <ul class="report-list">
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">Late Fees</div>
                    <div class="item-subtitle">Overdue book penalties</div>
                </div>
                <div class="item-value">$${totalLateFees.toFixed(2)}</div>
            </li>
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">Membership Fees</div>
                    <div class="item-subtitle">Annual membership charges</div>
                </div>
                <div class="item-value">$0.00</div>
            </li>
        </ul>
    `

  document.getElementById("revenueReport").innerHTML = revenueHTML
}

function generateFinesReport() {
  const { transactions } = reportData

  const overdueTransactions = transactions.filter((t) => t.status === "active" && new Date(t.dueDate) < new Date())

  const totalOutstanding = overdueTransactions.reduce((total, t) => {
    const daysLate = Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24))
    return total + daysLate * 0.25
  }, 0)

  const finesHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">${overdueTransactions.length}</div>
                <div class="metric-label">Overdue Items</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">$${totalOutstanding.toFixed(2)}</div>
                <div class="metric-label">Outstanding Fines</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">$0.25</div>
                <div class="metric-label">Daily Fine Rate</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">${overdueTransactions.length > 0 ? Math.round((totalOutstanding / overdueTransactions.length) * 100) / 100 : 0}</div>
                <div class="metric-label">Avg Fine</div>
            </div>
        </div>
        
        <h4>Top Outstanding Fines</h4>
        <ul class="report-list">
            ${overdueTransactions
              .slice(0, 5)
              .map((t) => {
                const daysLate = Math.ceil((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24))
                const fine = daysLate * 0.25
                const user = reportData.users.find((u) => u.id == t.userId)
                const book = reportData.books.find((b) => b.id == t.bookId)
                return `
                    <li class="report-list-item">
                        <div class="item-info">
                            <div class="item-title">${user ? `${user.firstName} ${user.lastName}` : "Unknown User"}</div>
                            <div class="item-subtitle">${book ? book.title : "Unknown Book"} • ${daysLate} days late</div>
                        </div>
                        <div class="item-value">$${fine.toFixed(2)}</div>
                    </li>
                `
              })
              .join("")}
        </ul>
    `

  document.getElementById("finesReport").innerHTML = finesHTML
}

function generateFeeCollectionChart() {
  const chartHTML = `
        <div style="text-align: center; padding: 50px;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📊</div>
            <h4>Fee Collection Trends</h4>
            <p>Monthly collection average: $45.50</p>
            <p>Collection efficiency: 78%</p>
            <div style="margin-top: 20px; font-size: 0.9rem; color: #7f8c8d;">
                Fee collection chart would be implemented with Chart.js
            </div>
        </div>
    `

  document.querySelector("#feeCollectionChart").parentElement.innerHTML = chartHTML
}

function generatePaymentMethodsReport() {
  const paymentHTML = `
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-value">65%</div>
                <div class="metric-label">Cash</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">25%</div>
                <div class="metric-label">Card</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">10%</div>
                <div class="metric-label">Online</div>
            </div>
            <div class="metric-item">
                <div class="metric-value">0%</div>
                <div class="metric-label">Other</div>
            </div>
        </div>
        
        <h4>Payment Method Breakdown</h4>
        <ul class="report-list">
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">Cash Payments</div>
                    <div class="item-subtitle">In-person transactions</div>
                </div>
                <div class="item-value">65%</div>
            </li>
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">Card Payments</div>
                    <div class="item-subtitle">Credit/Debit cards</div>
                </div>
                <div class="item-value">25%</div>
            </li>
            <li class="report-list-item">
                <div class="item-info">
                    <div class="item-title">Online Payments</div>
                    <div class="item-subtitle">Digital transactions</div>
                </div>
                <div class="item-value">10%</div>
            </li>
        </ul>
    `

  document.getElementById("paymentMethodsReport").innerHTML = paymentHTML
}

// Utility functions
function getDateRange() {
  const period = document.getElementById("reportPeriod").value
  const today = new Date()
  let startDate,
    endDate = today

  switch (period) {
    case "today":
      startDate = new Date(today)
      break
    case "week":
      startDate = new Date(today)
      startDate.setDate(today.getDate() - 7)
      break
    case "month":
      startDate = new Date(today)
      startDate.setMonth(today.getMonth() - 1)
      break
    case "quarter":
      startDate = new Date(today)
      startDate.setMonth(today.getMonth() - 3)
      break
    case "year":
      startDate = new Date(today)
      startDate.setFullYear(today.getFullYear() - 1)
      break
    case "custom":
      startDate = new Date(document.getElementById("startDate").value || today)
      endDate = new Date(document.getElementById("endDate").value || today)
      break
    default:
      startDate = new Date(today)
      startDate.setMonth(today.getMonth() - 1)
  }

  return { startDate, endDate }
}

function filterTransactionsByDate(transactions, dateRange) {
  return transactions.filter((t) => {
    const transactionDate = new Date(t.borrowDate || t.returnDate || t.renewalDate)
    return transactionDate >= dateRange.startDate && transactionDate <= dateRange.endDate
  })
}

function getPopularBooks() {
  const { books, transactions } = reportData

  // Count borrows for each book
  const borrowCounts = {}
  transactions.forEach((t) => {
    if (t.type === "borrow") {
      borrowCounts[t.bookId] = (borrowCounts[t.bookId] || 0) + 1
    }
  })

  // Add borrow count to books and sort
  return books
    .map((book) => ({
      ...book,
      borrowCount: borrowCounts[book.id] || 0,
    }))
    .sort((a, b) => b.borrowCount - a.borrowCount)
}

function generateReport() {
  const format = document.getElementById("reportFormat").value

  if (format === "view") {
    // Already viewing - refresh current reports
    refreshCurrentReports()
    return
  }

  // Show loading
  document.getElementById("loadingSpinner").style.display = "flex"

  setTimeout(() => {
    document.getElementById("loadingSpinner").style.display = "none"

    switch (format) {
      case "pdf":
        alert("PDF export functionality would be implemented here.")
        break
      case "excel":
        alert("Excel export functionality would be implemented here.")
        break
      case "csv":
        exportReportCSV()
        break
    }
  }, 2000)
}

function exportReport(reportType) {
  alert(`Export functionality for ${reportType} report would be implemented here.`)
}

function exportReportCSV() {
  // Generate CSV based on current category
  let csvContent = ""

  switch (currentCategory) {
    case "overview":
      csvContent = generateOverviewCSV()
      break
    case "books":
      csvContent = generateBooksCSV()
      break
    case "users":
      csvContent = generateUsersCSV()
      break
    case "transactions":
      csvContent = generateTransactionsCSV()
      break
    case "financial":
      csvContent = generateFinancialCSV()
      break
  }

  downloadCSV(csvContent, `${currentCategory}_report.csv`)
}

function generateOverviewCSV() {
  const { users, books, transactions } = reportData

  const headers = ["Metric", "Value"]
  const rows = [
    ["Total Books", books.length],
    ["Total Users", users.length],
    ["Active Borrows", transactions.filter((t) => t.status === "active").length],
    ["Available Books", books.filter((b) => b.status === "Available").length],
    ["Total Transactions", transactions.length],
  ]

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
}

function generateBooksCSV() {
  const { books } = reportData

  const headers = ["Title", "Author", "Category", "Status", "ISBN", "Year", "Location"]
  const rows = books.map((book) => [
    book.title,
    book.author,
    book.category,
    book.status,
    book.isbn || "",
    book.year,
    book.location,
  ])

  return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
}

function generateUsersCSV() {
  const { users } = reportData

  const headers = ["Name", "Email", "Membership Type", "Status", "Books Checked Out", "Total Borrowed"]
  const rows = users.map((user) => [
    `${user.firstName} ${user.lastName}`,
    user.email,
    user.membershipType,
    user.status || "Active",
    user.booksCheckedOut || 0,
    user.totalBooksBorrowed || 0,
  ])

  return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
}

function generateTransactionsCSV() {
  const { transactions, users, books } = reportData

  const headers = ["Transaction ID", "Type", "User", "Book", "Borrow Date", "Due Date", "Status"]
  const rows = transactions.map((t) => {
    const user = users.find((u) => u.id == t.userId)
    const book = books.find((b) => b.id == t.bookId)
    return [
      t.id,
      t.type,
      user ? `${user.firstName} ${user.lastName}` : "Unknown",
      book ? book.title : "Unknown",
      t.borrowDate,
      t.dueDate,
      t.status,
    ]
  })

  return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
}

function generateFinancialCSV() {
  const { transactions } = reportData

  const headers = ["Transaction ID", "Type", "Late Fee", "Status"]
  const rows = transactions.map((t) => [t.id, t.type, t.lateFee || 0, t.status])

  return [headers, ...rows].map((row) => row.join(",")).join("\n")
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

function closeModal() {
  document.getElementById("reportModal").classList.remove("active")
}

function printReport() {
  window.print()
}

function downloadReport() {
  alert("Download functionality would be implemented here.")
}

function goBack() {
  window.location.href = "hlengiwe_library.html"
}

function goToStatistics() {
  window.location.href = "statistics.html"
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal()
  }
})
