import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    expenses: [],
    personalBudgets: [],
    usdExchangeRate: 56.50,
    selectedMonthYear: new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')
  },
  getters: {
    getExpenses: state => state.expenses,
    getPersonalBudgets: state => state.personalBudgets,
    getTotalAmount: state => {
      return state.expenses.reduce((sum, expense) => sum + Number(expense.item_price), 0)
    },
    getCurrentBudget: state => {
      return state.personalBudgets.find(
        b => b.month_year === state.selectedMonthYear
      )
    },
    getAvailableMonths: () => {
      const months = []
      const date = new Date()
      for (let i = 0; i < 12; i++) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        months.push(`${year}-${month}`)
        date.setMonth(date.getMonth() + 1)
      }
      return months
    }
  },
  mutations: {
    SET_EXPENSES(state, expenses) {
      state.expenses = expenses
    },
    SET_PERSONAL_BUDGETS(state, budgets) {
      state.personalBudgets = budgets
    },
    SET_EXCHANGE_RATE(state, rate) {
      state.usdExchangeRate = rate
    },
    SET_SELECTED_MONTH_YEAR(state, monthYear) {
      state.selectedMonthYear = monthYear
    },
    ADD_EXPENSE(state, expense) {
      state.expenses.push(expense)
    },
    UPDATE_EXPENSE(state, updatedExpense) {
      const index = state.expenses.findIndex(e => e.id === updatedExpense.id)
      if (index !== -1) {
        state.expenses.splice(index, 1, updatedExpense)
      }
    },
    DELETE_EXPENSE(state, id) {
      state.expenses = state.expenses.filter(e => e.id !== id)
    },
    ADD_BUDGET(state, budget) {
      state.personalBudgets.push(budget)
    },
    UPDATE_BUDGET(state, updatedBudget) {
      const index = state.personalBudgets.findIndex(b => b.id === updatedBudget.id)
      if (index !== -1) {
        state.personalBudgets.splice(index, 1, updatedBudget)
      }
    }
  },
  actions: {
    async fetchExchangeRate({ commit }) {
      try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD')
        commit('SET_EXCHANGE_RATE', response.data.rates.PHP)
      } catch (error) {
        console.error("Error fetching exchange rate:", error)
      }
    },
    async fetchExpenses({ commit }) {
      try {
        const response = await axios.get('/api/expenses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
        })
        commit('SET_EXPENSES', response.data.data || [])
      } catch (error) {
        console.error("Error fetching expenses:", error)
        commit('SET_EXPENSES', [])
      }
    },
    async fetchPersonalBudgets({ commit }) {
      try {
        const response = await axios.get('/api/personal-budgets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
        })
        commit('SET_PERSONAL_BUDGETS', response.data.data || [])
      } catch (error) {
        console.error("Error fetching budgets:", error)
        commit('SET_PERSONAL_BUDGETS', [])
      }
    },
    async addExpense({ commit }, expenseData) {
      try {
        const response = await axios.post('/api/expenses', expenseData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
        })
        if (response.data.success) {
          commit('ADD_EXPENSE', response.data.data)
          return { success: true }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        console.error("Error adding expense:", error)
        return { success: false, message: error.response?.data?.message || 'Failed to add expense' }
      }
    },
    async updateExpense({ commit }, { id, expenseData }) {
      try {
        const response = await axios.put(`/api/expenses/${id}`, expenseData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
        })
        if (response.data.success) {
          commit('UPDATE_EXPENSE', response.data.data)
          return { success: true }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        console.error("Error updating expense:", error)
        return { success: false, message: error.response?.data?.message || 'Failed to update expense' }
      }
    },
    async deleteExpense({ commit }, id) {
      try {
        const response = await axios.delete(`/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
        })
        if (response.data.success) {
          commit('DELETE_EXPENSE', id)
          return { success: true }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        console.error("Error deleting expense:", error)
        return { success: false, message: error.response?.data?.message || 'Failed to delete expense' }
      }
    },
    async addBudget({ commit }, budgetData) {
      try {
        const res = await axios.post('/api/personal-budgets', budgetData);
        commit('ADD_BUDGET', res.data.data);
        return { success: true, message: 'Budget added!' };
      } catch (error) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Add failed' 
        };
      }
    },
    async updateBudget({ commit }, { originalMonthYear, budgetData }) {
      try {
        const response = await axios.put('/api/personal-budgets', {
          original_month_year: originalMonthYear,
          ...budgetData
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('jsontoken')}` }
        })
        if (response.data.success) {
          commit('UPDATE_BUDGET', response.data.data)
          return { success: true }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        console.error("Error updating budget:", error)
        return { success: false, message: error.response?.data?.message || 'Failed to update budget' }
      }
    }
  }
})
