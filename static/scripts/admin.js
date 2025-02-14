document.addEventListener('DOMContentLoaded', function () {
    loadAdminDashboard();
});

function loadAdminDashboard() {
    fetch('/getData')
        .then(response => response.json())
        .then(data => {
            renderDataList(data);
            renderChart(data);
        })
        .catch(error => console.error('Error loading admin dashboard:', error));
}

function showDataSubmissionForm() {
    document.getElementById('dataSubmissionForm').classList.toggle('hidden');
}



function searchData() {
    const query = document.getElementById('search').value;
    fetch(`/searchData?query=${query}`)
        .then(response => response.json())
        .then(data => renderDataList(data))
        .catch(error => console.error('Error searching data:', error));
}

function filterData() {
    alert('Filter functionality not implemented yet!');
}

function renderDataList(data) {
    const dataList = document.getElementById('dataList');
    dataList.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.textContent = `${item.date} | ${item.hospital} | ${item.voteNumber} | ${item.amount} | ${item.jobDescription} | ${item.progress}`;
        dataList.appendChild(div);
    });
}



function formatAmount() {
    const amountInput = document.getElementById('amount');
    amountInput.value = amountInput.value.replace(/[^0-9.]/g, '');
}

function toggleMenu() {
    const navbarMenu = document.querySelector('.navbar-menu');
    navbarMenu.classList.toggle('show');
}

let currentPage = 1;
const rowsPerPage = 5;

// Initialize data array
const data = [];

// Function to render table rows
function renderTable(data, page) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Clear previous rows
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rows = data.slice(start, end);

    rows.forEach((row) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.date}</td>
            <td>${row.hospital}</td>
            <td>${row.voteNumber}</td>
            <td>${row.amount}</td>
            <td>${row.jobDescription}</td>
            <td>${row.progress}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Function to render pagination buttons
function renderPagination(data) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Clear previous pagination
    const totalPages = Math.ceil(data.length / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.onclick = () => {
            currentPage = i;
            renderTable(data, currentPage);
            renderPagination(data);
        };
        pagination.appendChild(button);
    }
}

// Function to handle form submission
document.getElementById('dataForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent form refresh

    // Collect input values
    const date = document.getElementById('date').value;
    const hospital = document.getElementById('hospital').value;
    const voteNumber = document.getElementById('voteNumber').value;
    const amount = document.getElementById('amount').value;
    const jobDescription = document.getElementById('jobDescription').value;
    const progress = document.getElementById('progress').value;

    // Add new data to the array
    data.push({ date, hospital, voteNumber, amount, jobDescription, progress });

    // Re-render the table and pagination
    renderTable(data, currentPage);
    renderPagination(data);

    // Reset form fields
    event.target.reset();
});

// Initial table and pagination load
function loadTable() {
    renderTable(data, currentPage);
    renderPagination(data);
}

document.addEventListener('DOMContentLoaded', loadTable);
