"""
Cashflow Optimizer - app.py
A web application to minimize debt settlements between multiple parties
"""

from flask import Flask, render_template, request, jsonify
from collections import defaultdict
import heapq

app = Flask(__name__)

class CashFlowOptimizer:
    """
    Data structure to manage and optimize cash flows between people.
    Uses graph-based approach with min-heap for efficient debt settlement.
    """
    
    def __init__(self):
        self.transactions = []  # List of all transactions
        self.balances = defaultdict(float)  # Net balance for each person
    
    def add_transaction(self, debtor, creditor, amount):
        """Add a new transaction: debtor owes creditor the specified amount"""
        if amount <= 0:
            return False, "Amount must be positive"
        
        transaction = {
            'debtor': debtor.strip(),
            'creditor': creditor.strip(),
            'amount': float(amount)
        }
        
        self.transactions.append(transaction)
        self.balances[transaction['debtor']] -= amount
        self.balances[transaction['creditor']] += amount
        
        return True, "Transaction added successfully"
    
    def get_all_transactions(self):
        """Return all transactions"""
        return self.transactions
    
    def get_balances(self):
        """Return current balances for all people"""
        return dict(self.balances)
    
    def minimize_transactions(self):
        """
        Calculate minimum number of transactions to settle all debts.
        Uses greedy algorithm with heaps for O(n log n) complexity.
        """
        # Create lists of debtors and creditors
        debtors = []  # Min heap (negative values for max heap behavior)
        creditors = []  # Max heap (negative values)
        
        for person, balance in self.balances.items():
            if balance < -0.01:  # Owes money (small epsilon for float comparison)
                heapq.heappush(debtors, (balance, person))
            elif balance > 0.01:  # Is owed money
                heapq.heappush(creditors, (-balance, person))
        
        minimized = []
        
        while debtors and creditors:
            # Get person who owes most and person who is owed most
            debt_amount, debtor = heapq.heappop(debtors)
            credit_amount, creditor = heapq.heappop(creditors)
            
            debt_amount = abs(debt_amount)
            credit_amount = abs(credit_amount)
            
            # Settle as much as possible
            settlement = min(debt_amount, credit_amount)
            
            minimized.append({
                'debtor': debtor,
                'creditor': creditor,
                'amount': round(settlement, 2)
            })
            
            # If debtor still owes money, add back to heap
            remaining_debt = debt_amount - settlement
            if remaining_debt > 0.01:
                heapq.heappush(debtors, (-remaining_debt, debtor))
            
            # If creditor is still owed money, add back to heap
            remaining_credit = credit_amount - settlement
            if remaining_credit > 0.01:
                heapq.heappush(creditors, (-remaining_credit, creditor))
        
        return minimized
    
    def clear_all(self):
        """Clear all transactions and balances"""
        self.transactions.clear()
        self.balances.clear()

# Global optimizer instance
optimizer = CashFlowOptimizer()

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/transaction', methods=['POST'])
def add_transaction():
    """API endpoint to add a new transaction"""
    data = request.json
    debtor = data.get('debtor', '').strip()
    creditor = data.get('creditor', '').strip()
    amount = data.get('amount', 0)
    
    if not debtor or not creditor:
        return jsonify({'success': False, 'message': 'Names cannot be empty'}), 400
    
    if debtor.lower() == creditor.lower():
        return jsonify({'success': False, 'message': 'Debtor and creditor cannot be the same'}), 400
    
    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid amount'}), 400
    
    success, message = optimizer.add_transaction(debtor, creditor, amount)
    
    return jsonify({
        'success': success,
        'message': message,
        'transactions': optimizer.get_all_transactions(),
        'balances': optimizer.get_balances()
    })

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """API endpoint to get all transactions"""
    return jsonify({
        'transactions': optimizer.get_all_transactions(),
        'balances': optimizer.get_balances()
    })

@app.route('/api/minimize', methods=['GET'])
def minimize():
    """API endpoint to get minimized transactions"""
    minimized = optimizer.minimize_transactions()
    return jsonify({
        'minimized': minimized,
        'count': len(minimized),
        'original_count': len(optimizer.get_all_transactions())
    })

@app.route('/api/clear', methods=['POST'])
def clear_all():
    """API endpoint to clear all data"""
    optimizer.clear_all()
    return jsonify({'success': True, 'message': 'All data cleared'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)