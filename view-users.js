// View Users Page JavaScript

// Sample user data - In a real application, this would come from a database
let usersData = [
    {
        id: 1,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        membershipType: "Student",
        membershipNumber: "LIB20240001",
        status: "Active",
        registrationDate: "2024-01-15",
        booksCheckedOut: 3,
        totalBooksBorrowed: 15,
        address: "123 Main St, New York, NY 10001",
        dateOfBirth: "1995-03-15",
        department: "Computer Science"
    },
    {
        id: 2,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "(555) 234-5678",
        membershipType: "Faculty",
        membershipNumber: "LIB20240002",
        status: "Active",
        registrationDate: "2024-01-10",
        booksCheckedOut: 5,
        totalBooksBorrowed: 42,
        address: "456 Oak Ave, Boston, MA 02101",
        dateOfBirth: "1980-07-22",
        department: "English Literature"
    },
    {
        id: 3,
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@email.com",
        phone: "(555) 345-6789",
        membershipType: "Public",
        membershipNumber: "LIB20240003",
        status: "Active",
        registrationDate: "2024-01-08",
        booksCheckedOut: 2,
        totalBooksBorrowed: 8,
        address: "789 Pine St, Chicago, IL 60601",
        dateOfBirth: "1988-11-30",
        department: ""
    },
    {
        id: 4,
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@email.com",
        phone: "(555) 456-7890",
        membershipType: "Staff",
        membershipNumber: "LIB20240004",
        status: "Inactive",
        registrationDate: "2023-12-20",
        booksCheckedOut: 0,
        totalBooksBorrowed: 25,
        address: "321 Elm St, Los Angeles, CA 90001",
        dateOfBirth: "1992-05-18",
        department: "Administration"
    },
    {
        id: 5,
        firstName: "Robert",
        lastName: "Wilson",
        email: "robert.wilson@email.com",
        phone: "(555) 567-8901",
        membershipType: "Senior",
        membershipNumber: "LIB20240005",
        status: "Active",
        registrationDate: "2024-01-05",
        booksCheckedOut: 1,
        totalBooksBorrowed: 67,
        address: "654 Maple Dr, Miami, FL 33101",
        dateOfBirth: "1955-09-12",
        department: ""
    },
    {
        id: 6,
        firstName: "Lisa",
        lastName: "Anderson",
        email: "lisa.anderson@email.com",
        phone: "(555) 678-9012",
        membershipType: "Premium",
        membershipNumber: "LIB20240006",
        status: "Suspended",
        registrationDate: "2023-11-15",
        booksCheckedOut: 0,
        totalBooksBorrowed: 12,
        address: "987 Cedar Ln, Seattle, WA 98101",
        dateOfBirth: "1985-12-03",
        department: ""
    }
];

// Global variables
let filteredUsers = [...usersData];
let currentPage = 1;
let usersPerPage = 8;
let currentView = 'card';
let selectedUsers = new Set();

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadUsersFromStorage();
    initializePage();
    setupEventListeners();
    displayUsers();
    updateStatistics();
});

function loadUsersFromStorage() {
    // Load users from localStorage if available
    const storedUsers = localStorage.getItem('libraryUsers');
    if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        if (parsedUsers.length > 0) {
            usersData = parsedUsers;
            filteredUsers = [...usersData];
        }
    }
}

function initializePage() {
    // Show loading spinner initially
    document.getElementById('loadingSpinner').style.display = 'flex';
    
    // Simulate loading delay
    setTimeout(() => {
        document.getElementById('loadingSpinner').style.display = 'none';
        displayUsers();
    }, 1000);
}

function setupEventListeners() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    
    // Filter selects
    document.getElementById('membershipFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);
    
    // Modal close on outside click
    document.getElementById('userModal').addEventListener('click', function(e) {
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
    const membershipFilter = document.getElementById('membershipFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Filter users
    filteredUsers = usersData.filter(user => {
        const matchesSearch = searchTerm === '' || 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm) ||
            user.membershipNumber.toLowerCase().includes(searchTerm);
        
        const matchesMembership = membershipFilter === '' || user.membershipType === membershipFilter;
        const matchesStatus = statusFilter === '' || user.status === statusFilter;
        
        return matchesSearch && matchesMembership && matchesStatus;
    });
    
    // Sort users
    filteredUsers.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            case 'name-desc':
                return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
            case 'registration':
                return new Date(b.registrationDate) - new Date(a.registrationDate);
            case 'registration-desc':
                return new Date(a.registrationDate) - new Date(b.registrationDate);
            case 'membership':
                return a.membershipType.localeCompare(b.membershipType);
            default:
                return 0;
        }
    });
    
    currentPage = 1;
    displayUsers();
    updateStatistics();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('membershipFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('sortBy').value = 'name';
    document.getElementById('clearSearch').style.display = 'none';
    
    filteredUsers = [...usersData];
    currentPage = 1;
    displayUsers();
    updateStatistics();
}

function displayUsers() {
    const container = document.getElementById('usersContainer');
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);
    
    if (usersToShow.length === 0) {
        container.innerHTML = '';
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('paginationContainer').innerHTML = '';
        return;
    }
    
    document.getElementById('noResults').style.display = 'none';
    
    if (currentView === 'card') {
        container.innerHTML = usersToShow.map(user => createUserCard(user)).join('');
    } else {
        container.innerHTML = createUsersTable(usersToShow);
    }
    
    generatePagination();
    updateStatistics();
}

function createUserCard(user) {
    const isSelected = selectedUsers.has(user.id);
    const statusClass = `status-${user.status.toLowerCase()}`;
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    
    return `
        <div class="user-card" onclick="openUserModal(${user.id})">
            <input type="checkbox" class="user-checkbox" ${isSelected ? 'checked' : ''} 
                   onclick="event.stopPropagation(); toggleUserSelection(${user.id})" />
            
            <div class="user-header">
                <div class="user-avatar">
                    ${user.profilePhoto ? 
                        `<img src="/placeholder.svg?height=60&width=60" alt="Profile">` :
                        initials
                    }
                </div>
                <div class="user-info">
                    <div class="user-name">${user.firstName} ${user.lastName}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-membership">${user.membershipType} Member</div>
                </div>
            </div>
            
            <div class="user-details">
                <div class="detail-item">
                    <div class="detail-label">Member ID</div>
                    <div class="detail-value">${user.membershipNumber}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${user.phone || 'Not provided'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Books Out</div>
                    <div class="detail-value">${user.booksCheckedOut}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Total Borrowed</div>
                    <div class="detail-value">${user.totalBooksBorrowed}</div>
                </div>
            </div>
            
            <span class="user-status ${statusClass}">${user.status}</span>
            
            <div class="user-actions">
                <button class="action-btn" onclick="event.stopPropagation(); viewUser(${user.id})">
                    👁️ View
                </button>
                <button class="action-btn edit" onclick="event.stopPropagation(); editUser(${user.id})">
                    ✏️ Edit
                </button>
                <button class="action-btn suspend" onclick="event.stopPropagation(); toggleUserStatus(${user.id})">
                    ${user.status === 'Active' ? '⏸️ Suspend' : '▶️ Activate'}
                </button>
            </div>
        </div>
    `;
}

function createUsersTable(users) {
    const tableRows = users.map(user => {
        const isSelected = selectedUsers.has(user.id);
        const statusClass = `status-${user.status.toLowerCase()}`;
        const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
        
        return `
            <tr onclick="openUserModal(${user.id})" style="cursor: pointer;">
                <td>
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                           onclick="event.stopPropagation(); toggleUserSelection(${user.id})" />
                </td>
                <td>
                    <div class="table-avatar">
                        ${user.profilePhoto ? 
                            `<img src="/placeholder.svg?height=40&width=40" alt="Profile">` :
                            initials
                        }
                    </div>
                </td>
                <td>
                    <div>
                        <div style="font-weight: 600;">${user.firstName} ${user.lastName}</div>
                        <div style="font-size: 0.8rem; color: #7f8c8d;">${user.email}</div>
                    </div>
                </td>
                <td>${user.membershipNumber}</td>
                <td>${user.membershipType}</td>
                <td><span class="user-status ${statusClass}">${user.status}</span></td>
                <td>${user.booksCheckedOut}</td>
                <td>${user.totalBooksBorrowed}</td>
                <td>${formatDate(user.registrationDate)}</td>
                <td>
                    <div style="display: flex; gap: 5px;">
                        <button class="action-btn" onclick="event.stopPropagation(); viewUser(${user.id})" title="View">👁️</button>
                        <button class="action-btn edit" onclick="event.stopPropagation(); editUser(${user.id})" title="Edit">✏️</button>
                        <button class="action-btn suspend" onclick="event.stopPropagation(); toggleUserStatus(${user.id})" title="${user.status === 'Active' ? 'Suspend' : 'Activate'}">
                            ${user.status === 'Active' ? '⏸️' : '▶️'}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    return `
        <div class="users-table">
            <table>
                <thead>
                    <tr>
                        <th width="40">Select</th>
                        <th width="60">Photo</th>
                        <th>Name</th>
                        <th>Member ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Books Out</th>
                        <th>Total</th>
                        <th>Registered</th>
                        <th width="120">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
    `;
}

function toggleView(view) {
    currentView = view;
    
    // Update button states
    document.getElementById('cardView').classList.toggle('active', view === 'card');
    document.getElementById('tableView').classList.toggle('active', view === 'table');
    
    // Update container class
    const container = document.getElementById('usersContainer');
    container.classList.toggle('table-view', view === 'table');
    
    displayUsers();
}

function generatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
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
    displayUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStatistics() {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(user => user.status === 'Active').length;
    const inactiveUsers = usersData.filter(user => user.status !== 'Active').length;
    const filteredCount = filteredUsers.length;
    
    document.getElementById('totalUsersCount').textContent = totalUsers;
    document.getElementById('activeUsersCount').textContent = activeUsers;
    document.getElementById('inactiveUsersCount').textContent = inactiveUsers;
    document.getElementById('filteredUsersCount').textContent = filteredCount;
}

function toggleUserSelection(userId) {
    if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId);
    } else {
        selectedUsers.add(userId);
    }
}

function selectAll() {
    const visibleUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
    visibleUsers.forEach(user => selectedUsers.add(user.id));
    displayUsers();
}

function deselectAll() {
    selectedUsers.clear();
    displayUsers();
}

function exportSelected() {
    if (selectedUsers.size === 0) {
        alert('Please select users to export.');
        return;
    }
    
    const selectedUsersData = usersData.filter(user => selectedUsers.has(user.id));
    const csvContent = generateCSV(selectedUsersData);
    downloadCSV(csvContent, 'library_users.csv');
}

function generateCSV(users) {
    const headers = ['Name', 'Email', 'Phone', 'Membership Type', 'Member ID', 'Status', 'Registration Date', 'Books Checked Out', 'Total Books Borrowed'];
    const rows = users.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.phone || '',
        user.membershipType,
        user.membershipNumber,
        user.status,
        user.registrationDate,
        user.booksCheckedOut,
        user.totalBooksBorrowed
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function suspendSelected() {
    if (selectedUsers.size === 0) {
        alert('Please select users to suspend.');
        return;
    }
    
    if (confirm(`Are you sure you want to suspend ${selectedUsers.size} selected user(s)?`)) {
        usersData = usersData.map(user => {
            if (selectedUsers.has(user.id)) {
                return { ...user, status: 'Suspended' };
            }
            return user;
        });
        
        // Update localStorage
        localStorage.setItem('libraryUsers', JSON.stringify(usersData));
        
        selectedUsers.clear();
        applyFilters();
        alert('Selected users have been suspended.');
    }
}

function openUserModal(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    const modal = document.getElementById('userModal');
    const modalBody = document.getElementById('modalBody');
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    
    modalBody.innerHTML = `
        <div class="user-detail-view">
            <div class="user-detail-header">
                <div class="user-detail-avatar">
                    ${user.profilePhoto ? 
                        `<img src="/placeholder.svg?height=100&width=100" alt="Profile" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">` :
                        `<div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(45deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: bold;">${initials}</div>`
                    }
                </div>
                <div class="user-detail-info">
                    <h3 style="margin-bottom: 10px; color: #2c3e50;">${user.firstName} ${user.lastName}</h3>
                    <p style="margin-bottom: 5px; color: #7f8c8d; font-size: 1.1rem;">${user.email}</p>
                    <p style="margin-bottom: 15px; color: #667eea; font-weight: 600;">${user.membershipType} Member</p>
                    <span class="user-status status-${user.status.toLowerCase()}">${user.status}</span>
                </div>
            </div>
            
            <div class="user-detail-sections">
                <div class="detail-section">
                    <h4>Contact Information</h4>
                    <div class="detail-grid">
                        <div><strong>Phone:</strong> ${user.phone || 'Not provided'}</div>
                        <div><strong>Email:</strong> ${user.email}</div>
                        <div><strong>Address:</strong> ${user.address || 'Not provided'}</div>
                        <div><strong>Date of Birth:</strong> ${user.dateOfBirth ? formatDate(user.dateOfBirth) : 'Not provided'}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Library Information</h4>
                    <div class="detail-grid">
                        <div><strong>Member ID:</strong> ${user.membershipNumber}</div>
                        <div><strong>Membership Type:</strong> ${user.membershipType}</div>
                        <div><strong>Registration Date:</strong> ${formatDate(user.registrationDate)}</div>
                        <div><strong>Department:</strong> ${user.department || 'Not specified'}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Borrowing Statistics</h4>
                    <div class="detail-grid">
                        <div><strong>Books Currently Checked Out:</strong> ${user.booksCheckedOut}</div>
                        <div><strong>Total Books Borrowed:</strong> ${user.totalBooksBorrowed}</div>
                        <div><strong>Account Status:</strong> ${user.status}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .user-detail-view { font-family: inherit; }
            .user-detail-header { display: flex; gap: 20px; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f8f9fa; }
            .user-detail-info h3 { margin: 0 0 5px 0; color: #2c3e50; }
            .user-detail-info p { margin: 2px 0; color: #7f8c8d; }
            .detail-section { margin-bottom: 25px; }
            .detail-section h4 { color: #2c3e50; margin-bottom: 15px; border-bottom: 1px solid #e9ecef; padding-bottom: 8px; }
            .detail-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
            .detail-grid div { padding: 8px 0; border-bottom: 1px solid #f8f9fa; }
        </style>
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('userModal').classList.remove('active');
}

function viewUser(userId) {
    openUserModal(userId);
}

function editUser(userId) {
    alert(`Edit functionality for user ID ${userId} would be implemented here.`);
    // In a real application, this would open an edit form
}

function toggleUserStatus(userId) {
    const user = usersData.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    const action = newStatus === 'Active' ? 'activate' : 'suspend';
    
    if (confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) {
        usersData = usersData.map(u => {
            if (u.id === userId) {
                return { ...u, status: newStatus };
            }
            return u;
        });
        
        // Update localStorage
        localStorage.setItem('libraryUsers', JSON.stringify(usersData));
        
        applyFilters();
        alert(`User has been ${action}d successfully.`);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function goBack() {
    window.location.href = 'hlengiwe_library.html';
}

function goToRegisterUser() {
    window.location.href = 'register-user.html';
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