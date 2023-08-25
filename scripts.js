const Modal = {
    open() {
        //abrir modal
        //adiconar a class active ao modal
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')

    },
    close() {
        // fechar o modal
        //remover a class active do modal
        document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
        []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}


const Transaction = {
    all: Storage.get(),

    add (transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        
        App.reload()
    },

    incomes() {
        let income = 0;
        // pegar todas as transacoes
        // para cada transacao
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if(transaction.amount > 0 ){
                // somar a variavel e reetornar a variavel
                income += transaction.amount;
            }
    })
    return income;
    },

    expenses() {
        let expense = 0;
        // pegar todas as transacoes
        // para cada transacao,
        Transaction.all.forEach(transaction => {
            // se ela for menor que zero
            if(transaction.amount < 0 ){
                // somar a variavel e reetornar a variavel
                expense += transaction.amount;
            }
    })
    return expense;
},

total(){
    return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                </td>
            `
            
            return html
},

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    FormatAmount(value){

        // o input[type=number] ja da pra gente o campo em formato de número

        /* Usaremos o value * 100, para aplicar nossa estratégia
        Entretanto, alguns números (como o 0.56)
        fica um resultado bizarro (56.000.000. blah blah)

        Então, usaremos o Math.round() que arredonda o número que foi passado como argumento
        */ 
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return  `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
        
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if(description.trim() == "" ||
            amount.trim() == "" ||
            date.trim() == ""){
            throw new Error("Por favor,Preencha todos os campos")
        }
    },

    FormatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.FormatAmount(amount)
        
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        
        try {
            Form.validateFields()
            
            const transaction = Form.FormatValues()
            
            Transaction.add(transaction)
            
            Form.clearFields()
            
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    },

}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()