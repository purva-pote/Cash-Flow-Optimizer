# 💰 Cash Flow Optimizer

A sophisticated Python web application that minimizes debt settlements between multiple parties using graph-based algorithms and data structures.

## 🎯 Features

- **Add Transactions**: Record who owes money to whom
- **View Balances**: See net balances for all participants
- **Optimize Settlements**: Calculate minimum number of payments needed
- **Graph Visualization**: Interactive directed weighted graph showing debt relationships
- **Algorithm Animation**: Step-by-step visualization of the greedy matching algorithm
- **Set Theory Display**: Visual representation of creditor and debtor set partitioning
- **Mathematical Process**: Detailed explanation of discrete mathematics concepts used
- **Responsive UI**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Instant calculation and visualization
- **Smart Algorithm**: Uses heap-based greedy algorithm for O(n log n) complexity

## 📁 Project Structure

```
cashflow-optimizer/
│
├── app.py                      # Main Flask application with algorithms
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── templates/
│   └── index.html             # Main HTML template
│
└── static/
    ├── style.css              # Responsive CSS styles
    └── script.js              # Frontend JavaScript logic
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Step-by-Step Setup

1. **Create Project Directory**
   ```bash
   mkdir cashflow-optimizer
   cd cashflow-optimizer
   ```

2. **Create Folder Structure**
   ```bash
   # On Windows
   mkdir templates static
   
   # On Linux/Mac
   mkdir -p templates static
   ```

3. **Create All Required Files**

   Create the following files with their respective content:
   
   - `app.py` - Main application file
   - `requirements.txt` - Dependencies
   - `templates/index.html` - HTML template
   - `static/style.css` - CSS styles
   - `static/script.js` - JavaScript code

4. **Set Up Virtual Environment (Recommended)**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate it
   # On Windows:
   venv\Scripts\activate
   
   # On Linux/Mac:
   source venv/bin/activate
   ```

5. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Run the Application**
   ```bash
   python app.py
   ```

7. **Access the Application**
   Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## 🎮 How to Use

### Adding Transactions

1. Enter the name of the person who owes money (Debtor)
2. Enter the name of the person who should receive money (Creditor)
3. Enter the amount
4. Click "Add Transaction"
5. Watch the **Transaction Graph** update in real-time

**Example:**
- Alice owes Bob $50
- Bob owes Charlie $30
- Charlie owes Alice $20

### Understanding the Visualizations

**Transaction Graph (Directed Weighted Graph)**
- Each person is a **vertex** (circle)
- Each debt is a **directed edge** (arrow)
- Edge weights represent the amount owed
- Green nodes = net creditors
- Red nodes = net debtors
- Blue nodes = balanced

**Set Theory Visualization**
- **Creditors Set (C)**: People who should receive money (balance > 0)
- **Debtors Set (D)**: People who owe money (balance < 0)
- Shows the partition: C ∩ D = ∅ and C ∪ D = V

### Viewing Balances

The "Net Balances" section shows:
- **Green values**: Amount to receive (positive balance)
- **Red values**: Amount to pay (negative balance)
- Formula: balance(v) = Σ(incoming) - Σ(outgoing)

### Calculating Optimal Settlements

1. Add all your transactions
2. Click "Calculate Optimal Settlements"
3. Watch the **Algorithm Visualization** animate each step
4. View the minimized list of payments needed

The visualization shows:
- Heap initialization
- Greedy matching process
- Each settlement step with mathematical formulas
- Final optimized payment list

## 🧮 Algorithm Explanation

### Discrete Mathematics Concepts

**1. Graph Theory**
- Models debt relationships as a **directed weighted graph** G = (V, E)
- V = set of all people (vertices)
- E = set of debt edges where e = (u, v, w) means u owes v amount w
- Reduces multi-edge graph to simple graph through edge weight summation

**2. Set Theory**
- Partitions vertex set V into two disjoint sets:
  - **C (Creditors)**: C = {v ∈ V | balance(v) > 0}
  - **D (Debtors)**: D = {v ∈ V | balance(v) < 0}
- Properties: C ∩ D = ∅, C ∪ D = V
- Conservation law: Σ(balance ∈ C) = -Σ(balance ∈ D)

**3. Optimization Problem**
- **Goal**: Minimize |E'| where E' is the set of settlement edges
- **Constraint**: Must preserve all net balances
- **Approach**: Greedy algorithm with priority queues

### Data Structures Used

1. **DefaultDict (Hash Map)**
   - Stores net balances for each person
   - O(1) lookup and update time

2. **Min/Max Heaps**
   - Efficiently finds largest debtor and creditor
   - O(log n) insertion and extraction

3. **List (Dynamic Array)**
   - Stores all transactions
   - Maintains history of settlements

### Algorithm Steps

1. **Calculate Net Balances**
   - For each transaction, update debtor (subtract) and creditor (add)
   - Time Complexity: O(n)

2. **Create Heaps**
   - Separate people into debtors (owe money) and creditors (receive money)
   - Time Complexity: O(n log n)

3. **Greedy Settlement**
   - Match largest debtor with largest creditor
   - Settle maximum possible amount
   - Re-add remaining balances to heaps
   - Time Complexity: O(n log n)

**Overall Time Complexity**: O(n log n)
**Space Complexity**: O(n)

## 🛠️ Technical Stack

- **Backend**: Flask (Python)
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Custom CSS with responsive design
- **Data Structures**: 
  - Heaps (priority queues)
  - Hash maps (dictionaries)
  - Lists

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (< 768px)

## 🔧 Configuration

### Change Port
Edit `app.py` line:
```python
app.run(debug=True, host='0.0.0.0', port=5000)  # Change port here
```

### Enable/Disable Debug Mode
```python
app.run(debug=False)  # Set to False for production
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```
   Error: Address already in use
   ```
   **Solution**: Change the port in `app.py` or kill the process using port 5000

2. **Module Not Found**
   ```
   ModuleNotFoundError: No module named 'flask'
   ```
   **Solution**: Install requirements: `pip install -r requirements.txt`

3. **Template Not Found**
   ```
   TemplateNotFound: index.html
   ```
   **Solution**: Ensure `templates/` folder exists with `index.html` inside

4. **Static Files Not Loading**
   **Solution**: Ensure `static/` folder contains `style.css` and `script.js`

## 📈 Example Scenarios

### Scenario 1: Trip Expenses
```
Alice paid $100 for hotel (Bob and Charlie split)
Bob paid $60 for food (Alice and Charlie split)
Charlie paid $30 for gas (Alice and Bob split)

Result: 2-3 optimized payments instead of 6 transactions
```

### Scenario 2: Roommate Bills
```
John owes Sarah $200 (rent)
Sarah owes Mike $150 (utilities)
Mike owes John $100 (groceries)

Result: 1-2 optimized payments instead of 3 transactions
```

## 🔒 Security Notes

- This is a demo application without authentication
- Data is stored in memory (resets on restart)
- For production use, add:
  - User authentication
  - Database persistence
  - Input sanitization
  - HTTPS/SSL
  - Rate limiting

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Development

### Adding New Features

1. **Persistence**: Add SQLite or PostgreSQL database
2. **User Accounts**: Implement authentication system
3. **Groups**: Allow multiple debt groups
4. **History**: Track settlement history
5. **Export**: Generate PDF reports
6. **Advanced Visualization**: Add D3.js for more interactive graphs
7. **Matrix Representation**: Show adjacency matrix view
8. **Path Analysis**: Display shortest debt chains

### Code Structure

- **app.py**: Contains `CashFlowOptimizer` class and Flask routes
- **index.html**: Single-page application template
- **style.css**: Modern, responsive styling
- **script.js**: `CashFlowUI` class handles all frontend logic

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 📧 Support

For issues or questions, refer to:
- Flask documentation: https://flask.palletsprojects.com/
- Python heapq: https://docs.python.org/3/library/heapq.html

---

**Happy Optimizing! 💰✨**