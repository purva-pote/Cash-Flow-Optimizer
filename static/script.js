class CashFlowUI {
    constructor() {
        this.form = document.getElementById('transactionForm');
        this.messageDiv = document.getElementById('message');
        this.transactionsList = document.getElementById('transactionsList');
        this.balancesList = document.getElementById('balancesList');
        this.minimizedList = document.getElementById('minimizedList');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.initEventListeners();
        this.loadTransactions();
    }
    initEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.minimizeBtn.addEventListener('click', () => this.minimizeTransactions());
        this.clearBtn.addEventListener('click', () => this.clearAll());
    }
    async handleSubmit(e) {
        e.preventDefault();
        const debtor = document.getElementById('debtor').value;
        const creditor = document.getElementById('creditor').value;
        const amount = document.getElementById('amount').value;
        try {
            const response = await fetch('/api/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ debtor, creditor, amount })
            });
            const data = await response.json();
            if (data.success) {
                this.showMessage('Transaction added successfully!', 'success');
                this.form.reset();
                this.renderTransactions(data.transactions);
                this.renderBalances(data.balances);
                this.minimizedList.innerHTML = '';
            } else {
                this.showMessage(data.message, 'error');
            }
        } catch (error) {
            this.showMessage('Error adding transaction. Please try again.', 'error');
            console.error('Error:', error);
        }
    }
    async loadTransactions() {
        try {
            const response = await fetch('/api/transactions');
            const data = await response.json();
            this.renderTransactions(data.transactions);
            this.renderBalances(data.balances);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }
    async minimizeTransactions() {
        this.minimizeBtn.disabled = true;
        this.minimizeBtn.textContent = 'Calculating...';
        try {
            const response = await fetch('/api/minimize');
            const data = await response.json();
            this.renderMinimized(data.minimized, data.count, data.original_count);
        } catch (error) {
            this.showMessage('Error calculating settlements. Please try again.', 'error');
            console.error('Error:', error);
        } finally {
            this.minimizeBtn.disabled = false;
            this.minimizeBtn.textContent = 'Calculate Optimal Settlements';
        }
    }
    async clearAll() {
        if (!confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
            return;
        }
        try {
            const response = await fetch('/api/clear', {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
                this.showMessage('All data cleared successfully!', 'success');
                this.transactionsList.innerHTML = '<p class="empty-state">No transactions yet. Add one above!</p>';
                this.balancesList.innerHTML = '<p class="empty-state">No balances to show</p>';
                this.minimizedList.innerHTML = '';
            }
        } catch (error) {
            this.showMessage('Error clearing data. Please try again.', 'error');
            console.error('Error:', error);
        }
    }
    renderTransactions(transactions) {
        if (transactions.length === 0) {
            this.transactionsList.innerHTML = '<p class="empty-state">No transactions yet. Add one above!</p>';
            return;
        }
        const html = transactions.map((t, index) => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div><strong>${this.escapeHtml(t.debtor)}</strong> owes <strong>${this.escapeHtml(t.creditor)}</strong></div>
                    <div class="transaction-arrow">→</div>
                </div>
                <div class="amount">₹${parseFloat(t.amount).toFixed(2)}</div>
            </div>
        `).join('');
        this.transactionsList.innerHTML = html;
    }
    renderBalances(balances) {
        const entries = Object.entries(balances);
        if (entries.length === 0) {
            this.balancesList.innerHTML = '<p class="empty-state">No balances to show</p>';
            return;
        }
        entries.sort((a, b) => b[1] - a[1]);
        const html = entries.map(([person, balance]) => {
            const absBalance = Math.abs(balance);
            const balanceClass = balance >= 0 ? 'positive' : 'negative';
            const balanceText = balance >= 0 
                ? `Gets ₹${absBalance.toFixed(2)}` 
                : `Owes ₹${absBalance.toFixed(2)}`;
            return `
                <div class="balance-item">
                    <div class="balance-name">${this.escapeHtml(person)}</div>
                    <div class="balance-amount ${balanceClass}">${balanceText}</div>
                </div>
            `;
        }).join('');
        this.balancesList.innerHTML = html;
    }
    renderMinimized(settlements, count, originalCount) {
        if (settlements.length === 0) {
            this.minimizedList.innerHTML = '<p class="empty-state">No settlements needed. All balances are zero!</p>';
            return;
        }
        const savings = originalCount - count;
        const savingsPercent = ((savings / originalCount) * 100).toFixed(0);
        const statsHtml = `
            <div class="stats-banner">
                <h3>🎉 Optimized to ${count} payment${count !== 1 ? 's' : ''}!</h3>
                <p>Reduced from ${originalCount} transactions (${savingsPercent}% fewer payments)</p>
            </div>
        `;
        const settlementsHtml = settlements.map((s, index) => `
            <div class="settlement-item">
                <div class="settlement-header">
                    <div class="settlement-number">${index + 1}</div>
                    <div class="settlement-amount">₹${parseFloat(s.amount).toFixed(2)}</div>
                </div>
                <div class="settlement-flow">
                    <strong>${this.escapeHtml(s.debtor)}</strong> pays <strong>${this.escapeHtml(s.creditor)}</strong>
                </div>
            </div>
        `).join('');
        this.minimizedList.innerHTML = statsHtml + settlementsHtml;
    }
    showMessage(text, type) {
        this.messageDiv.textContent = text;
        this.messageDiv.className = `message ${type}`;
        this.messageDiv.style.display = 'block';
        setTimeout(() => {
            this.messageDiv.style.display = 'none';
        }, 5000);
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new CashFlowUI();
});
