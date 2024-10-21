import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newReview, setNewReview] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${API_URL}/books`);
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleSearch = async () => {
    try {
      let url = `${API_URL}/books`;
      if (searchType === 'isbn') {
        url += `/${searchQuery}`;
      } else if (searchType === 'author') {
        url += `/author/${searchQuery}`;
      } else if (searchType === 'title') {
        url += `/title/${searchQuery}`;
      }
      const response = await axios.get(url);
      setBooks(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username: e.target.username.value,
        password: e.target.password.value,
      });
      setToken(response.data.token);
      setUser(e.target.username.value);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/register`, {
        username: e.target.username.value,
        password: e.target.password.value,
      });
      alert('User registered successfully!');
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleAddReview = async () => {
    if (!selectedBook) return;
    try {
      await axios.post(
        `${API_URL}/books/${selectedBook.isbn}/reviews`,
        { review: newReview },
        { headers: { Authorization: token } }
      );
      fetchBooks();
      setNewReview('');
      setSelectedBook(null);
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const handleDeleteReview = async (isbn) => {
    try {
      await axios.delete(`${API_URL}/books/${isbn}/reviews`, {
        headers: { Authorization: token },
      });
      fetchBooks();
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Online Book Review</h1>
      
      {!user && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Login</h2>
          <form onSubmit={handleLogin} className="space-y-2">
            <input type="text" name="username" placeholder="Username" className="border p-2" />
            <input type="password" name="password" placeholder="Password" className="border p-2" />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
          </form>
        </div>
      )}

      {!user && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Register</h2>
          <form onSubmit={handleRegister} className="space-y-2">
            <input type="text" name="username" placeholder="Username" className="border p-2" />
            <input type="password" name="password" placeholder="Password" className="border p-2" />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Register</button>
          </form>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Search Books</h2>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="all">All</option>
          <option value="isbn">ISBN</option>
          <option value="author">Author</option>
          <option value="title">Title</option>
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search query"
          className="border p-2 mr-2"
        />
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Books</h2>
        <ul className="space-y-2">
          {books.map((book) => (
            <li key={book.isbn} className="border p-2">
              <h3 className="font-semibold">{book.title}</h3>
              <p>Author: {book.author}</p>
              <p>ISBN: {book.isbn}</p>
              <h4 className="font-semibold mt-2">Reviews:</h4>
              <ul className="ml-4">
                {book.reviews.map((review, index) => (
                  <li key={index}>
                    {review.username}: {review.review}
                    {user === review.username && (
                      <button
                        onClick={() => handleDeleteReview(book.isbn)}
                        className="ml-2 text-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              {user && (
                <button
                  onClick={() => setSelectedBook(book)}
                  className="mt-2 bg-green-500 text-white px-2 py-1 rounded"
                >
                  Add Review
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {selectedBook && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Add Review for {selectedBook.title}</h2>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            className="border p-2 w-full"
            rows="3"
          ></textarea>
          <button
            onClick={handleAddReview}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Submit Review
          </button>
        </div>
      )}
    </div>
  );
}

export default App;