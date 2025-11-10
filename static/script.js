// Cash Flow Optimizer - script.js with Visualizations

class CashFlowUI {
    constructor() {
        this.form = document.getElementById('transactionForm');
        this.messageDiv = document.getElementById('message');
        this.transactionsList = document.getElementById('transactionsList');
        this.balancesList = document.getElementById('balancesList');
        this.minimizedList = document.getElementById('minimizedList');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.algorithmSteps = document.getElementById('algorithmSteps');
        this.creditorsSet = document.getElementById('creditorsSet');
        this.debtorsSet = document.getElementById('debtorsSet');
        
        this.canvas = document.getElementById('graphCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.initEventListeners();
        this.loadTransactions();
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    initEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.minimizeBtn.addEventListener('click', () => this.minimizeTransactions());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.loadTransactions();
        });
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
                this.drawGraph(data.transactions, data.balances);
                this.renderSetTheory(data.balances);
                this.minimizedList.innerHTML = '';
                this.algorithmSteps.innerHTML = '';
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
            this.drawGraph(data.transactions, data.balances);
            this.renderSetTheory(data.balances);
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
            await this.animateAlgorithm(data.minimized);
            this.renderMinimized(data.minimized, data.count, data.original_count);
        } catch (error) {
            this.showMessage('Error calculating settlements. Please try again.', 'error');
            console.error('Error:', error);
        } finally {
            this.minimizeBtn.disabled = false;
            this.minimizeBtn.textContent = 'Calculate Optimal Settlements';
        }
    }
    
    async animateAlgorithm(settlements) {
        this.algorithmSteps.innerHTML = '';
        
        // Step 1: Initialize heaps
        await this.addAlgorithmStep(
            1,
            'Initialize Priority Queues (Heaps)',
            'Create max-heap for creditors and min-heap for debtors',
            'MaxHeap(C) ← creditors, MinHeap(D) ← debtors',
            false
        );
        
        await this.sleep(800);
        
        // Step 2: Show greedy matching
        for (let i = 0; i < settlements.length; i++) {
            const s = settlements[i];
            await this.addAlgorithmStep(
                i + 2,
                `Match ${i + 1}: Greedy Selection`,
                `Extract max creditor (${s.creditor}) and max debtor (${s.debtor})`,
                `settlement = min(debt(${s.debtor}), credit(${s.creditor})) = $${s.amount}`,
                false
            );
            await this.sleep(600);
        }
        
        // Mark all as completed
        await this.sleep(500);
        const steps = document.querySelectorAll('.step-item');
        steps.forEach(step => step.classList.add('completed'));
    }
    
    addAlgorithmStep(number, title, content, formula, completed) {
        return new Promise((resolve) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = `step-item${completed ? ' completed' : ''}`;
            stepDiv.innerHTML = `
                <div class="step-header">
                    <div class="step-number">${number}</div>
                    <div class="step-title">${title}</div>
                </div>
                <div class="step-content">
                    <p>${content}</p>
                    <div class="step-formula">${formula}</div>
                </div>
            `;
            this.algorithmSteps.appendChild(stepDiv);
            setTimeout(resolve, 100);
        });
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    drawGraph(transactions, balances) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (transactions.length === 0) {
            ctx.fillStyle = '#718096';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Add transactions to see the graph', width / 2, height / 2);
            return;
        }
        
        // Get unique people
        const people = [...new Set([
            ...transactions.map(t => t.debtor),
            ...transactions.map(t => t.creditor)
        ])];
        
        // Calculate positions in a circle
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.35;
        
        const positions = {};
        people.forEach((person, i) => {
            const angle = (i * 2 * Math.PI) / people.length - Math.PI / 2;
            positions[person] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
        
        // Draw edges (transactions)
        transactions.forEach(t => {
            const from = positions[t.debtor];
            const to = positions[t.creditor];
            
            // Draw arrow
            this.drawArrow(ctx, from.x, from.y, to.x, to.y, '#f56565');
            
            // Draw amount label
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(midX - 25, midY - 12, 50, 24);
            ctx.fillStyle = '#e53e3e';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`$${t.amount}`, midX, midY);
        });
        
        // Draw nodes (people)
        Object.entries(positions).forEach(([person, pos]) => {
            const balance = balances[person] || 0;
            const color = balance > 0 ? '#48bb78' : balance < 0 ? '#f56565' : '#667eea';
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 30, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#2d3748';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(person, pos.x, pos.y);
        });
    }
    
    drawArrow(ctx, fromX, fromY, toX, toY, color) {
        const headlen = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        // Shorten the line to not overlap with circles
        const shortenDist = 35;
        fromX += shortenDist * Math.cos(angle);
        fromY += shortenDist * Math.sin(angle);
        toX -= shortenDist * Math.cos(angle);
        toY -= shortenDist * Math.sin(angle);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headlen * Math.cos(angle - Math.PI / 6),
            toY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - headlen * Math.cos(angle + Math.PI / 6),
            toY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
    
    renderSetTheory(balances) {
        const creditors = [];
        const debtors = [];
        
        Object.entries(balances).forEach(([person, balance]) => {
            if (balance > 0.01) {
                creditors.push({ person, balance });
            } else if (balance < -0.01) {
                debtors.push({ person, balance: Math.abs(balance) });
            }
        });
        
        // Render creditors set
        if (creditors.length === 0) {
            this.creditorsSet.innerHTML = '<p class="empty-state">No creditors yet</p>';
        } else {
            this.creditorsSet.innerHTML = creditors.map(c => `
                <div class="set-member">
                    <span class="member-name">${this.escapeHtml(c.person)}</span>
                    <span class="member-value" style="color: #48bb78;">+$${c.balance.toFixed(2)}</span>
                </div>
            `).join('');
        }
        
        // Render debtors set
        if (debtors.length === 0) {
            this.debtorsSet.innerHTML = '<p class="empty-state">No debtors yet</p>';
        } else {
            this.debtorsSet.innerHTML = debtors.map(d => `
                <div class="set-member">
                    <span class="member-name">${this.escapeHtml(d.person)}</span>
                    <span class="member-value" style="color: #f56565;">-$${d.balance.toFixed(2)}</span>
                </div>
            `).join('');
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
                this.algorithmSteps.innerHTML = '';
                this.creditorsSet.innerHTML = '<p class="empty-state">No creditors yet</p>';
                this.debtorsSet.innerHTML = '<p class="empty-state">No debtors yet</p>';
                
                const ctx = this.ctx;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.fillStyle = '#718096';
                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Add transactions to see the graph', this.canvas.width / 2, this.canvas.height / 2);
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
                <div class="amount">$${parseFloat(t.amount).toFixed(2)}</div>
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
                ? `Gets $${absBalance.toFixed(2)}` 
                : `Owes $${absBalance.toFixed(2)}`;
            
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
                <p style="margin-top: 8px; font-size: 0.9rem;">Using Greedy Algorithm with O(n log n) complexity</p>
            </div>
        `;
        
        const settlementsHtml = settlements.map((s, index) => `
            <div class="settlement-item">
                <div class="settlement-header">
                    <div class="settlement-number">${index + 1}</div>
                    <div class="settlement-amount">$${parseFloat(s.amount).toFixed(2)}</div>
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

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CashFlowUI();
});