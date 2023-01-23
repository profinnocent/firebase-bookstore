import {initializeApp} from 'firebase/app';
import {
  getFirestore, collection, getDocs, 
  addDoc, deleteDoc, doc, getDoc, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import {
  getAuth, createUserWithEmailAndPassword, signOut,
  signInWithEmailAndPassword, onAuthStateChanged
} from 'firebase/auth';

import {firebaseConfig} from './config';

// 
initializeApp(firebaseConfig);

// 
const db = getFirestore()
const auth = getAuth();

// 
const colRef = collection(db, 'books')
// const qr = query(colRef, where('title', '==', 'Yusuf Musa'), orderBy('createdAt'))
const q = query(colRef, orderBy('createdAt'))


// Get all books from db and subscribe to changes
const docsUnsub = onSnapshot(q, (snapshot) => {
  let books = [];
  snapshot.docs.forEach(doc => {
    books.push({id: doc.id, ...doc.data()})
  })
  console.log(books);

  let table = document.querySelector('table');
  console.log(table);
  let count = 1
  books.forEach((book) => {
  let tr = `<tr>  
    <td>${count}</td>
    <td>${book.title}</td>
    <td>${book.author}</td>
    <td>
        <button> Edit</button>
        <button>Delete</button>
    </td>
    </tr>
  `;
  table.innerHTML += tr;
  count++;
  })
})

// First method to get all book without subscription
// getDocs(colRef)
//   .then((snapshot) => {
//     let books = [];
//     snapshot.docs.forEach(doc => {
//       books.push({id: doc.id, ...doc.data()})
//     })
//     console.log(books);
//   })
//   .catch(err => console.log(err))


// Get a specific book
const getABookForm = document.querySelector('.getabookform');

getABookForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // console.log(getABookForm.bid.value);
  let bid = getABookForm.bid.value;
  const docRef = doc(db, 'books', bid);

  getDocFunction(docRef);

})

// Setup subscription for a single document
// onSnapshot(docRef, (doc) => {
//   console.log(doc.id, doc.data());
// })

// Adding documents
const addBookForm = document.querySelector('.addform');

addBookForm.addEventListener('submit', (e) => {
  e.preventDefault();

  addDoc(colRef, {
    title: addBookForm.title.value,
    author: addBookForm.author.value,
    createdAt: serverTimestamp()
  })
  .then(() => addBookForm.reset())

})


// Update a Book
const updateBookForm = document.querySelector('.updateform');

  updateBookForm.addEventListener('submit', (e) => {
    e.preventDefault();
  console.log("object");

  const docRef = doc(db, 'books', updateBookForm.bid.value);

  let book = getDocFunction(docRef);

  updateDoc(docRef, {
    title: updateBookForm.title.value == '' ? book.title : updateBookForm.title.value,
    author: updateBookForm.author.value == '' ? book.author : updateBookForm.author.value
  })
  .then(() => {
    updateBookForm.reset()
  })
  .catch(err => console.log(err))

})

// Delete documents
const delBookForm = document.querySelector('.deleteform');

delBookForm.addEventListener('submit', (e) => {
  e.preventDefault();
console.log("object");

const docRef = doc(db, 'books', delBookForm.bid.value);

  deleteDoc(docRef)
  .then(() => {
    delBookForm.reset()
  })

})


//Function to handle getting a spcific doc
// param: document refernece docRef
// Returns: a single document 
function getDocFunction(docRef){
  getDoc(docRef)
  .then((doc) => {
    if(doc.data() == null){
      console.log(`Document with this ID: ${bid} does not exist`)
    }else{
      console.log(doc.data());
    }
  })
  .catch(err => console.log(err.message))
}


// Sign up Users
const signUpForm = document.querySelector('.signupform')

signUpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = signUpForm.email.value;
  const password = signUpForm.password.value;

  createUserWithEmailAndPassword(auth, email, password)
  .then((cred) => {
    // console.log('User created: ', cred.user);
    signUpForm.reset();
  })
  .catch(err => {
    console.log(err.message)
  })
})

// Login User
// Sign up Users
const loginForm = document.querySelector('.loginform')

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
  .then((cred) => {
    // console.log('User logged in: ', cred.user);
    loginForm.reset();
  })
  .catch(err => {
    console.log(err.message);
  })
})
// Logout a User
const logoutBtn = document.querySelector('.logout')

logoutBtn.addEventListener('click', () => {

  signOut(auth)
  .then(() => {
    console.log("User logged out successfully.");
  })
  .catch(err => {
    console.log(err.message);
  })

})

// Subscribing to the Auth changes
const authUnsub = onAuthStateChanged(auth, (user) => {
  console.log('User state changed', user);
  console.log('User state changed', user.accessToken);

})


// Unsubscribing to subscriptions
const unsubBtn = document.querySelector('.unsubbtn');
unsubBtn.addEventListener('click', () => {
  console.log("Unsubscribing now...");
  docsUnsub();
  authUnsub();
})

