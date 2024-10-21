const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));


let books = [
  { isbn: '9780486821955', title: 'Don Quixote', author: 'Miguel de Cervantes', reviews: [] },
  { isbn: '9781786751041', title: 'Alice\'s Adventures in Wonderland', author: 'Lewis Caroll', reviews: [] },
  { isbn: '9780679601685', title: 'Pride and Prejudice', author: 'Jane Austen', reviews: [] },
];

let users = [];


const authenticateUser = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, '1234', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
};


app.get('/api/books', (req, res) => {
  res.json(books);
});


app.get('/api/books/:isbn', (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});


app.get('/api/books/author/:author', (req, res) => {
  const filteredBooks = books.filter(b => b.author.toLowerCase().includes(req.params.author.toLowerCase()));
  res.json(filteredBooks);
});


app.get('/api/books/title/:title', (req, res) => {
  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(req.params.title.toLowerCase()));
  res.json(filteredBooks);
});


app.get('/api/books/:isbn/reviews', (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book.reviews);
});


app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered successfully' });
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ username }, 'your-secret-key', { expiresIn: '1h' });
  res.json({ token });
});


app.post('/api/books/:isbn/reviews', authenticateUser, (req, res) => {
  const { review } = req.body;
  const book = books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  
  const existingReviewIndex = book.reviews.findIndex(r => r.username === req.user.username);
  if (existingReviewIndex !== -1) {
    book.reviews[existingReviewIndex].review = review;
  } else {
    book.reviews.push({ username: req.user.username, review });
  }
  res.status(201).json({ message: 'Review added/modified successfully' });
});


app.delete('/api/books/:isbn/reviews', authenticateUser, (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  
  const reviewIndex = book.reviews.findIndex(r => r.username === req.user.username);
  if (reviewIndex === -1) return res.status(404).json({ message: 'Review not found' });
  
  book.reviews.splice(reviewIndex, 1);
  res.json({ message: 'Review deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});