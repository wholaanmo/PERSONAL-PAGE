<template>
  <navigation/>
  <div class="main-layout">
    <div class="top-row"> 
  <div class="budget-container">
    <div class="budget-content">
      <div v-if="budgetSuccessMessage" class="budget-success-message" :class="{ hide: budgetHideMessage }">{{ budgetSuccessMessage }}</div>
      <div class="budget-header"> <!--NEWWWWWWWWWW-->
      <h3>Monthly Budget</h3>
      <button v-if="!hasExistingBudget" @click="showAddBudgetForm" class="add-budget-btn">Add Budget</button>
      <button @click="showEditBudgetForm" class="edit-budget-btn">Edit Budget</button>
    </div>

      <div v-if="!isAddingBudget && !isEditingBudget" class="budget-display">
            <div class="budget-info">
              <div class="budget-month-row"> <!--NEWWWWWWWWWWW-->
                <span class="budget-label">Month-Year:</span>
              <span class="budget-month">{{ formatMonthYear(selectedMonthYear) }}</span>
              </div>
              <div class="budget-amount-row">
                <span class="budget-label">Budget Amount:</span>
              <span class="budget-amount">{{ formatPHP(currentBudgetAmount) }}</span>
            </div>
        </div>
        </div>

        <!--FOR ADDING BUDGET-->
        <div v-if="isAddingBudget" class="budget-form">
        <div class="form-group">
          <label for="monthYear">Month-Year:</label>
          <select id="monthYear" v-model="selectedMonthYear">
            <option v-for="month in availableMonths" :key="month" :value="month">{{ formatMonthYear(month) }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="budgetAmount">Budget Amount (₱):</label>
          <input type="number" id="budgetAmount" v-model="budgetAmount" placeholder="Enter budget amount" step="0.01" min="0">
        </div>

        <div class="budget-form-buttons"> <!--NEWWWWWWWW-->
          <button class="budget-btn cancel-btn" @click="cancelBudgetForm">Cancel </button>
            <button class="budget-btn" @click="addBudget">Set Budget</button>
      
          </div>
    </div>

            <!-- FOR EDITING BUDGET -->
            <div v-if="isEditingBudget" class="budget-form">
          <div class="form-group">
            <label for="editMonthYear">Month-Year:</label>
            <select id="editMonthYear" v-model="selectedMonthYear">
            <option v-for="month in availableMonths" :key="month" :value="month">{{ formatMonthYear(month) }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editBudgetAmount">Budget Amount (₱):</label>
            <input type="number" id="editBudgetAmount" v-model="budgetAmount" placeholder="Enter budget amount" step="0.01" min="0" >
          </div>
          <div class="budget-form-buttons">
            <button class="budget-btn cancel-btn" @click="cancelBudgetForm">Cancel</button>
            <button class="budget-btn" @click="updateBudget">Update Budget</button>
          </div>
        </div>
</div>
</div>


  <!--ADDING EXPENSESSSS-->
    <div class="content-wrapper">
      <form @submit.prevent="handleSubmit" class="expense-form"> <!-- CLASS IS NEWWWWWWWWWWW-->
         <input type="hidden" v-model="action" />
         <input type="hidden" v-if="editId" v-model="editId" />


         <div class="form-group">
           <label>EXPENSE TYPE:</label>
           <select v-model="expenseType" required @change="checkExpenseType">
             <option value="Food">Food</option>
             <option value="Bill">Bill</option>
             <option value="Transportation">Transportation</option>
             <option value="Entertainment">Entertainment</option>
             <option value="Healthcare">Healthcare</option>
             <option value="Personalcare">Personal care</option>
             <option value="Shopping">Shopping</option> 
             <option value="Other">Other</option>
            </select>
         </div>
 
         <div v-if="expenseType === 'Other'" class="form-group">
           <label>Custom Expense Type:</label>
           <input type="text" v-model="customExpenseType" placeholder="Enter custom expense type" />
         </div>
 
         <div class="form-group">
           <label>ITEM NAME:</label>
           <input type="text" v-model="itemName" placeholder="Enter item name" required />
         </div>
 
         <div class="form-group">
           <label>ITEM PRICE:</label>
           <input type="number" v-model.number="itemPrice" placeholder="Enter item price" required step="0.01" />
         </div>
 
         <button class="btn" type="submit">{{ editId ? 'Save Changes' : 'Add Expense' }}</button>
         <div v-if="expenseSuccessMessage" class="expense-success-message" :class="{ hide: expenseHideMessage }">{{ expenseSuccessMessage }}</div>
      </form>

      </div>
      </div>

      <!--YOUR LIST OF EXPENSES-->
      <div class="expenses-container">
      <div class="expenses-section"> 
        <h3>Your Expenses</h3> 
         <div class="expenses-table"> 
          <table>
            <thead>
              <tr>
                <th>Expense Type</th>
                <th>Item Name</th>
                <th>Item Price</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in expenses" :key="expense.id">
                <td>{{ expense.expense_type }}</td>
                <td>{{ expense.item_name }}</td>
                <td>₱{{ expense.item_price.toFixed(2) }}</td>
                <td>{{ formatDate(expense.expense_date) }}</td>
                  <td class="actions">
                  <button @click="editExpense(expense)" class="edit-btn">Edit</button>
                  <button @click="deleteExpense(expense.id)" class="delete-btn">Delete</button>
                </td>
                </tr>
            </tbody>
          </table>
        </div>
       </div>
       
     <div class="total">
      Total: <strong>₱{{ totalAmount.toFixed(2) }}</strong> (≈ {{ formatUsd(convertPhpToUsd(totalAmount)) }} USD)
     </div>
    </div>
  </div>
 </template>
 
 <script>
 import Navigation from "./navigation.vue";
 import axios from 'axios';
 
 export default {
   components: { Navigation },
   data() {
     return {
       expenseType: '',
       customExpenseType: '',
       itemName: '',
       itemPrice: '',
       successMessage: '',
       editId: null,
       expenses: [],
       personalBudgetId: null,
       action: 'add',
       hideMessage: false,
       successTimeout: null,
       usdExchangeRate: 56.50,
       selectedMonthYear: '',
       budgetAmount: '',
       budgetEditId: null,
       personalBudgets: [], 
       isAddingBudget: false,
       isEditingBudget: false,
       messageContext: '',
       budgetSuccessMessage: '',
       budgetHideMessage: false,
       budgetSuccessTimeout: null,
       expenseSuccessMessage: '',
       expenseHideMessage: false,
       expenseSuccessTimeout: null,
     };
   },
   computed: {
    totalAmount() {
      return this.expenses?.reduce((sum, expense) => 
        sum + this.parseCurrency(expense.item_price), 0) || 0;
    },
    totalInUsd() {
      return (this.totalAmount / this.usdExchangeRate).toFixed(2);
    },

    currentMonthYear() {  
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },
    availableMonths() {  
      const months = [];
      const date = new Date();
      for (let i = 0; i < 12; i++) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        months.push(`${year}-${month}`);
        date.setMonth(date.getMonth() + 1);
      }
      return months;
    },

    currentBudgetAmount() {
      const budget = this.personalBudgets.find(
        b => b.month_year === (this.selectedMonthYear || this.currentMonthYear)
      );
      return budget ? budget.budget_amount : 0;
    },
    hasExistingBudget() {
      return this.personalBudgets.some(
        b => b.month_year === (this.selectedMonthYear || this.currentMonthYear)
      );
    }
  },

  async mounted() {
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      this.usdExchangeRate = response.data.rates.PHP;
      await this.fetchExpenses();
      await this.fetchPersonalBudgets();
    } catch (error) {
      console.error("Initialization error:", error);
      await this.fetchExpenses().catch(e => console.error("Expense fetch failed:", e));
    }
    this.selectedMonthYear = this.currentMonthYear;
  },

  methods: {
    parseCurrency(value) {
      if (!value) return 0;
      const numericValue = String(value).replace(/[^\d.]/g, '');
      return parseFloat(numericValue) || 0;
    },
    convertPhpToUsd(phpAmount) {
      return this.parseCurrency(phpAmount) / this.usdExchangeRate; // Use dynamic rate
    },
    formatUsd(value) {
      return '$' + parseFloat(value).toFixed(2);
    },
    formatPHP(value) {
      const amount = this.parseCurrency(value);
      return '₱' + amount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    //FOR BUDGET
    formatMonthYear(monthYear) {  // Added this method
      const [year, month] = monthYear.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    },
    async fetchPersonalBudgets() {  // Added this method
      try {
        const response = await axios.get('/api/personal-budgets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
        });
        this.personalBudgets = response.data?.data || [];
      } catch (error) {
        console.error("Error fetching budgets:", error);
      }
    },

    showAddBudgetForm() {
    this.isAddingBudget = true;
    this.isEditingBudget = false;
    this.selectedMonthYear = this.currentMonthYear;
    this.budgetAmount = '';
  },

    showEditBudgetForm() {
    this.isEditingBudget = true;
    this.isAddingBudget = false;
    const budget = this.personalBudgets.find(
    b => b.month_year === (this.selectedMonthYear || this.currentMonthYear)
  );
  if (budget) {
    this.budgetAmount = budget.budget_amount;
  }
},

  cancelBudgetForm() {
    this.isAddingBudget = false;
    this.isEditingBudget = false;
    this.budgetAmount = '';
  },

  async addBudget() {
    try {
      const response = await axios.post('/api/personal-budgets', {
        month_year: this.selectedMonthYear,
        budget_amount: this.budgetAmount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
      });

      if (response.data.success === 1) {
        this.showBudgetSuccessMessage('Budget added successfully!', 'budget'); //NEWWWWWWW
        await this.fetchPersonalBudgets();
        this.isAddingBudget = false;
        this.budgetAmount = '';
      } else {
        this.showBudgetSuccessMessage(response.data.message || 'Failed to add budget', 'budget');
      }
    } catch (error) {
      console.error('Error adding budget:', error);
      this.showBudgetSuccessMessage(error.response?.data?.message || 'Failed to add budget', 'budget');
    }
  },

  async updateBudget() {
  try {
    const currentBudget = this.personalBudgets.find(
      b => b.month_year === (this.selectedMonthYear || this.currentMonthYear)
    );
    
    if (!currentBudget) {
      this.showBudgetSuccessMessage('No budget found to update', 'budget');
      return;
    }

    const response = await axios.put('/api/personal-budgets', {
      original_month_year: currentBudget.month_year, 
      month_year: this.selectedMonthYear, 
      budget_amount: this.budgetAmount
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
    });

    if (response.data.success === 1) {
      this.showBudgetSuccessMessage('Budget updated successfully!', 'budget');
      await this.fetchPersonalBudgets();
      this.isEditingBudget = false;
      this.budgetAmount = '';
    } else {
      this.showBudgetSuccessMessage(response.data.message || 'Failed to update budget', 'budget');
    }
  } catch (error) {
    console.error('Error updating budget:', error);
    this.showBudgetSuccessMessage(error.response?.data?.message || 'Failed to update budget', 'budget');
  }
},

    async handleBudgetSubmit() {  
      try {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
        };
        
        const budgetData = {
          month_year: this.selectedMonthYear || this.currentMonthYear,
          budget_amount: this.budgetAmount
        };
        
        const url = this.budgetEditId 
          ? `/api/personal-budgets/${this.budgetEditId}`
          : '/api/personal-budgets';
          
        const method = this.budgetEditId ? 'put' : 'post';
        
        const response = await axios[method](url, budgetData, config);
        
        this.showBudgetSuccessMessage(
          response.data.success === 1 
            ? this.budgetEditId 
              ? 'Budget updated successfully!' 
              : 'Budget set successfully!'
            : response.data.message || 'Budget operation failed'
        );
        
        this.fetchPersonalBudgets();
        this.budgetAmount = '';
        this.budgetEditId = null;
        this.isEditingBudget = false;
      } catch (error) {
        console.error("Budget error:", error);
        this.showBudgetSuccessMessage('Failed to process budget. Please try again.');
      }
    },


    editBudget(budget) {  
      this.budgetEditId = budget.id;
      this.selectedMonthYear = budget.month_year;
      this.budgetAmount = budget.budget_amount;
      this.isEditingBudget = true;
    },

    toggleEditBudget() {
      this.isEditingBudget = !this.isEditingBudget;
      if (this.isEditingBudget) {
        const budget = this.personalBudgets.find(
          b => b.month_year === (this.selectedMonthYear || this.currentMonthYear)
        );
        if (budget) {
          this.budgetEditId = budget.id;
          this.budgetAmount = budget.budget_amount;
        }
      } else {
        this.budgetEditId = null;
        this.budgetAmount = '';
      }
    },

    getBudgetForExpense(expense) {  // Added this method
      if (!expense.personal_budget_id) return null;
      return this.personalBudgets.find(b => b.id === expense.personal_budget_id);
    },

    showBudgetSuccessMessage(message) {
    if (this.budgetSuccessTimeout) {
      clearTimeout(this.budgetSuccessTimeout);
    }
    
    this.budgetHideMessage = false;
    this.budgetSuccessMessage = message;
    
    this.budgetSuccessTimeout = setTimeout(() => {
      this.budgetHideMessage = true;
      setTimeout(() => {
        this.budgetSuccessMessage = '';
      }, 500);
    }, 2500);
  },
  
  showExpenseSuccessMessage(message) {
    if (this.expenseSuccessTimeout) {
      clearTimeout(this.expenseSuccessTimeout);
    }
    
    this.expenseHideMessage = false;
    this.expenseSuccessMessage = message;
    
    this.expenseSuccessTimeout = setTimeout(() => {
      this.expenseHideMessage = true;
      setTimeout(() => {
        this.expenseSuccessMessage = '';
      }, 500);
    }, 2500);
  },

  //FOR EXPENSES
     fetchExpenses() {
       axios.get('/api/expenses', {
         headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
       })
       .then(response => {
        console.log('API Response:', response.data);
        this.expenses = response.data?.data || []; // NEWWWWWWWWWWWWWWWWWW
       })
       .catch(error => {
        console.error("Error fetching expenses:", error);
        this.expenses = []; // Reset to empty array on error
        this.showExpenseSuccessMessage('Failed to load expenses. Please try again.');
        });
    },

    getCurrentBudgetId() {
    const budget = this.personalBudgets.find(
    b => b.month_year === (this.selectedMonthYear || this.currentMonthYear)
    );
    return budget ? budget.id : null;
    },
     handleSubmit() {
      const currentBudget = this.personalBudgets.find(
    b => b.month_year === (this.selectedMonthYear || this.currentMonthYear)
    );
       const expenseData = {
         item_price: this.itemPrice,
         expense_type: this.expenseType === 'Other' ? this.customExpenseType : this.expenseType,
         item_name: this.itemName,
         personal_budget_id: this.getCurrentBudgetId() //NEWWWWWWWWWWWWW
       };
       const config = {
         headers: {
           Authorization: `Bearer ${localStorage.getItem('jsontoken')}`
         }
       };
       
       if (this.editId) {
         // Edit existing expense
         axios.put(`/api/expenses/${this.editId}`, expenseData, config)
         .then(() => {
           this.showExpenseSuccessMessage('Expense updated successfully!');
           this.fetchExpenses();
           this.resetForm();
         })
         .catch(error => {
           console.error("Error updating expense:", error);
           this.showExpenseSuccessMessage('Failed to update expense.'); 
         });
       } else {

         // Add new expense
         axios.post('/api/expenses', expenseData, config)
      .then(response => {
        console.log('Full response:', response); 
        if (response.data.success === 1) {
          this.showExpenseSuccessMessage('Expense added successfully!');
          this.fetchExpenses();
          this.resetForm();
        } else {
          this.sshowExpenseSuccessMessage('Failed to add expense: ' + (response.data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error("Full error:", error.response); 
        this.showExpenseSuccessMessage('Failed to add expense: ' + 
          (error.response?.data?.message || error.message || 'Unknown error')); 
    });
  }
},

formatDate(dateString) {
  if (!dateString || dateString === 'N/A') return 'N/A';
  
  try {
    const options = { 
      day: 'numeric',   
      month: 'short',   
      year: 'numeric'    
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'N/A';
  }
}, // FOR TABLE 

     editExpense(expense) {
       this.editId = expense.id;
       this.expenseType = expense.expense_type;
       this.itemName = expense.item_name;
       this.itemPrice = expense.item_price;
     },
     deleteExpense(id) {
       if (confirm('Are you sure you want to delete this expense?')) {
         axios.delete(`/api/expenses/${id}`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
         })
         .then(() => {
           this.showExpenseSuccessMessage('Expense deleted successfully!');
           this.fetchExpenses();
         });
       }
     },
     resetForm() {
       this.expenseType = '';
       this.customExpenseType = '';
       this.itemName = '';
       this.itemPrice = '';
       this.editId = null;
     }
   },

   mounted() {
     this.fetchExpenses();
     this.fetchPersonalBudgets();
     this.selectedMonthYear = this.currentMonthYear;
   }
 };
 </script>

 
 
<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 20px;
  padding: 20px;
  box-sizing: border-box;
}

.top-row {
  display: flex;
  gap: 20px;
  width: 100%;
} 

/* Budget Container Styles */
.budget-container {
  margin-top: 100px;
  width: 30%;
  background-color: #4a7c59; 
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  height: auto;
  color: white;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.budget-header h3 {
  color: white;
  font-size: 1.5rem;
  margin: 0;
}

.budget-content {
  width: 100%;
}

.add-budget-btn, .edit-budget-btn {
  background: #2a4935;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.add-budget-btn:hover, .edit-budget-btn:hover {
  background: #1e3b2a;
  transform: translateY(-2px);
}

.budget-display {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.budget-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.budget-month-row, .budget-amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.budget-label {
  font-weight: 500;
  font-size: 1rem;
}
.budget-month, .budget-amount {
  font-weight: 600;
  font-size: 1.1rem;
}

.budget-amount {
  color: #ffea00; 
}

.budget-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
}

.budget-form .form-group {
  margin: 0;
}

.budget-form label {
  color: white;
  margin-bottom: 8px;
}

.budget-form input, .budget-form select {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
}

.budget-form-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.budget-btn {
  padding: 12px 0;
  background-color: #2a4935;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  flex: 1;
}

.budget-btn:hover {
  background-color: #1e3b2a;
  transform: translateY(-2px);
}

.cancel-btn {
  background-color: #6c757d;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.budget-success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
  transition: opacity 0.5s ease;
}

.expense-success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
  transition: opacity 0.5s ease;
} /* for expenses*/

.budget-success-message.hide,
.expense-success-message.hide {
  opacity: 0;
}


.uneditable-month {
  display: inline-block;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #ffea00;
  font-weight: bold;
}
 
 .content-wrapper {
  margin-top: 100px;
  width: 70%;
  background-color: #85cf9d;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  height: auto;
}

.expenses-container {
  max-width: 1300px; 
  margin: 0 auto;
  box-sizing: border-box;
  width: 100%;
  background-color: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
 

 .expense-form {
  width: 100%; 
}  
 

.expenses-section {
  margin-top: 10px; 
}

.expenses-section h3 {
  margin-top: 10px;
  margin-bottom: 25px; 
  color: #333;
  font-size: 1.5rem; 
  padding-bottom: 10px;
  border-bottom: 2px solid #eee; 
} 

.expenses-table {
  overflow-x: auto;
  margin: 30px 0; 
}  

table {
  width: 100%;
  border-collapse: separate; 
  border-spacing: 0 10px; 
  margin-bottom: 30px; 
}  

th, td {
  padding: 6px 20px; 
  text-align: center;
  border-bottom: 2px solid #ddd;
  color: #333;
} 

th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 1rem; 
  padding: 12px 20px; 
} 

tr {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
  margin-bottom: 15px; 
}

tr:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px); 
  box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
  transition: all 0.2s ease; 
} 

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
} 

.edit-btn, .delete-btn {
  padding: 8px 15px;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  color: white;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.edit-btn {
  background-color: #2196F3;
}


.delete-btn {
  background-color: #f44336;
}


.edit-btn:hover {
  background-color: #1976D2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.3);
  

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  &:hover::after {
    animation: ripple 0.6s ease-out;
  }
}

.delete-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
  

  animation: pulse 0.5s ease-in-out;
}


@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}


@keyframes pulse {
  0% {
    transform: translateY(-2px) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.05);
  }
  100% {
    transform: translateY(-2px) scale(1);
  }
}


.edit-btn:active, .delete-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.total {
     font-size: 20px;
     font-weight: bold;
     color: #333;
     padding: 20px;
     background-color: white;
     box-sizing: border-box;
     box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
     text-align: center;
     max-width: 181vh;
     width: 100%;
     position: relative; 
     bottom: 0;   
}

 
 .form-group {
     margin-bottom: 20px;
     margin-top: 20px;
 }
 
 label {
     display: block;
     margin-bottom: 5px;
     font-size: 17px;
     color: black;
 }
 
 input[type="text"],
 input[type="number"],
 select {
     width: 100%;
     max-width: 800px;
     padding: 10px;
     font-size: 16px;
     border-radius: 10px;
     border: 3px solid #ddd;
     border-color: black;
     box-sizing: border-box;
     min-height: 35px;
 }
 
 .btn {
     padding: 12px 50px;
     background-color: white;
     box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
     color: black;
     border: none;
     border-radius: 12px;
     cursor: pointer;
     font-size: 15px;
     transition: background-color 0.3s, color 0.3s; /* Smooth effect */
}

.btn:hover {
    background-color: rgb(26, 25, 25); /* Change to any color you want */
    color: white; /* Text color on hover */
}

.btn1 {
    padding: 12px 50px;
    background-color: white;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    color: black;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 15px;
    margin-top: 10px; /* Add vertical spacing instead */
    margin-left: 430px;
    transition: background-color 0.3s, color 0.3s;
}

.btn1:hover {
    background-color: rgb(26, 25, 25); /* Change to any color you want */
    color: white; /* Text color on hover */
}

/* RESPONSIVE DESIGN */

@media screen and (max-width: 1000px) {
    .container {
        margin: 20px 0px 0px 30px;
        padding: 15px;
        height: 500px;
    }

    .content-wrapper {
        padding: 0px;
    }

    .form-group {
        width: 100%;
        padding: 0 0 10 0px;
        margin: 20px 0;
    }

    input[type="text"],
    input[type="number"],
    select {
        width: 100%;
        max-width: 500px;
        font-size: 15px;
    }

    .btn,
    .btn1 {
        width: 100%;
        font-size: 15px;
        margin: 10px auto;
        display: block;
    }

    .h3{
      font-size: 20px;
      font-weight: bold;
      margin-top: 30px;
      color: white;
    }

    .total {
        max-width: 700px;
        font-size: 17px;
        position: relative;
    }
    .expenses-container{
        width: 100%;
        max-width: 750px;
    }
}

</style>
