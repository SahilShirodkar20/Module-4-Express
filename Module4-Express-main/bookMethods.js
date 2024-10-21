const axios = require("axios");

const API_URL = "http://localhost:5000/api";


async function getAllBooks() {
  try {
    const response = await axios.get(`${API_URL}/books`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error);
    throw error;
  }
}


function searchByISBN(isbn) {
  return new Promise((resolve, reject) => {
    axios
      .get(`${API_URL}/books/${isbn}`)
      .then((response) => resolve(response.data))
      .catch((error) => {
        console.error("Error searching by ISBN:", error);
        reject(error);
      });
  });
}


async function searchByAuthor(author) {
  try {
    const response = await axios.get(`${API_URL}/books/author/${author}`);
    return response.data;
  } catch (error) {
    console.error("Error searching by author:", error);
    throw error;
  }
}


async function searchByTitle(title) {
  try {
    const response = await axios.get(`${API_URL}/books/title/${title}`);
    return response.data;
  } catch (error) {
    console.error("Error searching by title:", error);
    throw error;
  }
}


async function main() {
  try {
    console.log("All books:", await getAllBooks());
    console.log("Book with ISBN 123456:", await searchByISBN("123456"));
    console.log("Books by Author 1:", await searchByAuthor("Author 1"));
    console.log(
      'Books with title containing "Book":',
      await searchByTitle("Book")
    );
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();

module.exports = {
  getAllBooks,
  searchByISBN,
  searchByAuthor,
  searchByTitle,
};
