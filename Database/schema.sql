-- =========================
-- Users Table
-- =========================

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT,
    created_at DATETIME
);

-- =========================
-- Books Table
-- =========================

CREATE TABLE Books (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    isbn TEXT,
    author TEXT,
    category TEXT,
    publisher TEXT,
    publication_year INTEGER,
    description TEXT
);

-- =========================
-- Book Copies Table
-- =========================

CREATE TABLE BookCopies (
    copy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    status TEXT,
    location TEXT,
    FOREIGN KEY (book_id) REFERENCES Books(book_id)
);

-- =========================
-- Loans Table
-- =========================

CREATE TABLE Loans (
    loan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    copy_id INTEGER,
    borrow_date DATE,
    due_date DATE,
    return_date DATE,
    renewal_count INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (copy_id) REFERENCES BookCopies(copy_id)
);

-- =========================
-- Reservations Table
-- =========================

CREATE TABLE Reservations (
    reservation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    reservation_date DATE,
    status TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (book_id) REFERENCES Books(book_id)
);

-- =========================
-- Imported Books Dataset Table
-- =========================

CREATE TABLE ImportedBooks (
    bookID INTEGER PRIMARY KEY,
    title TEXT,
    authors TEXT,
    average_rating REAL,
    isbn TEXT,
    isbn13 TEXT,
    language_code TEXT,
    num_pages INTEGER,
    ratings_count INTEGER,
    text_reviews_count INTEGER,
    publication_date TEXT,
    publisher TEXT
);