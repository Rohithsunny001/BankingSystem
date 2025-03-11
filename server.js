const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const accounts = require('./accounts');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to Express Banking System');
});


app.post('/create-account', (req, res) => {
    const { name, initialDeposit } = req.body;
    if (!name || initialDeposit < 0) return res.status(400).send("Invalid data");

    const newAccount = {
        id: uuidv4(),
        name,
        balance: initialDeposit,
        transactions: []
    };
    
    accounts.push(newAccount);
    res.status(201).send(newAccount);
});


app.get('/balance/:id', (req, res) => {
    const account = accounts.find(acc => acc.id === req.params.id);
    if (!account) return res.status(404).send("Account not found");

    res.send({ balance: account.balance });
});


app.post('/deposit', (req, res) => {
    const { id, amount } = req.body;
    const account = accounts.find(acc => acc.id === id);

    if (!account || amount <= 0) return res.status(400).send("Invalid request");

    account.balance += amount;
    account.transactions.push({ type: "deposit", amount });

    res.send({ message: "Deposit successful", balance: account.balance });
});


app.post('/withdraw', (req, res) => {
    const { id, amount } = req.body;
    const account = accounts.find(acc => acc.id === id);

    if (!account || amount <= 0 || account.balance < amount) {
        return res.status(400).send("Invalid transaction");
    }

    account.balance -= amount;
    account.transactions.push({ type: "withdraw", amount });

    res.send({ message: "Withdrawal successful", balance: account.balance });
});


app.post('/transfer', (req, res) => {
    const { fromId, toId, amount } = req.body;
    const sender = accounts.find(acc => acc.id === fromId);
    const receiver = accounts.find(acc => acc.id === toId);

    if (!sender || !receiver || amount <= 0 || sender.balance < amount) {
        return res.status(400).send("Invalid transfer");
    }

    sender.balance -= amount;
    receiver.balance += amount;

    sender.transactions.push({ type: "transfer", amount, to: toId });
    receiver.transactions.push({ type: "received", amount, from: fromId });

    res.send({ message: "Transfer successful", senderBalance: sender.balance, receiverBalance: receiver.balance });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
