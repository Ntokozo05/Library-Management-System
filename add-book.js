// Add Book Page JavaScript

let currentStep = 1;
let formData = {};
let uploadedFile = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    setupFileUpload();
});

function initializeForm() {
    // Set default values
    document.getElementById('language').value = 'English';
    document.getElementById('status').value = 'Available';
    document.getElementById('year').value = new Date().getFullYear();
    
    // Focus on first input
    document.getElementById('title').focus();
}

function setupEventListeners() {
    // Form validation on input
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });
    
    // Description character counter
    const descriptionField = document.getElementById('description');
    descriptionField.addEventListener('input', updateCharacterCount);
    
    // Form submission
    document.getElementById('addBookForm').addEventListener('submit', handleSubmit);
    
    // ISBN formatting
    document.getElementById('isbn').addEventListener('input', formatISBN);
    
    // Location formatting
    document.getElementById('location').addEventListener('input', formatLocation);
}

function setupFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('bookCover');
    
    // Click to upload
    fileUploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleFileDrop);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
    }
    
    uploadedFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('previewImage').src = e.target.result;
        document.getElementById('filePreview').style.display = 'block';
        document.getElementById('fileUploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeFile() {
    uploadedFile = null;
    document.getElementById('filePreview').style.display = 'none';
    document.getElementById('fileUploadArea').style.display = 'block';
    document.getElementById('bookCover').value = '';
}

function formatISBN(e) {
    let value = e.target.value.replace(/[^\dX]/g, '');
    if (value.length === 13 && value.startsWith('978')) {
        value = value.replace(/(\d{3})(\d{1})(\d{5})(\d{3})(\d{1})/, '$1-$2-$3-$4-$5');
    } else if (value.length === 10) {
        value = value.replace(/(\d{1})(\d{5})(\d{3})(\d{1}|X)/, '$1-$2-$3-$4');
    }
    e.target.value = value;
}

function formatLocation(e) {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (value.length > 0 && !value.includes('-')) {
        if (value.length > 1) {
            value = value.charAt(0) + '-' + value.slice(1);
        }
    }
    e.target.value = value;
}

function updateCharacterCount() {
    const description = document.getElementById('description');
    const count = document.getElementById('descriptionCount');
    const currentLength = description.value.length;
    
    count.textContent = currentLength;
    
    if (currentLength > 500) {
        count.style.color = '#e74c3c';
        description.value = description.value.substring(0, 500);
        count.textContent = '500';
    } else {
        count.style.color = '#7f8c8d';
    }
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
        case 'title':
            if (value && value.length < 2) {
                isValid = false;
                errorMessage = 'Title must be at least 2 characters long.';
            }
            break;
            
        case 'author':
            if (value && value.length < 2) {
                isValid = false;
                errorMessage = 'Author name must be at least 2 characters long.';
            }
            break;
            
        case 'isbn':
            if (value && !isValidISBN(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid ISBN.';
            }
            break;
            
        case 'year':
            const currentYear = new Date().getFullYear();
            if (value && (value < 1000 || value > currentYear)) {
                isValid = false;
                errorMessage = `Year must be between 1000 and ${currentYear}.`;
            }
            break;
            
        case 'pages':
            if (value && value < 1) {
                isValid = false;
                errorMessage = 'Number of pages must be at least 1.';
            }
            break;
            
        case 'location':
            if (value && !isValidLocation(value)) {
                isValid = false;
                errorMessage = 'Location must be in format: A-1-001';
            }
            break;
    }
    
    if (!isValid) {
        showError(field, errorMessage);
    }
    
    return isValid;
}

function isValidISBN(isbn) {
    const cleanISBN = isbn.replace(/[^\dX]/g, '');
    return cleanISBN.length === 10 || cleanISBN.length === 13;
}

function isValidLocation(location) {
    return /^[A-Z]-\d+-\d+$/.test(location);
}

function getFieldLabel(fieldName) {
    const labels = {
        'title': 'Title',
        'author': 'Author',
        'isbn': 'ISBN',
        'category': 'Category',
        'year': 'Year',
        'publisher': 'Publisher',
        'pages': 'Pages',
        'language': 'Language',
        'edition': 'Edition',
        'location': 'Location',
        'status': 'Status',
        'description': 'Description',
        'tags': 'Tags'
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

function nextStep() {
    if (currentStep === 1) {
        // Validate step 1 required fields
        const requiredFields = ['title', 'author', 'category'];
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
    }
    
    if (currentStep === 2) {
        // Validate step 2 required fields
        const locationField = document.getElementById('location');
        if (!validateField(locationField)) {
            alert('Please enter a valid shelf location.');
            return;
        }
        
        // Populate review section
        populateReview();
    }
    
    if (currentStep < 3) {
        currentStep++;
        updateStepDisplay();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber === currentStep) {
            step.classList.add('active');
        } else if (stepNumber < currentStep) {
            step.classList.add('completed');
        }
    });
    
    // Update form steps
    document.querySelectorAll('.form-step').forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });
}

function populateReview() {
    const formData = new FormData(document.getElementById('addBookForm'));
    
    // Basic information
    const basicInfo = [
        { label: 'Title', value: formData.get('title') },
        { label: 'Author', value: formData.get('author') },
        { label: 'ISBN', value: formData.get('isbn') || 'Not provided' },
        { label: 'Category', value: formData.get('category') },
        { label: 'Publication Year', value: formData.get('year') || 'Not provided' }
    ];
    
    document.getElementById('reviewBasic').innerHTML = basicInfo
        .map(item => `
            <div class="review-item">
                <div class="review-label">${item.label}</div>
                <div class="review-value">${item.value}</div>
            </div>
        `).join('');
    
    // Detailed information
    const detailInfo = [
        { label: 'Publisher', value: formData.get('publisher') || 'Not provided' },
        { label: 'Pages', value: formData.get('pages') || 'Not provided' },
        { label: 'Language', value: formData.get('language') },
        { label: 'Edition', value: formData.get('edition') || 'Not provided' },
        { label: 'Shelf Location', value: formData.get('location') },
        { label: 'Status', value: formData.get('status') },
        { label: 'Description', value: formData.get('description') || 'No description provided' },
        { label: 'Tags', value: formData.get('tags') || 'No tags' }
    ];
    
    document.getElementById('reviewDetails').innerHTML = detailInfo
        .map(item => `
            <div class="review-item">
                <div class="review-label">${item.label}</div>
                <div class="review-value">${item.value}</div>
            </div>
        `).join('');
    
    // Book cover
    if (uploadedFile) {
        document.getElementById('reviewCoverImage').src = document.getElementById('previewImage').src;
        document.getElementById('reviewCoverSection').style.display = 'block';
    } else {
        document.getElementById('reviewCoverSection').style.display = 'none';
    }
}

function handleSubmit(e) {
    e.preventDefault();
    
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
        const formData = new FormData(document.getElementById('addBookForm'));
        const bookData = {
            id: Date.now(), // Generate unique ID
            title: formData.get('title'),
            author: formData.get('author'),
            isbn: formData.get('isbn') || '',
            category: formData.get('category'),
            year: parseInt(formData.get('year')) || new Date().getFullYear(),
            publisher: formData.get('publisher') || '',
            pages: parseInt(formData.get('pages')) || 0,
            language: formData.get('language'),
            edition: formData.get('edition') || '',
            location: formData.get('location'),
            status: formData.get('status'),
            description: formData.get('description') || '',
            tags: formData.get('tags') || '',
            dateAdded: new Date().toISOString().split('T')[0],
            cover: uploadedFile ? 'uploaded' : null
        };
        
        // In a real application, you would send this data to your backend
        console.log('Book data to be saved:', bookData);
        
        // Save to localStorage for demo purposes
        let books = JSON.parse(localStorage.getItem('libraryBooks') || '[]');
        books.push(bookData);
        localStorage.setItem('libraryBooks', JSON.stringify(books));
        
        // Show success modal
        document.getElementById('successMessage').textContent = 
            `"${bookData.title}" by ${bookData.author} has been successfully added to your library.`;
        document.getElementById('successModal').classList.add('active');
        
        // Reset button state
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        
    }, 2000); // Simulate 2 second delay
}

function resetForm() {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
        document.getElementById('addBookForm').reset();
        removeFile();
        currentStep = 1;
        updateStepDisplay();
        
        // Reset default values
        document.getElementById('language').value = 'English';
        document.getElementById('status').value = 'Available';
        document.getElementById('year').value = new Date().getFullYear();
        
        // Clear all errors
        document.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
        
        // Focus on first input
        document.getElementById('title').focus();
    }
}

function addAnotherBook() {
    document.getElementById('successModal').classList.remove('active');
    resetForm();
}

function goBack() {
    if (hasUnsavedChanges()) {
        if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
            window.location.href = 'hlengiwe_library.html';
        }
    } else {
        window.location.href = 'hlengiwe_library.html';
    }
}

function goToViewBooks() {
    window.location.href = 'view-books.html';
}

function hasUnsavedChanges() {
    const form = document.getElementById('addBookForm');
    const formData = new FormData(form);
    
    for (let [key, value] of formData.entries()) {
        if (value.trim() !== '' && key !== 'language' && key !== 'status' && key !== 'year') {
            return true;
        }
    }
    
    return uploadedFile !== null;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('successModal');
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    }
    
    // Ctrl+Enter to submit form
    if (e.ctrlKey && e.key === 'Enter') {
        if (currentStep === 3) {
            document.getElementById('addBookForm').dispatchEvent(new Event('submit'));
        } else {
            nextStep();
        }
    }
});

// Warn before leaving page with unsaved changes
window.addEventListener('beforeunload', function(e) {
    if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
    }
});