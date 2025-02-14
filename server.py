from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)

# Initialize the database
def init_db():
    conn = sqlite3.connect('data_store.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS allocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            hospital TEXT,
            voteNumber TEXT,
            amount REAL,
            jobDescription TEXT,
            progress TEXT,
            user TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Insert a new record
def insert_data(data):
    conn = sqlite3.connect('data_store.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO allocations (date, hospital, voteNumber, amount, jobDescription, progress, user)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (data['date'], data['hospital'], data['voteNumber'], data['amount'], data['jobDescription'], data['progress'], data.get('user', '')))
    conn.commit()
    conn.close()

# Retrieve all records
def fetch_all_data():
    conn = sqlite3.connect('data_store.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM allocations')
    records = cursor.fetchall()
    conn.close()
    return [dict(id=row[0], date=row[1], hospital=row[2], voteNumber=row[3], amount=row[4], jobDescription=row[5], progress=row[6], user=row[7]) for row in records]

# Update a record
def update_data_in_db(record_id, data):
    conn = sqlite3.connect('data_store.db')
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE allocations
        SET date = ?, hospital = ?, voteNumber = ?, amount = ?, jobDescription = ?, progress = ?, user = ?
        WHERE id = ?
    ''', (data['date'], data['hospital'], data['voteNumber'], data['amount'], data['jobDescription'], data['progress'], data.get('user', ''), record_id))
    conn.commit()
    conn.close()

# Delete a record
def delete_data_from_db(record_id):
    conn = sqlite3.connect('data_store.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM allocations WHERE id = ?', (record_id,))
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin_dashboard():
    return render_template('admin.html')

@app.route('/user')
def user_dashboard():
    return render_template('user.html')

@app.route('/getData', methods=['GET'])
def get_data():
    return jsonify(fetch_all_data())

@app.route('/submitData', methods=['POST'])
def submit_data():
    data = request.get_json()
    if not all(key in data for key in ['date', 'hospital', 'voteNumber', 'amount', 'jobDescription', 'progress']):
        return jsonify({"message": "Invalid data!"}), 400
    insert_data(data)
    return jsonify({"message": "Data submitted successfully!"})

@app.route('/updateData/<int:id>', methods=['PUT'])
def update_data(id):
    data = request.get_json()
    update_data_in_db(id, data)
    return jsonify({"message": "Data updated successfully!"})

@app.route('/deleteData/<int:id>', methods=['DELETE'])
def delete_data(id):
    delete_data_from_db(id)
    return jsonify({"message": "Data deleted successfully!"})

@app.route('/userUpdatesSummary', methods=['GET'])
def user_updates_summary():
    records = fetch_all_data()
    return jsonify({"totalAllocations": len(records)})

@app.route('/topHospitals', methods=['GET'])
def top_hospitals():
    records = fetch_all_data()
    hospital_allocations = {}
    for record in records:
        hospital = record["hospital"]
        amount = float(record["amount"])
        hospital_allocations[hospital] = hospital_allocations.get(hospital, 0) + amount
    sorted_hospitals = sorted(hospital_allocations.items(), key=lambda x: x[1], reverse=True)
    top_10 = [{"name": hospital, "totalAllocation": total} for hospital, total in sorted_hospitals[:10]]
    return jsonify(top_10)

@app.route('/procurement')
def procurement():
    return render_template('procurement.html')

@app.route('/reports')
def reports():
    return render_template('reports.html')

@app.route('/getData/<int:id>', methods=['GET'])
def get_single_data(id):
    record = fetch_all_data()
    record = next((r for r in record if r['id'] == id), None)
    if record:
        return jsonify({"data": record})
    return jsonify({"message": "Record not found"}), 404

@app.route('/voteAllocations', methods=['GET'])
def vote_allocations():
    query = request.args.get('query', '').lower()
    records = fetch_all_data()

    # Filter data based on query
    vote_allocations = {}
    for record in records:
        if query in record["voteNumber"].lower() or query in record["hospital"].lower():
            vote = record["voteNumber"]
            amount = float(record["amount"])
            vote_allocations[vote] = vote_allocations.get(vote, 0) + amount

    result = [{"voteNumber": vote, "totalAllocation": total} for vote, total in vote_allocations.items()]
    return jsonify(result)

@app.route('/report/hospital', methods=['GET'])
def hospital_report():
    data = [
        {"Hospital": "Hospital A", "Allocations": 150},
        {"Hospital": "Hospital B", "Allocations": 120},
        {"Hospital": "Hospital C", "Allocations": 100},
    ]
    return jsonify(data)

# Route to serve the dashboard
@app.route('/')
def dashboard():
    return render_template('procurement.html')

# Fetch project data (dummy endpoint, if needed for external requests)
@app.route('/projects', methods=['GET'])
def get_projects():
    sample_projects = [
        {"id": 1, "name": "Project Alpha", "startDate": "2024-01-01", "status": "Estimate", "deadline": "2024-01-08"},
        {"id": 2, "name": "Project Beta", "startDate": "2024-02-01", "status": "Bid Document Evaluation", "deadline": "2024-02-22"}
    ]
    return jsonify(sample_projects)



if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)
