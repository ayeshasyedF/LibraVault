## Database

The system uses SQLite.

The database schema is defined in:

database/schema.sql

Tables include:

- Users
- Books
- BookCopies
- Loans
- Reservations

To initialize the database:

sqlite3 library.db < database/schema.sq