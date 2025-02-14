// Global variable to store the record ID being edited
let editingRecordId = null;
let currentPage = 1;
const rowsPerPage = 6;

// Format amount input
function formatAmount() {
    const amountInput = document.getElementById('amount');
    amountInput.value = amountInput.value.replace(/[^0-9.]/g, '');
}

// Load the user dashboard with data
function loadUserDashboard() {
    fetch('/getData', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            renderTable(data); // Render the table with data
            setupPagination(data); // Setup pagination
        })
        .catch(error => console.error('Error loading dashboard:', error));
}

// Render table with data
function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rows = data.slice(start, end);

    rows.forEach((entry, index) => {
        const row = `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.hospital}</td>
                <td>${entry.voteNumber}</td>
                <td>${entry.amount}</td>
                <td>${entry.jobDescription}</td>
                <td>${entry.progress}</td>
                <td>
                    <button class="edit-btn" onclick="editData(${entry.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteData(${entry.id})">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Edit a record
function editData(recordId) {
    editingRecordId = recordId; // Store the record ID for editing

    // Fetch the record data
    fetch(`/getData/${recordId}`, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(result => {
            if (result.data) {
                const data = result.data;
                // Populate form fields with data
                document.getElementById('date').value = data.date;
                document.getElementById('hospital').value = data.hospital;
                document.getElementById('voteNumber').value = data.voteNumber;
                document.getElementById('amount').value = data.amount;
                document.getElementById('jobDescription').value = data.jobDescription;
                document.getElementById('progress').value = data.progress;
            } else {
                alert('Record not found!');
            }
        })
        .catch(error => console.error('Error fetching data for edit:', error));
}

// Delete a record
function deleteData(recordId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        fetch(`/deleteData/${recordId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                loadUserDashboard(); // Reload dashboard after deleting
            })
            .catch(error => console.error('Error deleting data:', error));
    }
}

// Handle form submission (both Add and Edit)
document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        date: document.getElementById('date').value,
        hospital: document.getElementById('hospital').value,
        voteNumber: document.getElementById('voteNumber').value,
        amount: document.getElementById('amount').value,
        jobDescription: document.getElementById('jobDescription').value,
        progress: document.getElementById('progress').value,
    };

    const url = editingRecordId ? `/updateData/${editingRecordId}` : '/submitData';
    const method = editingRecordId ? 'PUT' : 'POST';

    // Submit data to the backend
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            loadUserDashboard(); // Reload the data after submission
            resetForm(); // Reset the form for new input
        })
        .catch(error => console.error('Error submitting data:', error));
});

// Reset the form after submission
function resetForm() {
    document.getElementById('userForm').reset();
    editingRecordId = null; // Clear the editing state
}

// Search functionality
function searchData() {
    const searchValue = document.getElementById('search').value.toLowerCase();
    fetch(`/getData`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const filteredData = data.filter(entry => 
                entry.hospital.toLowerCase().includes(searchValue) ||
                entry.jobDescription.toLowerCase().includes(searchValue)
            );
            currentPage = 1; // Reset to first page
            renderTable(filteredData);
            setupPagination(filteredData);
        })
        .catch(error => console.error('Error searching data:', error));
}

// Pagination setup
function setupPagination(data) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(data.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.disabled = i === currentPage;
        button.onclick = () => {
            currentPage = i;
            renderTable(data);
            setupPagination(data);
        };
        pagination.appendChild(button);
    }
}

// Initialize the dashboard on page load
document.addEventListener('DOMContentLoaded', function () {
    loadUserDashboard(); // Load data when the page is ready

    document.getElementById('search').addEventListener('input', searchData);
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
});

function changePage(direction) {
    fetch(`/getData`, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const totalPages = Math.ceil(data.length / rowsPerPage);
            if ((direction === -1 && currentPage > 1) || (direction === 1 && currentPage < totalPages)) {
                currentPage += direction;
                renderTable(data);
                setupPagination(data);
            }
        })
        .catch(error => console.error('Error changing page:', error));
}

