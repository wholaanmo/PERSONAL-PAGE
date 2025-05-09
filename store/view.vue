<template>
  <navigation/>

  <div class="con">
    <div class="nav-con">
          <h1>Personal Expenses</h1>
    </div>
    <div class="con-container">
    <!-- Navigation Buttons (centered) -->
    <!-- Content Based on the Current View -->
    <div v-if="currentView === 'view'" class="budget-section">
      <div class="content-wrapper">
        <!-- Filter Buttons -->
        <div class="filter-buttons">
          <form @submit.prevent>
          <button @click="filterExpenses('Food')" :class="{ active: filterCategory === 'Food' }">Food</button>
          <button @click="filterExpenses('Bill')" :class="{ active: filterCategory === 'Bill' }">Bill</button>
          <button @click="filterExpenses('Transportation')" :class="{ active: filterCategory === 'Transportation' }">Transportation</button>
          <button @click="filterExpenses('Entertainment')" :class="{ active: filterCategory === 'Entertainment' }">Entertainment</button>
          <button @click="filterExpenses('Healthcare')" :class="{ active: filterCategory === 'Healthcare' }">Healthcare</button>
          <button @click="filterExpenses('Personal Care')" :class="{ active: filterCategory === 'Personal Care' }">Personal Care</button>
          <button @click="filterExpenses('Shopping')" :class="{ active: filterCategory === 'Shopping' }">Shopping</button>
          <button @click="filterExpenses('Other')" :class="{ active: filterCategory === 'Other' }">Other</button>
          <button @click="filterExpenses('all')" :class="{ active: filterCategory === 'all' }">View All</button>
            <input type="month" v-model="filterMonth" />
            <button @click="filterExpensesByMonth" title="Search">
                <i class="fa fa-search"></i>
            </button>
          </form>
        </div>

        <!-- Expense Table -->
        <div class="expense-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(expense, index) in filteredExpenses" :key="expense.id" :class="{'alternate-row': index % 2 !== 0}">
                <td>{{ expense.category }}</td>
                <td>{{ expense.name }}</td>
                <td>{{ formatCurrency(expense.amount) }}</td> <!-- Use formatCurrency method here -->
                <td>{{ expense.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Display Total Amount -->
        <div class="total-amount">
          <p>Total: {{ formatCurrency(totalAmount) }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="chart-summary">
        <div class="chart">
          <pie-chart :data="chartData" 
          :options="chartOptions" 
          style="height: 200px;"/>
        
          <!-- Year and Month Picker for PDF generation -->
          <div class="download">
          <select v-model="selectedYear">
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>

          <select v-model="selectedMonth">
            <option v-for="month in availableMonths" :key="month.value" :value="month.value">{{ month.label }}</option>
          </select>

          <button class="download-button" @click="generatePDF">Download Report</button>
        </div>
      </div>

      <div class="summary-box">
        <p><strong>Total Expenses:</strong> {{ formatCurrency(totalAmount) }}</p>
        <p><strong>Remaining Budget:</strong> {{ formatCurrency(budget - totalAmount) }}</p>
      </div>
    </div>
    </div>
</template>


<script>
import Navigation from "./navigation.vue"; 
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import jsPDF from 'jspdf'; // Import jsPDF
import { mapGetters, mapActions } from 'vuex';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export default {
components: {
  Navigation,
  PieChart: Pie,
},
data() {
  return {
    currentView: 'view', 
    filterCategory: 'all', 
    filterMonth: '', 
    selectedYear: new Date().getFullYear().toString(), 
    selectedMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.label + ': ₱' + tooltipItem.raw.toFixed(2);
              },
            },
          },
        },
      },
    };
  },

computed: {
  ...mapGetters(['getExpenses', 'getPersonalBudgets']),
  expenses() {
      return this.getExpenses.map(expense => ({
        ...expense,
        category: expense.expense_type,
        name: expense.item_name,
        amount: Number(expense.item_price),
        date: this.formatDateForView(expense.created_at || expense.date)
      }));
    },
    
    chartData() {
      const categoryCounts = {
        Food: 0,
        Bill: 0,
        Transportation: 0,
        Entertainment: 0,
        Healthcare: 0,
        'Personal Care': 0,
        Shopping: 0,
        Other: 0,
      };

      this.filteredExpenses.forEach(expense => {
        if (expense.category in categoryCounts) {
          categoryCounts[expense.category] += expense.amount;
        } else {
          categoryCounts.Other += expense.amount;
        }
      });

      return {
        labels: Object.keys(categoryCounts),
        datasets: [{
          label: 'Expense Categories',
          data: Object.values(categoryCounts),
          backgroundColor: [
            '#90fefb', '#febee9', '#aefda3', '#f5fda3', 
            '#ecbefe', '#fefdad', '#feadad', '#adb5fe'
          ],
          borderColor: [
            '#90fefb', '#febee9', '#aefda3', '#f5fda3', 
            '#ecbefe', '#fefdad', '#feadad', '#adb5fe'
          ],
          borderWidth: 1,
        }]
      };
    },

    availableYears() {
      const years = new Set();
      this.expenses.forEach(expense => {
        if (expense.date) {
          const year = expense.date.split('-')[0];
          years.add(year);
        }
      });
      return Array.from(years).sort().reverse();
    },
    
    availableMonths() {
      return [
        { value: '01', label: 'January' },
        { value: '02', label: 'February' },
        { value: '03', label: 'March' },
        { value: '04', label: 'April' },
        { value: '05', label: 'May' },
        { value: '06', label: 'June' },
        { value: '07', label: 'July' },
        { value: '08', label: 'August' },
        { value: '09', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
      ];
    },

    filteredExpenses() {
      return this.expenses.filter(expense => {
        const categoryMatch = this.filterCategory === 'all' || expense.category === this.filterCategory;
        const monthMatch = !this.filterMonth || (expense.date && expense.date.startsWith(this.filterMonth));
        return categoryMatch && monthMatch;
      });
    },

    totalAmount() {
      return this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    },

    currentBudget() {
      if (!this.getPersonalBudgets || this.getPersonalBudgets.length === 0) return null;
      return this.getPersonalBudgets.find(
        b => b.month_year === `${this.selectedYear}-${this.selectedMonth}`
      );
    },
  },

  created() {
    this.fetchExpenses();
    this.fetchPersonalBudgets();
  },
  
  
  methods: {
    ...mapActions(['fetchExpenses', 'fetchPersonalBudgets']),
    
    filterExpenses(category) {
      this.filterCategory = category;
    },
    
    filterExpensesByDate() {
      this.filterCategory = 'all';
    },
    
    formatCurrency(value) {
      if (value == null || isNaN(value)) return '₱0.00';
      return '₱' + parseFloat(value).toFixed(2);
    },
    
    formatDateForView(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    },
    
    async generatePDF() {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text('Expense Report', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      const monthName = this.availableMonths.find(m => m.value === this.selectedMonth)?.label || '';
      doc.text(`Period: ${monthName} ${this.selectedYear}`, 105, 30, { align: 'center' });
      
      doc.text(`Total Expenses: ${this.formatCurrency(this.totalAmount)}`, 105, 40, { align: 'center' });
      
      // Expenses table
      let yOffset = 50;
      doc.setFontSize(10);
      doc.text('Date', 20, yOffset);
      doc.text('Category', 60, yOffset);
      doc.text('Description', 100, yOffset);
      doc.text('Amount', 180, yOffset);
      yOffset += 7;
      
      doc.line(20, yOffset, 190, yOffset);
      yOffset += 10;
      
      const filteredForPDF = this.expenses.filter(expense => {
        return expense.date && expense.date.startsWith(`${this.selectedYear}-${this.selectedMonth}`);
      });
      
      filteredForPDF.forEach((expense) => {
        doc.text(expense.date, 20, yOffset);
        doc.text(expense.category, 60, yOffset);
        doc.text(expense.name, 100, yOffset);
        doc.text(this.formatCurrency(expense.amount), 180, yOffset, { align: 'right' });
        yOffset += 10;
        
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }
      });
      
      // Chart
      await this.$nextTick();
      const chartCanvas = document.querySelector('canvas');
      if (chartCanvas) {
        const chartImage = chartCanvas.toDataURL('image/png');
        doc.addPage();
        doc.addImage(chartImage, 'PNG', 20, 20, 160, 160);
      }
      
      doc.save(`expense-report-${this.selectedYear}-${this.selectedMonth}.pdf`);
    },
  },
};
</script>



<style scoped>

.con {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap; /* Optional: stack on small screens */
  gap: 10px;
}

.nav-con {
font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
font-size: 20px;
position: relative;
margin-top: 120px;
display: flex;
justify-content: center;
margin-bottom: -10px;
width: 100%;
}


button {
  border-radius: 8px;
  padding: 12px 20px;
  position: relative;
  font-size: 20px;
  border: 2px solid #386233;
  background-color: #fffef5;
  cursor: pointer;
  transition: 0.3s ease;
}

button.active {
  background-color: #2a4935;
  color: white;
}

button:hover {
  background-color: #2a4935;
  color: white;
}

.budget-section {
  text-align: center;
  margin-top: 20px;
  min-height: 654px;
}

.budget-section h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.budget-section p {
  font-size: 24px;
  color: red;
}

.con-container {
  background: rgb(216, 248, 216);
  border: 2px solid #336333;
  border-radius: 20px;
  width: 70%; 
  min-width: 380px;
  max-width: 900px; /* Optional: keep for responsiveness */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  align-items: flex-start;
  margin-bottom: 10px;
}

/* Filter Buttons Styling */
.filter-buttons button {
  position: relative;
  padding: 8px;
  margin: 3px;
  border-radius: 1px;
  background-color: #ffffff;
  border: 2px solid #336333;
  transition: all 0.3s ease;
  font-size: 15px;
  border-radius: 6px;
}

.filter-buttons button.active {
  background-color: #2a4935;
  color: white;
  border-color: #2a4935;
}

.filter-buttons button:hover {
  background-color: #2a4935;
}

/* Expense Table Styling */
.expense-table table {
  position: relative;
  width: 90%;
  justify-self: center;
  margin-top: 20px;
  border-collapse: collapse;
  table-layout: fixed;
}

.expense-table th, .expense-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid #000000;
  vertical-align: top;
  word-break: break-word; 
}

.expense-table th {
  background-color: #2a4935;
  color: white;
}

.expense-table tr {
  background-color: white;
}

/* Alternate Row Color */
.expense-table tr.alternate-row {
  background-color: #fffef5;
}

/* Total Amount Styling */
.total-amount {
  margin-top: 20px;
  font-weight: bold;
}

.chart{
  width: 380px;
  padding: 20px;
  box-sizing: border-box;
  background: #ecfcec;
  border-radius: 20px;
  max-height: 600px;
  border: 2px solid #336333;
  margin-bottom: 10px;
}

.download{
  display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  align-items: center; 
  margin-top: 10px;
}

.download-button {
display: flex;
flex-wrap: wrap;
padding: 10px 20px;
font-size: 16px;
background-color: #2a4935;
color: white;
border: none;
cursor: pointer;
align-self: center;
margin-bottom: 10px;
margin-left: 3px;
}

.download-button:hover {
background-color: #1e3731;
}

.summary-box {
  padding: 12px 20px;
  background-color: #99da99;
  border: 2px solid #1e3731;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-size: 16px;
  margin-bottom: 10px;
  text-align: center;
  color: #000000;
}

</style> 
