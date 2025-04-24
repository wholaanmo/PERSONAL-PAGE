require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./api/users/user.router");
const expenseRouter = require("./api/expenses/expenses.router");
const personal_budgetRouter = require("./api/expenses/personal-budgets.router");
const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/expenses', expenseRouter)
app.use('/api/personal-budgets', personal_budgetRouter)
app.listen(process.env.APP_PORT, () => {
    console.log("Server up and running on PORT : ", process.env.APP_PORT);
});
