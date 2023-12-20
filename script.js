'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale
const nowISO = new Date().toISOString();

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-04-11T17:01:17.194Z',
    '2023-04-14T23:36:17.929Z',
    '2023-04-17T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Currency formater
const currFormat = function (val) {
  const options = {
    style: 'currency',
    currency: currentAccount.currency,
  };
  const formatedMov = new Intl.NumberFormat(
    currentAccount.locale,
    options
  ).format(val);

  return formatedMov;
};

// Date now
const showDateNow = function () {
  const shortTime = new Intl.DateTimeFormat(currentAccount.locale, {
    timeStyle: 'short',
    dateStyle: 'short',
  });
  labelDate.textContent = shortTime.format(Date.now());
};

// Days ago
const calcTimeAgo = function (date) {
  const timeBetween = Math.round(
    (Date.now() - Date.parse(date)) / 1000 / 60 / 60 / 24
  );
  if (timeBetween == 0) return 'Today';
  else if (timeBetween == 1) return 'Yesterday';
  else if (timeBetween <= 7) return `${timeBetween} days ago`;
  else return new Date(date).toLocaleDateString(currentAccount.locale);
};

// Timer
let timerId;
let timerTime = 0; // sec

const startTimer = function () {
  if (!timerId) {
    timerTime = 60 * 5; // sec
    timerId = setInterval(countDown, 1000);
  }
};

const countDown = function () {
  const min = String(Math.floor(timerTime / 60)).padStart(2, '0');
  const sec = String(Math.floor(timerTime % 60)).padStart(2, '0');

  labelTimer.textContent = `${min}:${sec}`;

  if (timerTime == 0) {
    clearInterval(timerId);
    containerApp.style.opacity = 0;
  }
  timerTime--;
};

const stopTimer = function () {
  clearInterval(timerId);
  timerId = null;
};

// Display transaktions
const displayMov = function (movements, sort) {
  containerMovements.innerHTML = '';
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${calcTimeAgo(
        currentAccount.movementsDates[i]
      )}</div>
      <div class="movements__value">${currFormat(mov)}</div>
  </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// Count balance and type it and add to user object;
const calcDisplayBal = function (arr) {
  showDateNow();
  const currBal = arr.reduce((acc, val) => acc + val, 0);
  labelBalance.textContent = currFormat(currBal);
  currentAccount.balance = currBal;
};

// Count incoming, out and interest balance
const calcDisplaySumm = function (movements) {
  const incBal = movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov);
  labelSumIn.textContent = currFormat(incBal);

  const out = movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = currFormat(Math.abs(out));

  const interest = movements
    .filter(mov => mov > 0)
    .map(mov => (mov * currentAccount.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = currFormat(interest);
};

// Make in account user id
const loginMaker = function (accs) {
  accs.forEach(function (acc) {
    acc.userId = acc.owner
      .toLowerCase()
      .split(' ')
      .map(arr => arr[0])
      .join('');
  });
};
loginMaker(accounts);

// Update UI
const updateData = function () {
  displayMov(currentAccount.movements);
  calcDisplayBal(currentAccount.movements);
  calcDisplaySumm(currentAccount.movements);
  stopTimer();
  startTimer();
};

// Login handler
let currentAccount;
btnLogin.addEventListener('click', event => {
  event.preventDefault();
  currentAccount = accounts.find(
    acc => acc.userId === inputLoginUsername.value
  );
  if (inputLoginPin.value == currentAccount?.pin) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    updateData();
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
  }
});

// Transfer money
btnTransfer.addEventListener('click', event => {
  event.preventDefault();
  const receiverAcc = accounts.find(
    acc => acc.userId === inputTransferTo.value
  );
  const amount = +inputTransferAmount.value;
  if (
    amount > 0 &&
    amount <= currentAccount.balance &&
    receiverAcc &&
    receiverAcc.userId !== currentAccount.userId
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(nowISO);
    receiverAcc.movements.push(+amount);
    receiverAcc.movementsDates.push(nowISO);
    inputTransferTo.value = inputTransferAmount.value = '';
    inputTransferAmount.blur();
    updateData();
  }
});

// Close account
btnClose.addEventListener('click', event => {
  event.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.userId &&
    inputClosePin.value == currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userId === currentAccount.userId
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = '';
    inputClosePin.blur();
  }
});

// Take a loan
btnLoan.addEventListener('click', event => {
  event.preventDefault();
  const loan = Math.floor(inputLoanAmount.value);
  if (loan > 0 && currentAccount.movements.some(val => val >= loan * 0.1)) {
    currentAccount.movements.push(loan);
    currentAccount.movementsDates.push(nowISO);
    inputLoanAmount.value = '';
    inputLoanAmount.blur();
    updateData();
  }
});

// Sorting movements
let sortState = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  displayMov(currentAccount.movements, !sortState);
  sortState = !sortState;
});

// Functions Johna's

// const displayMovements = function (movements, sort = false) {
//   containerMovements.innerHTML = '';

//   const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

//   movs.forEach(function (mov, i) {
//     const type = mov > 0 ? 'deposit' : 'withdrawal';

//     const html = `
//       <div class="movements__row">
//         <div class="movements__type movements__type--${type}">${
//       i + 1
//     } ${type}</div>
//         <div class="movements__value">${mov}€</div>
//       </div>
//     `;

//     containerMovements.insertAdjacentHTML('afterbegin', html);
//   });
// };

// const calcDisplayBalance = function (acc) {
//   acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
//   labelBalance.textContent = `${acc.balance}€`;
// };

// const calcDisplaySummary = function (acc) {
//   const incomes = acc.movements
//     .filter(mov => mov > 0)
//     .reduce((acc, mov) => acc + mov, 0);
//   labelSumIn.textContent = `${incomes}€`;

//   const out = acc.movements
//     .filter(mov => mov < 0)
//     .reduce((acc, mov) => acc + mov, 0);
//   labelSumOut.textContent = `${Math.abs(out)}€`;

//   const interest = acc.movements
//     .filter(mov => mov > 0)
//     .map(deposit => (deposit * acc.interestRate) / 100)
//     .filter((int, i, arr) => {
//       // console.log(arr);
//       return int >= 1;
//     })
//     .reduce((acc, int) => acc + int, 0);
//   labelSumInterest.textContent = `${interest}€`;
// };

// const createUsernames = function (accs) {
//   accs.forEach(function (acc) {
//     acc.username = acc.owner
//       .toLowerCase()
//       .split(' ')
//       .map(name => name[0])
//       .join('');
//   });
// };
// createUsernames(accounts);

// const updateUI = function (acc) {
//   // Display movements
//   displayMovements(acc.movements);

//   // Display balance
//   calcDisplayBalance(acc);

//   // Display summary
//   calcDisplaySummary(acc);
// };

// ///////////////////////////////////////
// // Event handlers
// let currentAccount;

// btnLogin.addEventListener('click', function (e) {
//   // Prevent form from submitting
//   e.preventDefault();

//   currentAccount = accounts.find(
//     acc => acc.username === inputLoginUsername.value
//   );
//   console.log(currentAccount);

//   if (currentAccount?.pin === Number(inputLoginPin.value)) {
//     // Display UI and message
//     labelWelcome.textContent = `Welcome back, ${
//       currentAccount.owner.split(' ')[0]
//     }`;
//     containerApp.style.opacity = 100;

//     // Clear input fields
//     inputLoginUsername.value = inputLoginPin.value = '';
//     inputLoginPin.blur();

//     // Update UI
//     updateUI(currentAccount);
//   }
// });

// btnTransfer.addEventListener('click', function (e) {
//   e.preventDefault();
//   const amount = Number(inputTransferAmount.value);
//   const receiverAcc = accounts.find(
//     acc => acc.username === inputTransferTo.value
//   );
//   inputTransferAmount.value = inputTransferTo.value = '';

//   if (
//     amount > 0 &&
//     receiverAcc &&
//     currentAccount.balance >= amount &&
//     receiverAcc?.username !== currentAccount.username
//   ) {
//     // Doing the transfer
//     currentAccount.movements.push(-amount);
//     receiverAcc.movements.push(amount);

//     // Update UI
//     updateUI(currentAccount);
//   }
// });

// btnLoan.addEventListener('click', function (e) {
//   e.preventDefault();

//   const amount = Number(inputLoanAmount.value);

//   if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
//     // Add movement
//     currentAccount.movements.push(amount);

//     // Update UI
//     updateUI(currentAccount);
//   }
//   inputLoanAmount.value = '';
// });

// btnClose.addEventListener('click', function (e) {
//   e.preventDefault();

//   if (
//     inputCloseUsername.value === currentAccount.username &&
//     Number(inputClosePin.value) === currentAccount.pin
//   ) {
//     const index = accounts.findIndex(
//       acc => acc.username === currentAccount.username
//     );
//     console.log(index);
//     // .indexOf(23)

//     // Delete account
//     accounts.splice(index, 1);

//     // Hide UI
//     containerApp.style.opacity = 0;
//   }

//   inputCloseUsername.value = inputClosePin.value = '';
// });

// let sorted = false;
// btnSort.addEventListener('click', function (e) {
//   e.preventDefault();
//   displayMovements(currentAccount.movements, !sorted);
//   sorted = !sorted;
// });

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
