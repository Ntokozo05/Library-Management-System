// Register User Page JavaScript

let uploadedPhoto = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    updateStats();
});

function initializePage() {
    // Set default country
    document.getElementById('country').value = 'United States';
    
    // Focus on first input
    document.getElementById('firstName').focus();
    
    // Set max date for date of birth (18 years ago)
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    document.getElementById('dateOfBirth').max = eighteenYearsAgo.toISOString().split('T')[0];
}

function setupEventListeners() {
    // Form validation on input
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
    
    // Phone number formatting
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
    
    // Notes character counter
    document.getElementById('notes').addEventListener('input', updateNotesCount);
    
    // Profile photo upload
    document.getElementById('profilePhoto').addEventListener('change', handlePhotoUpload);
    
    // Form submission
    document.getElementById('registerUserForm').addEventListener('submit', handleSubmit);
    
    // Modal close on outside click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

function updateStats() {
    // Get existing users from localStorage
    const users = JSON.parse(localStorage.getItem('libraryUsers') || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'Active').length;
    const newUsersToday = users.filter(user => user.registrationDate === today).length;
    
    document.getElementById('totalUsersCount').textContent = totalUsers;
    document.getElementById('activeUsersCount').textContent = activeUsers;
    document.getElementById('newUsersToday').textContent = newUsersToday;
}

function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})/, '($1) $2-');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})/, '($1) ');
    }
    
    e.target.value = value;
}

function updateNotesCount() {
    const notes = document.getElementById('notes');
    const count = document.getElementById('notesCount');
    const currentLength = notes.value.length;
    
    count.textContent = currentLength;
    
    if (currentLength > 300) {
        count.style.color = '#e74c3c';
        notes.value = notes.value.substring(0, 300);
        count.textContent = '300';
    } else {
        count.style.color = '#7f8c8d';
    }
}

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB.');
        return;
    }
    
    uploadedPhoto = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = `
            <img src="${e.target.result}" alt="Profile photo">
            <div class="upload-overlay" onclick="document.getElementById('profilePhoto').click()">
                <span class="upload-icon">📷</span>
                <span class="upload-text">Change Photo</span>
            </div>
        `;
        document.getElementById('removePhoto').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removeProfilePhoto() {
    uploadedPhoto = null;
    document.getElementById('photoPreview').innerHTML = `
        <div class="default-avatar">👤</div>
        <div class="upload-overlay" onclick="document.getElementById('profilePhoto').click()">
            <span class="upload-icon">📷</span>
            <span class="upload-text">Upload Photo</span>
        </div>
    `;
    document.getElementById('removePhoto').style.display = 'none';
    document.getElementById('profilePhoto').value = '';
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous error
    clearError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(fieldName)} is required.`;
    }
    
    // Specific field validations
    switch (fieldName) {
        case 'firstName':
        case 'lastName':
            if (value && (value.length < 2 || !/^[a-zA-Z\s'-]+$/.test(value))) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters and contain only letters.';
            }
            break;
            
        case 'email':
            if (value && !isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            }
            break;
            
        case 'phone':
            if (value && !isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number.';
            }
            break;
            
        case 'dateOfBirth':
            if (value && !isValidAge(value)) {
                isValid = false;
                errorMessage = 'User must be at least 13 years old.';
            }
            break;
            
        case 'zipCode':
            if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid ZIP code.';
            }
            break;
    }
    
    if (!isValid) {
        showError(field, errorMessage);
    }
    
    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10;
}

function isValidAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 13;
    }
    return age >= 13;
}

function getFieldLabel(fieldName) {
    const labels = {
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'email': 'Email',
        'phone': 'Phone',
        'dateOfBirth': 'Date of Birth',
        'membershipType': 'Membership Type',
        'agreeTerms': 'Terms Agreement'
    };
    return labels[fieldName] || fieldName;
}

function showError(field, message) {
    field.classList.add('error');
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearError(field) {
    field.classList.remove('error');
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function previewUser() {
    // Validate required fields first
    const requiredFields = ['firstName', 'lastName', 'email', 'membershipType', 'agreeTerms'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields correctly.');
        return;
    }
    
    // Generate preview content
    const formData = new FormData(document.getElementById('registerUserForm'));
    const previewContent = generatePreviewContent(formData);
    
    document.getElementById('previewContent').innerHTML = previewContent;
    document.getElementById('previewModal').classList.add('active');
}

function generatePreviewContent(formData) {
    const photoSrc = uploadedPhoto ? URL.createObjectURL(uploadedPhoto) : null;
    
    return `
        <div class="user-preview">
            <div class="preview-header">
                <div class="preview-photo">
                    ${photoSrc ? 
                        `<img src="${photoSrc}" alt="Profile photo" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">` :
                        '<div class="default-avatar" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(45deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">👤</div>'
                    }
                </div>
                <div class="preview-basic">
                    <h3>${formData.get('firstName')} ${formData.get('lastName')}</h3>
                    <p>${formData.get('email')}</p>
                    <p>${formData.get('membershipType')} Member</p>
                </div>
            </div>
            
            <div class="preview-sections">
                <div class="preview-section">
                    <h4>Personal Information</h4>
                    <div class="preview-grid">
                        <div><strong>Phone:</strong> ${formData.get('phone') || 'Not provided'}</div>
                        <div><strong>Date of Birth:</strong> ${formData.get('dateOfBirth') || 'Not provided'}</div>
                        <div><strong>Gender:</strong> ${formData.get('gender') || 'Not specified'}</div>
                    </div>
                </div>
                
                <div class="preview-section">
                    <h4>Address</h4>
                    <div class="preview-grid">
                        <div><strong>Address:</strong> ${formData.get('address') || 'Not provided'}</div>
                        <div><strong>City:</strong> ${formData.get('city') || 'Not provided'}</div>
                        <div><strong>State:</strong> ${formData.get('state') || 'Not provided'}</div>
                        <div><strong>ZIP:</strong> ${formData.get('zipCode') || 'Not provided'}</div>
                        <div><strong>Country:</strong> ${formData.get('country')}</div>
                    </div>
                </div>
                
                <div class="preview-section">
                    <h4>Library Information</h4>
                    <div class="preview-grid">
                        <div><strong>Student/Employee ID:</strong> ${formData.get('studentId') || 'Not provided'}</div>
                        <div><strong>Department:</strong> ${formData.get('department') || 'Not provided'}</div>
                        <div><strong>Emergency Contact:</strong> ${formData.get('emergencyContact') || 'Not provided'}</div>
                        <div><strong>Email Notifications:</strong> ${formData.get('emailNotifications') ? 'Yes' : 'No'}</div>
                    </div>
                </div>
                
                ${formData.get('notes') ? `
                <div class="preview-section">
                    <h4>Additional Notes</h4>
                    <p>${formData.get('notes')}</p>
                </div>
                ` : ''}
            </div>
        </div>
        
        <style>
            .user-preview { font-family: inherit; }
            .preview-header { display: flex; gap: 20px; align-items: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #f8f9fa; }
            .preview-basic h3 { margin: 0 0 5px 0; color: #2c3e50; }
            .preview-basic p { margin: 2px 0; color: #7f8c8d; }
            .preview-section { margin-bottom: 20px; }
            .preview-section h4 { color: #2c3e50; margin-bottom: 10px; border-bottom: 1px solid #e9ecef; padding-bottom: 5px; }
            .preview-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
            .preview-grid div { padding: 5px 0; }
        </style>
    `;
}

function closePreview() {
    document.getElementById('previewModal').classList.remove('active');
}

function submitFromPreview() {
    document.getElementById('previewModal').classList.remove('active');
    document.getElementById('registerUserForm').dispatchEvent(new Event('submit'));
}

function handleSubmit(e) {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'membershipType', 'agreeTerms'];
    let isValid = true;
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields correctly.');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'flex';
    
    // Simulate API call
    setTimeout(() => {
        // Collect form data
        const formData = new FormData(document.getElementById('registerUserForm'));
        const userData = {
            id: Date.now(),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone') || '',
            dateOfBirth: formData.get('dateOfBirth') || '',
            gender: formData.get('gender') || '',
            address: formData.get('address') || '',
            city: formData.get('city') || '',
            state: formData.get('state') || '',
            zipCode: formData.get('zipCode') || '',
            country: formData.get('country'),
            membershipType: formData.get('membershipType'),
            studentId: formData.get('studentId') || '',
            department: formData.get('department') || '',
            emergencyContact: formData.get('emergencyContact') || '',
            notes: formData.get('notes') || '',
            emailNotifications: formData.get('emailNotifications') === 'on',
            registrationDate: new Date().toISOString().split('T')[0],
            status: 'Active',
            membershipNumber: generateMembershipNumber(),
            booksCheckedOut: 0,
            totalBooksBorrowed: 0,
            profilePhoto: uploadedPhoto ? 'uploaded' : null
        };
        
        // Save to localStorage
        let users = JSON.parse(localStorage.getItem('libraryUsers') || '[]');
        users.push(userData);
        localStorage.setItem('libraryUsers', JSON.stringify(users));
        
        // Show success modal
        showSuccessModal(userData);
        
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        
        // Update stats
        updateStats();
        
    }, 2000);
}

function generateMembershipNumber() {
    const prefix = 'LIB';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${year}${random}`;
}

function showSuccessModal(userData) {
    const photoSrc = uploadedPhoto ? URL.createObjectURL(uploadedPhoto) : null;
    
    document.getElementById('newUserCard').innerHTML = `
        <div class="user-info">
            <div class="user-avatar">
                ${photoSrc ? 
                    `<img src="${photoSrc}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` :
                    `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
                }
            </div>
            <div class="user-details">
                <h3>${userData.firstName} ${userData.lastName}</h3>
                <p>📧 ${userData.email}</p>
                <p>🆔 ${userData.membershipNumber}</p>
                <p>👤 ${userData.membershipType} Member</p>
            </div>
        </div>
    `;
    
    document.getElementById('successMessage').textContent = 
        `${userData.firstName} ${userData.lastName} has been successfully registered with membership number ${userData.membershipNumber}.`;
    
    document.getElementById('successModal').classList.add('active');
}

function resetForm() {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        document.getElementById('registerUserForm').reset();
        removeProfilePhoto();
        
        // Reset default values
        document.getElementById('country').value = 'United States';
        
        // Clear all errors
        document.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
        
        // Focus on first input
        document.getElementById('firstName').focus();
    }
}

function registerAnotherUser() {
    document.getElementById('successModal').classList.remove('active');
    resetForm();
}

function showTerms() {
    document.getElementById('termsModal').classList.add('active');
}

function closeTerms() {
    document.getElementById('termsModal').classList.remove('active');
}

function acceptTerms() {
    document.getElementById('agreeTerms').checked = true;
    closeTerms();
}

function goBack() {
    window.location.href = 'hlengiwe_library.html';
}

function goToViewUsers() {
    window.location.href = 'view-users.html';
}

function hasUnsavedChanges() {
    const form = document.getElementById('registerUserForm');
    const formData = new FormData(form);
    
    for (let [key, value] of formData.entries()) {
        if (value.trim() !== '' && key !== 'country' && key !== 'emailNotifications') {
            return true;
        }
    }
    
    return uploadedPhoto !== null;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modal
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// Warn before leaving page with unsaved changes
window.addEventListener('beforeunload', function(e) {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
    }
});