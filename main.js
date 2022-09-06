document.addEventListener("DOMContentLoaded", function () {
  const submitBook = document.getElementById("inputBook");
  submitBook.addEventListener("submit", function (e) {
    e.preventDefault();
    addBookList();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.getElementById("searchBook").addEventListener("click", function (e) {
  e.preventDefault();
  const searchBook = document.getElementById("searchBookTitle").value.toLowerCase();
  const bookList = document.querySelectorAll(".book_item > h3");
  for (const book of bookList) {
    if (book.innerText.toLowerCase().includes(searchBook)) {
      book.parentElement.parentElement.style.display = "block";
    } else {
      book.parentElement.parentElement.style.display = "none";
    }
  }
});

function addBookList() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsCompleted = document.getElementById("inputBookIsComplete").checked;
  const generateID = generateId();
  const bookListObject = generateBookListObject(generateID, bookTitle, bookAuthor, bookYear, bookIsCompleted);
  books.push(bookListObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookListObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

const books = [];

const RENDER_EVENT = "render-book";

function makeBook(bookListObject) {
  const textTitleBook = document.createElement("h3");
  textTitleBook.innerText = bookListObject.title;

  const textAuthorBook = document.createElement("p");
  textAuthorBook.innerText = bookListObject.author;

  const textYearBook = document.createElement("p");
  textYearBook.innerText = bookListObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("book_item");
  textContainer.append(textTitleBook, textAuthorBook, textYearBook);

  const container = document.createElement("div");
  container.classList.add("book_item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookListObject.id}`);

  if (bookListObject.isCompleted) {
    const undoRead = document.createElement("button");
    undoRead.innerText = "Undo";
    undoRead.classList.add("check-button");
    undoRead.addEventListener("click", function () {
      undoBookFromCompleted(bookListObject.id);
    });

    const deleteBook = document.createElement("button");
    deleteBook.innerText = "Delete";
    deleteBook.classList.add("trash-button");
    deleteBook.addEventListener("click", function () {
      removeBookFromCompleted(bookListObject.id);
    });
    container.append(undoRead, deleteBook);
  } else {
    const doneRead = document.createElement("button");
    doneRead.innerText = "Done";
    doneRead.classList.add("check-button");
    doneRead.addEventListener("click", function () {
      addBookToCompleted(bookListObject.id);
    });
    const deleteBook = document.createElement("button");
    deleteBook.innerText = "Delete";
    deleteBook.classList.add("trash-button");
    deleteBook.addEventListener("click", function () {
      removeBookFromCompleted(bookListObject.id);
    });
    container.append(doneRead, deleteBook);
  }
  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) return index;
  }
  return -1;
}

function saveData() {
  if (isStorageExist) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "BOOKSHELF_APPS";
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Your browser does not support local storage!");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("incompleteBookshelfList");
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
});
