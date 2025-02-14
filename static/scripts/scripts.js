document.addEventListener('DOMContentLoaded', function () {
    loadAdminDashboard();
});

function loadAdminDashboard() {
    fetch('/getData')
        .then(response => response.json())
        .then(data => {
            document.getElementById('adminDashboard').classList.remove('hidden');
            renderDataList(data);
            renderChart(data);
        })
        .catch(error => console.error('Error loading admin dashboard:', error));
}

function showDataSubmissionForm() {
    document.getElementById('dataSubmissionForm').classList.toggle('hidden');
}

function submitData() {
    const data = {
        date: document.getElementById('date').value,
        hospital: document.getElementById('hospital').value,
        voteNumber: document.getElementById('voteNumber').value,
        amount: document.getElementById('amount').value,
        jobDescription: document.getElementById('jobDescription').value,
        progress: document.getElementById('progress').value,
    };

    // Validation
    if (!data.date || !data.hospital || !data.voteNumber || !data.amount || !data.jobDescription || !data.progress) {
        alert("Please fill in all fields.");
        return;
    }

    fetch('/submitData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            loadAdminDashboard();
        })
        .catch(error => console.error('Error submitting data:', error));
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

function renderChart(data) {
    // Example Chart.js integration
    const ctx = document.getElementById('chartContainer').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.hospital),
            datasets: [{
                label: 'Amount',
                data: data.map(item => item.amount),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
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

// Data storage
let data = [];

// Centralized render functions
function renderHomeDashboard() {
    const topAllocations = document.getElementById('topAllocations');
    const userSummary = document.getElementById('userSummary');

    // Sort by amount (descending) and show top 10
    const sortedData = [...data].sort((a, b) => b.amount - a.amount).slice(0, 10);
    topAllocations.innerHTML = '<ul>' + sortedData.map(entry => `
        <li>${entry.hospital} - ${entry.amount}</li>
    `).join('') + '</ul>';

    // Summarize user updates
    userSummary.innerHTML = `Total Updates: ${data.length}`;
}

function renderAdminDashboard() {
    const adminTableBody = document.getElementById('adminTableBody');
    adminTableBody.innerHTML = ''; // Clear existing rows

    data.forEach(entry => {
        const row = `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.hospital}</td>
                <td>${entry.voteNumber}</td>
                <td>${entry.amount}</td>
                <td>${entry.jobDescription}</td>
                <td>${entry.subjectCode}</td>
                <td>${entry.progress}</td>
            </tr>
        `;
        adminTableBody.innerHTML += row;
    });
}

// Handle form submission
document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = {
        date: document.getElementById('date').value,
        hospital: document.getElementById('hospital').value,
        voteNumber: document.getElementById('voteNumber').value,
        amount: parseFloat(document.getElementById('amount').value.replace(/[^0-9.]/g, '')),
        jobDescription: document.getElementById('jobDescription').value,
        subjectCode: document.getElementById('subjectCode').value,
        progress: document.getElementById('progress').value,
    };

    if (editIndex === -1) {
        // Add new data
        data.push(formData);
    } else {
        // Update existing data
        data[editIndex] = formData;
        editIndex = -1;
    }

    document.getElementById('userForm').reset();
    renderTable();
    renderHomeDashboard();
    renderAdminDashboard();
});

// Initial Render
renderHomeDashboard();
renderAdminDashboard();
