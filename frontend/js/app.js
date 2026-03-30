(function () {
  const STORAGE_KEYS = {
    user: "nocturne_user",
    readers: "nocturne_reader_accounts",
    admins: "nocturne_admin_accounts",
    reservations: "nocturne_reservations",
    circulation: "nocturne_circulation",
    suggestions: "nocturne_suggestions",
    addedBooks: "nocturne_added_books",
    homepageSearch: "nocturne_homepage_search",
    viewedBooks: "nocturne_viewed_books",
    searchHistory: "nocturne_search_history",
    legacyMembers: "nocturne_members"
  };

  const ADMIN_CREATION_KEY = "nocturne-keepers-key";
  const FALLBACK_BOOKS = (window.LibraryData && window.LibraryData.books) || [];
  let API_BOOKS = [];
  const REC_POOLS = (window.LibraryData && window.LibraryData.recommendationPools) || {};

  function $(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function $all(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function createId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function normalizeName(value) {
    return String(value || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function formatDate(dateInput) {
    if (!dateInput) return "—";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function offsetDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function toast(message) {
    let node = $("#toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "toast";
      node.className = "toast";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(node._timer);
    node._timer = setTimeout(() => node.classList.remove("show"), 2600);
  }

  function setYear() {
    $all("[data-year]").forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  function getReaders() {
    return readJSON(STORAGE_KEYS.readers, []);
  }

  function saveReaders(items) {
    writeJSON(STORAGE_KEYS.readers, items);
  }

  function getAdmins() {
    return readJSON(STORAGE_KEYS.admins, []);
  }

  function saveAdmins(items) {
    writeJSON(STORAGE_KEYS.admins, items);
  }

  function getReservationsAll() {
    return readJSON(STORAGE_KEYS.reservations, []);
  }

  function saveReservations(items) {
    writeJSON(STORAGE_KEYS.reservations, items);
  }

  function getCirculation() {
    return readJSON(STORAGE_KEYS.circulation, []);
  }

  function saveCirculation(items) {
    writeJSON(STORAGE_KEYS.circulation, items);
  }

  function getSuggestions() {
    return readJSON(STORAGE_KEYS.suggestions, []);
  }

  function saveSuggestions(items) {
    writeJSON(STORAGE_KEYS.suggestions, items);
  }

  function getAddedBooks() {
    return readJSON(STORAGE_KEYS.addedBooks, []);
  }

  function saveAddedBooks(items) {
    writeJSON(STORAGE_KEYS.addedBooks, items);
  }

  function getViewedBooks() {
    return readJSON(STORAGE_KEYS.viewedBooks, []);
  }

  function saveViewedBooks(items) {
    writeJSON(STORAGE_KEYS.viewedBooks, items);
  }

  function getSearchHistory() {
    return readJSON(STORAGE_KEYS.searchHistory, []);
  }

  function saveSearchHistory(items) {
    writeJSON(STORAGE_KEYS.searchHistory, items);
  }

  function normalizeApiBook(raw) {
  return {
    id: String(raw.slug || raw.book_id),
    book_id: raw.book_id,
    title: raw.title || "Untitled",
    author: raw.author || "Unknown author",
    collection: raw.collection_name || raw.collection || "General Collection",
    genre: raw.category || raw.genre || "General",
    format: raw.book_format || raw.format || "Book",
    year: raw.publication_year || raw.year || "",
    pages: Number(raw.pages) || 0,
    rating: Number(raw.rating) || 0,
    cover:
      raw.cover_url ||
      raw.cover ||
      "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg",
    accent: raw.accent || "gold",
    blurb: raw.blurb || raw.description || "No summary available yet.",
    description: raw.description || raw.blurb || "No description available yet.",
    publisher: raw.publisher || "",
    copies: Array.isArray(raw.copies) ? raw.copies : []
  };
}

async function fetchBooksFromApi() {
  try {
    const response = await fetch("/api/books");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    API_BOOKS = Array.isArray(data) && data.length ? data.map(normalizeApiBook) : FALLBACK_BOOKS;

    if (!data.length) {
      console.warn("Database returned no books, using fallback frontend data.");
    }
  } catch (error) {
    console.error("Could not load books from /api/books:", error);
    API_BOOKS = FALLBACK_BOOKS;
    toast("Using fallback frontend book data.");
  }
}

  function recordBookView(bookId) {
    if (!bookId) return;
    const history = getViewedBooks().filter((id) => id !== bookId);
    history.unshift(bookId);
    saveViewedBooks(history.slice(0, 12));
  }

  function recordSearch(query) {
    const cleanQuery = String(query || "").trim();
    if (cleanQuery.length < 2) return;
    const normalized = cleanQuery.toLowerCase();
    const history = getSearchHistory().filter((item) => item.toLowerCase() !== normalized);
    history.unshift(cleanQuery);
    saveSearchHistory(history.slice(0, 8));
  }

  function setUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.user);
      return;
    }
    writeJSON(STORAGE_KEYS.user, user);
  }

  function findReaderByEmail(email) {
    const cleanEmail = normalizeEmail(email);
    return getReaders().find((reader) => normalizeEmail(reader.email) === cleanEmail) || null;
  }

  function findAdminByEmail(email) {
    const cleanEmail = normalizeEmail(email);
    return getAdmins().find((admin) => normalizeEmail(admin.email) === cleanEmail) || null;
  }

  function findReaderById(id) {
    return getReaders().find((reader) => reader.id === id) || null;
  }

  function findAdminById(id) {
    return getAdmins().find((admin) => admin.id === id) || null;
  }

  function buildSessionFromAccount(account, role) {
    if (!account) return null;
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      memberId: role === "reader" ? account.memberId : account.staffId,
      role
    };
  }

  function getUser() {
    const raw = readJSON(STORAGE_KEYS.user, null);
    if (!raw || !raw.role || !raw.email) return null;

    const account = raw.role === "admin" ? findAdminByEmail(raw.email) : findReaderByEmail(raw.email);
    if (!account) {
      localStorage.removeItem(STORAGE_KEYS.user);
      return null;
    }

    const normalized = buildSessionFromAccount(account, raw.role);
    if (
      raw.id !== normalized.id ||
      raw.name !== normalized.name ||
      raw.memberId !== normalized.memberId
    ) {
      setUser(normalized);
    }
    return normalized;
  }

  function getOpenCirculation() {
    return getCirculation().filter((entry) => !entry.returnedAt);
  }

  function getLoanForBook(bookId) {
    return getOpenCirculation().find((entry) => entry.bookId === bookId) || null;
  }

  function getAllBooks() {
  return [...API_BOOKS, ...getAddedBooks()].map((book) => {
    const loan = getLoanForBook(book.id);
    return {
      ...book,
      available: !loan,
      borrower: loan
        ? {
            name: loan.borrowerName,
            email: loan.borrowerEmail,
            memberId: loan.memberId,
            dueDate: loan.dueDate
          }
        : null
    };
  });
  }

  function getBookById(id) {
    return getAllBooks().find((book) => book.id === id) || null;
  }

  function migrateLegacyMembers() {
    const readers = readJSON(STORAGE_KEYS.readers, null);
    if (readers) return;

    const legacyMembers = readJSON(STORAGE_KEYS.legacyMembers, null);
    if (!legacyMembers || !Array.isArray(legacyMembers) || !legacyMembers.length) return;

    saveReaders(
      legacyMembers.map((member, index) => ({
        id: member.id || createId("reader"),
        name: member.name || `Reader ${index + 1}`,
        email: normalizeEmail(member.email || `reader${index + 1}@nocturne.demo`),
        password: "reader123",
        memberId: member.memberId || `NL-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString()
      }))
    );
  }

  function ensureSeedData() {
    migrateLegacyMembers();

    if (!readJSON(STORAGE_KEYS.readers, null)) {
      saveReaders([
        {
          id: createId("reader"),
          name: "Evelyn Hart",
          email: "evelyn@nocturne.demo",
          password: "moonlit-reader",
          memberId: "NL-431284",
          createdAt: new Date().toISOString()
        },
        {
          id: createId("reader"),
          name: "Julian March",
          email: "julian@nocturne.demo",
          password: "reading-room",
          memberId: "NL-572118",
          createdAt: new Date().toISOString()
        }
      ]);
    }

    if (!readJSON(STORAGE_KEYS.admins, null)) {
      saveAdmins([
        {
          id: createId("admin"),
          name: "Aurelia Vale",
          email: "admin@nocturne.demo",
          password: "library-admin",
          staffId: "ADM-001",
          createdAt: new Date().toISOString()
        }
      ]);
    }

    if (!readJSON(STORAGE_KEYS.circulation, null)) {
      saveCirculation([
        {
          loanId: createId("loan"),
          bookId: "rebecca",
          borrowerName: "Evelyn Hart",
          borrowerEmail: "evelyn@nocturne.demo",
          memberId: "NL-431284",
          checkedOutAt: offsetDate(-5),
          dueDate: offsetDate(9),
          renewals: 0,
          checkedOutBy: "admin@nocturne.demo"
        }
      ]);
    }

    if (!readJSON(STORAGE_KEYS.suggestions, null)) {
      saveSuggestions([
        {
          id: createId("suggestion"),
          title: "The Goldfinch",
          author: "Donna Tartt",
          reason: "It matches the literary and atmospheric tone of the current featured collection.",
          createdAt: new Date().toISOString(),
          submittedBy: "Guest Reader",
          submittedByEmail: ""
        }
      ]);
    }

    if (!readJSON(STORAGE_KEYS.reservations, null)) {
      saveReservations([]);
    }

    if (!readJSON(STORAGE_KEYS.addedBooks, null)) {
      saveAddedBooks([]);
    }

    if (!readJSON(STORAGE_KEYS.viewedBooks, null)) {
      saveViewedBooks([]);
    }

    if (!readJSON(STORAGE_KEYS.searchHistory, null)) {
      saveSearchHistory([]);
    }
  }

  function getUserReservations() {
    const user = getUser();
    if (!user || user.role !== "reader") return [];
    return getReservationsAll().filter((item) => normalizeEmail(item.email) === user.email);
  }

  function getUserLoans() {
    const user = getUser();
    if (!user || user.role !== "reader") return [];
    return getOpenCirculation().filter((loan) => normalizeEmail(loan.borrowerEmail) === user.email);
  }

  function accountEmailExists(email) {
    return !!findReaderByEmail(email) || !!findAdminByEmail(email);
  }

  function createReaderAccount(name, email, password) {
    const cleanName = normalizeName(name);
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = String(password || "").trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return { ok: false, message: "Please complete all reader account fields." };
    }

    if (cleanPassword.length < 6) {
      return { ok: false, message: "Reader passwords should be at least 6 characters." };
    }

    if (accountEmailExists(cleanEmail)) {
      return { ok: false, message: "An account already exists with that email." };
    }

    const readers = getReaders();
    const reader = {
      id: createId("reader"),
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      memberId: "NL-" + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString()
    };

    readers.unshift(reader);
    saveReaders(readers);
    return { ok: true, account: reader };
  }

  function createAdminAccount(name, email, password, key) {
    const cleanName = normalizeName(name);
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = String(password || "").trim();

    if (!cleanName || !cleanEmail || !cleanPassword || !String(key || "").trim()) {
      return { ok: false, message: "Please complete all admin account fields." };
    }

    if (String(key).trim() !== ADMIN_CREATION_KEY) {
      return { ok: false, message: `Use the admin creation key: ${ADMIN_CREATION_KEY}` };
    }

    if (cleanPassword.length < 6) {
      return { ok: false, message: "Admin passwords should be at least 6 characters." };
    }

    if (accountEmailExists(cleanEmail)) {
      return { ok: false, message: "An account already exists with that email." };
    }

    const admins = getAdmins();
    const admin = {
      id: createId("admin"),
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      staffId: "ADM-" + String(admins.length + 1).padStart(3, "0"),
      createdAt: new Date().toISOString()
    };

    admins.unshift(admin);
    saveAdmins(admins);
    return { ok: true, account: admin };
  }

  function authenticate(role, email, password) {
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = String(password || "");
    const account = role === "admin" ? findAdminByEmail(cleanEmail) : findReaderByEmail(cleanEmail);

    if (!account) {
      return { ok: false, message: `No ${role} account was found with that email.` };
    }

    if (account.password !== cleanPassword) {
      return { ok: false, message: "That password does not match our saved frontend record." };
    }

    return { ok: true, account };
  }

  function resetPassword(role, email, password) {
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = String(password || "").trim();

    if (cleanPassword.length < 6) {
      return { ok: false, message: "New passwords should be at least 6 characters." };
    }

    const items = role === "admin" ? getAdmins() : getReaders();
    const account = items.find((entry) => normalizeEmail(entry.email) === cleanEmail);

    if (!account) {
      return { ok: false, message: `No ${role} account was found with that email.` };
    }

    account.password = cleanPassword;
    if (role === "admin") {
      saveAdmins(items);
    } else {
      saveReaders(items);
    }

    return { ok: true, account };
  }

  function deleteReaderAccount(readerId, actorLabel) {
    const readers = getReaders();
    const reader = readers.find((entry) => entry.id === readerId);
    if (!reader) {
      return { ok: false, message: "That reader account could not be found." };
    }

    saveReaders(readers.filter((entry) => entry.id !== readerId));
    saveReservations(
      getReservationsAll().filter((entry) => normalizeEmail(entry.email) !== normalizeEmail(reader.email))
    );

    const circulation = getCirculation();
    circulation.forEach((loan) => {
      if (!loan.returnedAt && normalizeEmail(loan.borrowerEmail) === normalizeEmail(reader.email)) {
        loan.returnedAt = new Date().toISOString();
        loan.returnedBy = actorLabel || "Account deletion";
      }
    });
    saveCirculation(circulation);

    const currentUser = getUser();
    if (currentUser && currentUser.role === "reader" && currentUser.id === readerId) {
      setUser(null);
      return { ok: true, loggedOut: true, account: reader };
    }

    return { ok: true, account: reader };
  }

  function deleteAdminAccount(adminId) {
    const admins = getAdmins();
    const admin = admins.find((entry) => entry.id === adminId);
    if (!admin) {
      return { ok: false, message: "That admin account could not be found." };
    }

    saveAdmins(admins.filter((entry) => entry.id !== adminId));
    const currentUser = getUser();
    if (currentUser && currentUser.role === "admin" && currentUser.id === adminId) {
      setUser(null);
      return { ok: true, loggedOut: true, account: admin };
    }

    return { ok: true, account: admin };
  }

  function updateHeaderUserState() {
    const user = getUser();
    const loginLinks = $all("[data-login-link]");
    const logoutButtons = $all("[data-logout]");
    const adminLinks = $all("[data-admin-link]");

    loginLinks.forEach((link) => {
      if (user && user.role === "admin") {
        link.textContent = "Admin Desk";
        link.setAttribute("href", "admin.html");
      } else if (user) {
        link.textContent = "My Library";
        link.setAttribute("href", "account.html");
      } else {
        link.textContent = "Login";
        link.setAttribute("href", "login.html");
      }
    });

    adminLinks.forEach((link) => {
      link.hidden = !(user && user.role === "admin");
    });

    logoutButtons.forEach((button) => {
      button.hidden = !user;
      button.onclick = () => {
        setUser(null);
        toast("You have been signed out.");
        updateHeaderUserState();
        const page = document.body.dataset.page;
        if (page === "account" || page === "admin") {
          setTimeout(() => {
            window.location.href = "login.html";
          }, 250);
        }
      };
    });
  }

  function reserveBook(bookId) {
    const user = getUser();
    if (!user || user.role !== "reader") {
      toast("Please sign in as a reader to reserve books.");
      return;
    }

    const items = getReservationsAll();
    const exists = items.some((entry) => normalizeEmail(entry.email) === user.email && entry.bookId === bookId);
    if (exists) {
      toast("That book is already in your reservation list.");
      return;
    }

    items.unshift({
      id: createId("reservation"),
      email: user.email,
      memberId: user.memberId,
      bookId,
      createdAt: new Date().toISOString()
    });
    saveReservations(items);
    toast("Book reserved to your library account.");
    refreshReservationButtons();
    renderAccountPage();
  }

  function renewLoan(bookId) {
    const user = getUser();
    if (!user || user.role !== "reader") {
      toast("Please sign in as a reader to renew books.");
      return;
    }

    const circulation = getCirculation();
    const loan = circulation.find(
      (entry) => entry.bookId === bookId && !entry.returnedAt && normalizeEmail(entry.borrowerEmail) === user.email
    );

    if (!loan) {
      toast("That book is not currently on your loan list.");
      return;
    }

    if ((loan.renewals || 0) >= 2) {
      toast("Renewal limit reached for this title.");
      return;
    }

    const due = new Date(loan.dueDate);
    due.setDate(due.getDate() + 14);
    loan.dueDate = due.toISOString();
    loan.renewals = (loan.renewals || 0) + 1;
    saveCirculation(circulation);
    toast("Loan renewed for two more weeks.");
    renderAccountPage();
    renderAdminPage();
    renderCatalogPage();
    renderBookDetailPage();
  }

  function addSuggestion(title, author, reason) {
    const user = getUser();
    const suggestions = getSuggestions();
    suggestions.unshift({
      id: createId("suggestion"),
      title,
      author,
      reason,
      createdAt: new Date().toISOString(),
      submittedBy: user ? user.name : "Guest Reader",
      submittedByEmail: user ? user.email : ""
    });
    saveSuggestions(suggestions);
    toast("Your recommendation has been added.");
  }

  function addBook(payload) {
    const books = getAddedBooks();
    const idBase = slugify(payload.title) || "book";
    const id = books.some((book) => book.id === idBase) || API_BOOKS.some((book) => book.id === idBase)
      ? `${idBase}-${Date.now().toString(36)}`
      : idBase;

    books.unshift({
      id,
      title: payload.title,
      author: payload.author,
      collection: payload.collection,
      genre: payload.genre,
      format: payload.format,
      year: Number(payload.year) || new Date().getFullYear(),
      pages: Number(payload.pages) || 0,
      rating: 4.5,
      cover:
        payload.cover ||
        "https://images.pexels.com/photos/16092309/pexels-photo-16092309.jpeg?cs=srgb&dl=pexels-helloaesthe-16092309.jpg&fm=jpg",
      accent: payload.accent || "gold",
      blurb: payload.blurb,
      description: payload.description,
      createdAt: new Date().toISOString(),
      addedBy: (getUser() || {}).email || "admin"
    });

    saveAddedBooks(books);
    toast("New book added to the library frontend catalog.");
    renderAdminPage();
    renderCatalogPage();
    renderBookDetailPage();
  }

  function checkOutBook(bookId, readerId, dueDays) {
    const user = getUser();
    if (!user || user.role !== "admin") {
      toast("Admin access is required for circulation actions.");
      return;
    }

    if (getLoanForBook(bookId)) {
      toast("This title is already checked out.");
      return;
    }

    const reader = findReaderById(readerId);
    if (!reader) {
      toast("Choose a valid reader account for checkout.");
      return;
    }

    const circulation = getCirculation();
    circulation.unshift({
      loanId: createId("loan"),
      bookId,
      borrowerName: reader.name,
      borrowerEmail: reader.email,
      memberId: reader.memberId,
      checkedOutAt: new Date().toISOString(),
      dueDate: offsetDate(Number(dueDays) || 14),
      renewals: 0,
      checkedOutBy: user.email
    });
    saveCirculation(circulation);
    toast("Book checked out successfully.");
    renderAdminPage();
    renderCatalogPage();
    renderBookDetailPage();
    renderAccountPage();
  }

  function returnLoan(loanId) {
    const user = getUser();
    if (!user || user.role !== "admin") {
      toast("Admin access is required for circulation actions.");
      return;
    }

    const circulation = getCirculation();
    const loan = circulation.find((entry) => entry.loanId === loanId && !entry.returnedAt);
    if (!loan) {
      toast("That circulation record is already closed.");
      return;
    }

    loan.returnedAt = new Date().toISOString();
    loan.returnedBy = user.email;
    saveCirculation(circulation);
    toast("Book marked as returned.");
    renderAdminPage();
    renderCatalogPage();
    renderBookDetailPage();
    renderAccountPage();
  }

  function bookCard(book) {
    const reserved = getUserReservations().some((entry) => entry.bookId === book.id);
    const availability = book.available ? "Available now" : "Currently on loan";
    const buttonText = reserved ? "Reserved" : "Reserve";
    const buttonClass = reserved ? "btn-secondary is-static" : "btn-secondary js-reserve";

    return `
      <article class="catalog-card">
        <div class="catalog-card-media">
          <img src="${book.cover}" alt="${escapeHtml(book.title)} cover mood image">
          <span class="catalog-badge">${escapeHtml(book.collection)}</span>
        </div>
        <div class="catalog-card-body">
          <div class="catalog-topline">
            <span class="pill">${escapeHtml(book.genre)}</span>
            <span class="subtle">${escapeHtml(book.format)}</span>
          </div>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="catalog-byline">by ${escapeHtml(book.author)}</p>
          <p>${escapeHtml(book.blurb)}</p>
          <div class="catalog-meta">
            <span>${escapeHtml(book.year)}</span>
            <span>${escapeHtml(book.pages)} pages</span>
            <span>${escapeHtml(book.rating)} ★</span>
          </div>
          <div class="catalog-status ${book.available ? "available" : "unavailable"}">${availability}</div>
          <div class="catalog-actions">
            <a class="ghost-link" href="book.html?id=${encodeURIComponent(book.id)}">View details</a>
            <button class="${buttonClass}" data-book-id="${escapeHtml(book.id)}" ${reserved ? "disabled" : ""}>
              ${buttonText}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function recommendationCard(book, note) {
    const reserved = getUserReservations().some((entry) => entry.bookId === book.id);
    const availability = book.available ? "Available now" : "Currently on loan";
    const buttonText = reserved ? "Reserved" : "Reserve";
    const buttonClass = reserved ? "btn-secondary is-static" : "btn-secondary js-reserve";

    return `
      <article class="catalog-card">
        <div class="catalog-card-media">
          <img src="${book.cover}" alt="${escapeHtml(book.title)} cover mood image">
          <span class="catalog-badge">${escapeHtml(book.collection)}</span>
        </div>
        <div class="catalog-card-body">
          <div class="catalog-topline">
            <span class="pill">${escapeHtml(book.genre)}</span>
            <span class="subtle">${escapeHtml(book.format)}</span>
          </div>
          <p class="label">${escapeHtml(note)}</p>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="catalog-byline">by ${escapeHtml(book.author)}</p>
          <p>${escapeHtml(book.blurb)}</p>
          <div class="catalog-meta">
            <span>${escapeHtml(book.year)}</span>
            <span>${escapeHtml(book.pages)} pages</span>
            <span>${escapeHtml(book.rating)} ★</span>
          </div>
          <div class="catalog-status ${book.available ? "available" : "unavailable"}">${availability}</div>
          <div class="catalog-actions">
            <a class="ghost-link" href="book.html?id=${encodeURIComponent(book.id)}">View details</a>
            <button class="${buttonClass}" data-book-id="${escapeHtml(book.id)}" ${reserved ? "disabled" : ""}>
              ${buttonText}
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function attachReserveButtons(scope = document) {
    $all(".js-reserve", scope).forEach((button) => {
      button.addEventListener("click", () => reserveBook(button.dataset.bookId));
    });
  }

  function refreshReservationButtons() {
    const ids = getUserReservations().map((entry) => entry.bookId);
    $all(".js-reserve").forEach((button) => {
      const reserved = ids.includes(button.dataset.bookId);
      button.disabled = reserved;
      button.textContent = reserved ? "Reserved" : "Reserve";
      if (reserved) {
        button.classList.add("is-static");
      } else {
        button.classList.remove("is-static");
      }
    });
  }

  function handleHomepageSearch() {
    const form = $("#homepageSearchForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const searchInput = $("#homepageSearchInput");
      const value = searchInput ? searchInput.value : "";
      recordSearch(value);
      localStorage.setItem(STORAGE_KEYS.homepageSearch, value.trim());
      window.location.href = "catalog.html";
    });
  }

  function renderTopPicks() {
    const target = $("#topPicksGrid");
    if (!target) return;
    const picks = getAllBooks().slice(0, 4);
    target.innerHTML = picks.map(bookCard).join("");
    attachReserveButtons(target);
    refreshReservationButtons();
  }

  function renderCatalogPage() {
    const grid = $("#catalogGrid");
    if (!grid) return;

    const books = getAllBooks();
    const searchInput = $("#catalogSearch");
    const collectionSelect = $("#collectionFilter");
    const availabilitySelect = $("#availabilityFilter");

    const initialSearch = localStorage.getItem(STORAGE_KEYS.homepageSearch) || "";
    if (searchInput && !searchInput.value) {
      searchInput.value = initialSearch;
      localStorage.removeItem(STORAGE_KEYS.homepageSearch);
    }

    const collections = [...new Set(books.map((book) => book.collection))];
    if (collectionSelect && collectionSelect.options.length <= 1) {
      collections.forEach((collection) => {
        const opt = document.createElement("option");
        opt.value = collection;
        opt.textContent = collection;
        collectionSelect.appendChild(opt);
      });
    }

    function applyFilters() {
      const rawQuery = (searchInput ? searchInput.value : "").trim();
      const query = rawQuery.toLowerCase();
      const collection = collectionSelect ? collectionSelect.value : "";
      const availability = availabilitySelect ? availabilitySelect.value : "";

      if (searchInput && searchInput.dataset.lastRecorded !== rawQuery && rawQuery.length >= 2) {
        recordSearch(rawQuery);
        searchInput.dataset.lastRecorded = rawQuery;
      }

      const filtered = books.filter((book) => {
        const haystack = [book.title, book.author, book.genre, book.collection, book.description, book.blurb]
          .join(" ")
          .toLowerCase();

        const matchesQuery = !query || haystack.includes(query);
        const matchesCollection = !collection || book.collection === collection;
        const matchesAvailability =
          !availability ||
          (availability === "available" && book.available) ||
          (availability === "unavailable" && !book.available);

        return matchesQuery && matchesCollection && matchesAvailability;
      });

      const countNode = $("#catalogCount");
      if (countNode) countNode.textContent = `${filtered.length} titles`;

      grid.innerHTML = filtered.length
        ? filtered.map(bookCard).join("")
        : `<div class="empty-state"><h3>No matching titles</h3><p>Try a different keyword or clear one of the filters.</p></div>`;

      attachReserveButtons(grid);
      refreshReservationButtons();
    }

    [searchInput, collectionSelect, availabilitySelect].forEach((control) => {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function renderBookDetailPage() {
    const shell = $("#bookDetailShell");
    if (!shell) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "secret-history";
    const book = getBookById(id) || getAllBooks()[0];
    if (!book) return;

    recordBookView(book.id);

    const reserved = getUserReservations().some((entry) => entry.bookId === book.id);
    const user = getUser();

    shell.innerHTML = `
      <section class="book-hero">
        <div class="book-cover-shell">
          <img src="${book.cover}" alt="${escapeHtml(book.title)} cover mood image">
        </div>
        <div class="book-copy">
          <div class="eyebrow">Catalog Detail</div>
          <h2>${escapeHtml(book.title)}</h2>
          <p class="book-author">by ${escapeHtml(book.author)}</p>
          <p>${escapeHtml(book.description)}</p>
          <div class="book-stats">
            <span class="meta-chip">${escapeHtml(book.collection)}</span>
            <span class="meta-chip">${escapeHtml(book.genre)}</span>
            <span class="meta-chip">${escapeHtml(book.format)}</span>
            <span class="meta-chip">${escapeHtml(book.pages)} pages</span>
          </div>
          <div class="catalog-status ${book.available ? "available" : "unavailable"}">
            ${book.available ? "Available now" : "On loan, but you can still reserve it"}
          </div>
          <div class="book-actions">
            <button class="btn js-reserve" data-book-id="${escapeHtml(book.id)}" ${reserved ? "disabled" : ""}>
              ${reserved ? "Reserved" : "Reserve this title"}
            </button>
            <a class="btn-secondary" href="catalog.html">Back to catalog</a>
          </div>
        </div>
      </section>

      <section class="detail-panels">
        <article class="detail-panel">
          <span class="label">Why readers love it</span>
          <h3>Atmosphere, scholarship, and mood</h3>
          <p>${escapeHtml(book.blurb)}</p>
        </article>
        <article class="detail-panel">
          <span class="label">Borrowing notes</span>
          <h3>Reservation and renewal ready</h3>
          <p>${book.available ? "This title is available for checkout or reservation." : "This title is currently checked out. Readers can still place a reservation from this page."}</p>
          ${
            user && user.role === "admin" && book.borrower
              ? `<p class="account-subline">Currently with <strong>${escapeHtml(book.borrower.name)}</strong> · ${escapeHtml(book.borrower.email)} · ${escapeHtml(book.borrower.memberId)} · Due ${formatDate(book.borrower.dueDate)}</p>`
              : ""
          }
        </article>
      </section>
    `;

    attachReserveButtons(shell);
    refreshReservationButtons();
  }

  function renderAccountPage() {
    const accountShell = $("#accountShell");
    if (!accountShell) return;

    const user = getUser();
    if (!user) {
      accountShell.innerHTML = `
        <div class="empty-state">
          <h3>Please login to view your library account</h3>
          <p>Your reserved books, loans, and reader profile will appear here after sign-in.</p>
          <a class="btn" href="login.html">Go to login</a>
        </div>
      `;
      return;
    }

    if (user.role === "admin") {
      accountShell.innerHTML = `
        <div class="empty-state">
          <h3>You are signed in as an admin</h3>
          <p>Use the admin desk to add books, check titles in and out, view borrower records, and manage accounts.</p>
          <a class="btn" href="admin.html">Open admin desk</a>
        </div>
      `;
      return;
    }

    const loans = getUserLoans();
    const reservations = getUserReservations().map((entry) => getBookById(entry.bookId)).filter(Boolean);
    const loanCards = loans.length
      ? loans
          .map((loan) => {
            const book = getBookById(loan.bookId);
            if (!book) return "";
            return `
              <article class="account-card">
                <div class="account-card-top">
                  <div>
                    <span class="label">Current loan</span>
                    <h3>${escapeHtml(book.title)}</h3>
                    <p>by ${escapeHtml(book.author)}</p>
                  </div>
                  <span class="pill">Renewals used: ${loan.renewals || 0}/2</span>
                </div>
                <p>Due date: ${formatDate(loan.dueDate)}</p>
                <div class="catalog-actions compact">
                  <a class="ghost-link" href="book.html?id=${encodeURIComponent(book.id)}">View detail</a>
                  <button class="btn-secondary js-renew" data-book-id="${escapeHtml(book.id)}" ${(loan.renewals || 0) >= 2 ? "disabled" : ""}>Renew</button>
                </div>
              </article>
            `;
          })
          .join("")
      : `<div class="empty-state small"><p>No active loans right now. Once an admin checks out a title to your account, it will appear here.</p></div>`;

    const reservationCards = reservations.length
      ? reservations
          .map(
            (book) => `
          <article class="account-card compact-card">
            <span class="label">Reserved title</span>
            <h3>${escapeHtml(book.title)}</h3>
            <p>by ${escapeHtml(book.author)}</p>
            <a class="ghost-link" href="book.html?id=${encodeURIComponent(book.id)}">Open title</a>
          </article>
        `
          )
          .join("")
      : `<div class="empty-state small"><p>No reservations yet. Reserve a title from the catalog.</p></div>`;

    accountShell.innerHTML = `
      <section class="account-hero">
        <div>
          <div class="eyebrow">Reader Account</div>
          <h2>Welcome back, ${escapeHtml(user.name)}</h2>
          <p>Your private library dashboard keeps loans, reservations, and account settings in one elegant space.</p>
          <p class="account-subline">Signed in with ${escapeHtml(user.email)}</p>
        </div>
        <div class="account-summary">
          <div class="summary-card">
            <span class="label">Member ID</span>
            <strong>${escapeHtml(user.memberId)}</strong>
          </div>
          <div class="summary-card">
            <span class="label">Loans</span>
            <strong>${loans.length}</strong>
          </div>
          <div class="summary-card">
            <span class="label">Reservations</span>
            <strong>${reservations.length}</strong>
          </div>
        </div>
      </section>

      <section class="account-section">
        <div class="section-heading">
          <div>
            <div class="eyebrow">Renew books</div>
            <h3>Current loans</h3>
          </div>
        </div>
        <div class="account-grid">${loanCards}</div>
      </section>

      <section class="account-section">
        <div class="section-heading">
          <div>
            <div class="eyebrow">Reserved list</div>
            <h3>Books waiting for you</h3>
          </div>
        </div>
        <div class="account-grid two-col">${reservationCards}</div>
      </section>

      <section class="account-section">
        <div class="section-heading">
          <div>
            <div class="eyebrow">Account settings</div>
            <h3>Manage your reader account</h3>
          </div>
        </div>
        <div class="account-grid two-col">
          <article class="account-card compact-card">
            <span class="label">Security</span>
            <h3>Password reset</h3>
            <p>Use the forgot password flow on the login page whenever you want to update your reader password.</p>
            <a class="ghost-link" href="login.html">Open forgot password</a>
          </article>
          <article class="account-card compact-card danger-card">
            <span class="label">Danger zone</span>
            <h3>Delete this account</h3>
            <p>Deleting your account removes your reader profile, clears your reservations, and closes any active loans in this frontend demo.</p>
            <button class="btn-secondary danger-button js-delete-current-reader" type="button">Delete reader account</button>
          </article>
        </div>
      </section>
    `;

    $all(".js-renew", accountShell).forEach((button) => {
      button.addEventListener("click", () => renewLoan(button.dataset.bookId));
    });

    const deleteButton = $(".js-delete-current-reader", accountShell);
    if (deleteButton) {
      deleteButton.addEventListener("click", () => {
        const confirmed = window.confirm("Delete this reader account? This demo will also clear your reservations and active loans.");
        if (!confirmed) return;
        const result = deleteReaderAccount(user.id, user.email);
        if (result.ok) {
          toast("Reader account deleted.");
          updateHeaderUserState();
          setTimeout(() => {
            window.location.href = "login.html";
          }, 250);
        }
      });
    }
  }

  function flattenRecommendationPool(profile) {
    const pool = REC_POOLS[profile] || REC_POOLS.classics || {};
    const ids = [];
    Object.values(pool).forEach((group) => {
      (group || []).forEach((id) => {
        if (!ids.includes(id)) ids.push(id);
      });
    });
    return ids;
  }

  function getReaderHistoryIds(user) {
    if (!user || user.role !== "reader") return [];

    const reservationIds = getReservationsAll()
      .filter((entry) => normalizeEmail(entry.email) === user.email)
      .map((entry) => entry.bookId);

    const circulationIds = getCirculation()
      .filter((entry) => normalizeEmail(entry.borrowerEmail) === user.email)
      .map((entry) => entry.bookId);

    return [...new Set([...reservationIds, ...circulationIds])];
  }

  function inferRecommendationProfile(seedBooks, searchHistory) {
    const searchable = [
      ...seedBooks.map((book) => `${book.genre} ${book.collection} ${book.title} ${book.description || ""}`),
      ...searchHistory
    ]
      .join(" ")
      .toLowerCase();

    if (/(history|archive|historical|research|monastic|rose|historian)/.test(searchable)) {
      return "history";
    }

    if (/(student|campus|academia|theory|philosophy|scholar|class|study|villains|secret history|stoner)/.test(searchable)) {
      return "student";
    }

    return "classics";
  }

  function buildHistoryPills(context) {
    const pills = [];
    if (context.viewedTitles.length) pills.push(`${context.viewedTitles.length} recently viewed`);
    if (context.readerHistoryTitles.length) pills.push(`${context.readerHistoryTitles.length} account history matches`);
    if (context.searchHistory.length) pills.push(`Searches: ${context.searchHistory.slice(0, 2).join(" · ")}`);
    if (!pills.length) pills.push("Start browsing to personalize this shelf");
    return pills;
  }

  function buildRecommendationContext() {
    const user = getUser();
    const viewedIds = getViewedBooks().map(String).filter(Boolean);
    const viewedTitles = viewedIds.map(getBookById).filter(Boolean);
    const readerHistoryIds = getReaderHistoryIds(user);
    const readerHistoryTitles = readerHistoryIds.map(getBookById).filter(Boolean);
    const searchHistory = getSearchHistory();
    const seedBooks = [];
    [...readerHistoryTitles, ...viewedTitles].forEach((book) => {
      if (book && !seedBooks.some((entry) => entry.id === book.id)) {
        seedBooks.push(book);
      }
    });

    return {
      user,
      viewedIds,
      viewedTitles,
      readerHistoryIds,
      readerHistoryTitles,
      searchHistory,
      seedBooks,
      profile: inferRecommendationProfile(seedBooks, searchHistory)
    };
  }

  function scoreRecommendation(book, context, poolIds) {
    const seedBooks = context.seedBooks;
    const genres = new Set(seedBooks.map((item) => item.genre));
    const collections = new Set(seedBooks.map((item) => item.collection));
    const authors = new Set(seedBooks.map((item) => item.author));
    const formats = new Set(seedBooks.map((item) => item.format));
    const readerHistoryIds = new Set(context.readerHistoryIds);
    const viewedIds = new Set(context.viewedIds);
    const searchTerms = context.searchHistory.map((term) => term.toLowerCase());
    const haystack = [book.title, book.author, book.genre, book.collection, book.description || "", book.blurb || ""]
      .join(" ")
      .toLowerCase();

    let score = 0;
    const reasons = [];

    if (authors.has(book.author)) {
      score += 6;
      reasons.push("By an author already in your history");
    }
    if (genres.has(book.genre)) {
      score += 4;
      reasons.push(
        context.readerHistoryTitles.some((item) => item.genre === book.genre)
          ? "Aligned with your account history"
          : "Similar to books you viewed recently"
      );
    }
    if (collections.has(book.collection)) {
      score += 3;
      reasons.push("From a collection you keep returning to");
    }
    if (formats.has(book.format)) {
      score += 1;
      reasons.push("Matches the format you browse most");
    }
    if (poolIds.includes(book.id)) {
      score += 2;
      reasons.push("Strong fit for your reading profile");
    }

    searchTerms.forEach((term) => {
      if (term.length > 2 && haystack.includes(term)) {
        score += 1;
      }
    });

    if (readerHistoryIds.size) {
      score += 0.3;
    } else if (viewedIds.size) {
      score += 0.15;
    }

    const note =
      reasons[0] ||
      (context.searchHistory.length
        ? "Selected using your recent browsing and search history"
        : "A foundational Nocturne Library pick");

    return { score, note };
  }

  function buildAutomaticRecommendations(limit = 4) {
    const context = buildRecommendationContext();
    const poolIds = flattenRecommendationPool(context.profile);
    const seedIdSet = new Set(context.seedBooks.map((book) => book.id));

    let scored = getAllBooks()
      .filter((book) => !seedIdSet.has(book.id))
      .map((book) => {
        const { score, note } = scoreRecommendation(book, context, poolIds);
        return { book, score, note };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => (b.score - a.score) || (b.book.rating - a.book.rating));

    if (!scored.length) {
      scored = flattenRecommendationPool(context.profile)
        .map((id) => getBookById(id))
        .filter(Boolean)
        .map((book, index) => ({
          book,
          score: 10 - index,
          note: index === 0 ? "Signature Nocturne starting point" : "A beautiful place to begin"
        }));
    }

    return {
      context,
      picks: scored.slice(0, limit)
    };
  }

  function renderRecommendationResults() {
    const resultNode = $("#recResults");
    if (!resultNode) return;

    const { picks } = buildAutomaticRecommendations();
    resultNode.innerHTML = picks
      .map((entry) => recommendationCard(entry.book, entry.note))
      .join("");

    attachReserveButtons(resultNode);
    refreshReservationButtons();
  }

  function renderRecommendationsPage() {
    if (!$("#recResults")) return;
    renderRecommendationResults();
  }

  function renderSuggestionListPreview() {
    const node = $("#suggestionPreview");
    if (!node) return;
    const suggestions = getSuggestions().slice(0, 3);
    node.innerHTML = suggestions
      .map(
        (item) => `
      <article class="mini-suggestion">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.author)}</span>
        <p>${escapeHtml(item.reason)}</p>
      </article>
    `
      )
      .join("");
  }

  function showAuthView(viewName) {
    $all(".auth-tab").forEach((button) => {
      button.classList.toggle("active", button.dataset.authView === viewName);
    });

    $all(".auth-view").forEach((panel) => {
      const isActive = panel.dataset.authPanel === viewName;
      panel.hidden = !isActive;
      panel.classList.toggle("active", isActive);
    });
  }

  function handleLoginPage() {
    if (!$('[data-auth-panel="signin"]')) return;

    $all(".auth-tab").forEach((button) => {
      button.addEventListener("click", () => showAuthView(button.dataset.authView));
    });

    const signInForm = $("#signInForm");
    if (signInForm) {
      signInForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const role = ($('input[name="loginRole"]:checked') || {}).value || "reader";
        const email = $("#loginEmail").value;
        const password = $("#loginPassword").value;
        const result = authenticate(role, email, password);

        if (!result.ok) {
          toast(result.message);
          return;
        }

        setUser(buildSessionFromAccount(result.account, role));
        toast(role === "admin" ? "Admin access granted." : "Welcome back to Nocturne Library.");
        updateHeaderUserState();
        setTimeout(() => {
          window.location.href = role === "admin" ? "admin.html" : "account.html";
        }, 250);
      });
    }

    const readerSignupForm = $("#readerSignupForm");
    if (readerSignupForm) {
      readerSignupForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = $("#readerName").value;
        const email = $("#readerEmail").value;
        const password = $("#readerPassword").value;
        const confirm = $("#readerPasswordConfirm").value;

        if (password !== confirm) {
          toast("Reader passwords do not match.");
          return;
        }

        const result = createReaderAccount(name, email, password);
        if (!result.ok) {
          toast(result.message);
          return;
        }

        setUser(buildSessionFromAccount(result.account, "reader"));
        toast("Reader account created.");
        updateHeaderUserState();
        setTimeout(() => {
          window.location.href = "account.html";
        }, 250);
      });
    }

    const adminSignupForm = $("#adminSignupForm");
    if (adminSignupForm) {
      adminSignupForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = $("#adminName").value;
        const email = $("#adminEmail").value;
        const password = $("#adminPassword").value;
        const confirm = $("#adminPasswordConfirm").value;
        const key = $("#adminCreationKey").value;

        if (password !== confirm) {
          toast("Admin passwords do not match.");
          return;
        }

        const result = createAdminAccount(name, email, password, key);
        if (!result.ok) {
          toast(result.message);
          return;
        }

        setUser(buildSessionFromAccount(result.account, "admin"));
        toast("Admin account created.");
        updateHeaderUserState();
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 250);
      });
    }

    const forgotPasswordForm = $("#forgotPasswordForm");
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const role = ($('input[name="resetRole"]:checked') || {}).value || "reader";
        const email = $("#resetEmail").value;
        const password = $("#resetPassword").value;
        const confirm = $("#resetPasswordConfirm").value;

        if (password !== confirm) {
          toast("The new passwords do not match.");
          return;
        }

        const result = resetPassword(role, email, password);
        if (!result.ok) {
          toast(result.message);
          return;
        }

        forgotPasswordForm.reset();
        toast("Password updated. You can sign in now.");
        showAuthView("signin");
        const roleField = $all('input[name="loginRole"]');
        roleField.forEach((input) => {
          input.checked = input.value === role;
        });
        $("#loginEmail").value = normalizeEmail(email);
        $("#loginPassword").value = "";
      });
    }
  }

  function renderAdminPage() {
    const shell = $("#adminShell");
    if (!shell) return;

    const user = getUser();
    if (!user || user.role !== "admin") {
      shell.innerHTML = `
        <div class="empty-state">
          <h3>Admin access only</h3>
          <p>Please sign in with an admin email and password to manage books, circulation, and accounts.</p>
          <a class="btn" href="login.html">Go to login</a>
        </div>
      `;
      return;
    }

    const books = getAllBooks();
    const readers = getReaders();
    const admins = getAdmins();
    const openLoans = getOpenCirculation();
    const availableBooks = books.filter((book) => book.available);

    const checkoutOptions = availableBooks.length
      ? availableBooks
          .map(
            (book) => `<option value="${escapeHtml(book.id)}">${escapeHtml(book.title)} — ${escapeHtml(book.author)}</option>`
          )
          .join("")
      : `<option value="">No available titles</option>`;

    const readerOptions = readers.length
      ? readers
          .map(
            (reader) => `<option value="${escapeHtml(reader.id)}">${escapeHtml(reader.name)} — ${escapeHtml(reader.email)} (${escapeHtml(reader.memberId)})</option>`
          )
          .join("")
      : `<option value="">No reader accounts yet</option>`;

    const openLoanCards = openLoans.length
      ? openLoans
          .map((loan) => {
            const book = getBookById(loan.bookId);
            if (!book) return "";
            return `
              <article class="account-card">
                <div class="loan-card-head">
                  <div>
                    <span class="label">Open circulation record</span>
                    <h3>${escapeHtml(book.title)}</h3>
                    <p>by ${escapeHtml(book.author)}</p>
                  </div>
                  <span class="pill">Due ${formatDate(loan.dueDate)}</span>
                </div>
                <div class="loan-detail-list">
                  <div><strong>Borrower:</strong> ${escapeHtml(loan.borrowerName)}</div>
                  <div><strong>Email:</strong> ${escapeHtml(loan.borrowerEmail)}</div>
                  <div><strong>Member ID:</strong> ${escapeHtml(loan.memberId)}</div>
                  <div><strong>Checked out:</strong> ${formatDate(loan.checkedOutAt)}</div>
                </div>
                <div class="split-actions">
                  <a class="ghost-link" href="book.html?id=${encodeURIComponent(book.id)}">Open title</a>
                  <button class="btn-secondary js-return-loan" data-loan-id="${escapeHtml(loan.loanId)}">Mark returned</button>
                </div>
              </article>
            `;
          })
          .join("")
      : `<div class="empty-state small admin-empty"><p>No books are currently checked out.</p></div>`;

    const managementCards = books
      .map(
        (book) => `
      <article class="account-card compact-card">
        <div class="management-head">
          <div>
            <span class="label">${escapeHtml(book.collection)}</span>
            <h3>${escapeHtml(book.title)}</h3>
            <p>by ${escapeHtml(book.author)}</p>
          </div>
          <span class="pill">${book.available ? "Available" : "Checked out"}</span>
        </div>
        <div class="meta-list">
          <div><strong>Format:</strong> ${escapeHtml(book.format)}</div>
          <div><strong>Genre:</strong> ${escapeHtml(book.genre)}</div>
          ${
            book.borrower
              ? `<div><strong>Holder:</strong> ${escapeHtml(book.borrower.name)} · ${escapeHtml(book.borrower.email)}</div>
                 <div><strong>Due:</strong> ${formatDate(book.borrower.dueDate)}</div>`
              : `<div><strong>Status:</strong> On shelf and ready for checkout</div>`
          }
        </div>
      </article>
    `
      )
      .join("");

    const readerCards = readers.length
      ? readers
          .map(
            (reader) => `
        <article class="account-card compact-card directory-card">
          <span class="label">Reader account</span>
          <h3>${escapeHtml(reader.name)}</h3>
          <p>${escapeHtml(reader.email)}</p>
          <p class="field-note">${escapeHtml(reader.memberId)}</p>
          <div class="catalog-actions compact">
            <button class="btn-secondary danger-button js-delete-reader" data-reader-id="${escapeHtml(reader.id)}" type="button">Delete reader</button>
          </div>
        </article>
      `
          )
          .join("")
      : `<div class="empty-state small"><p>No reader accounts have been created yet.</p></div>`;

    const adminCards = admins.length
      ? admins
          .map(
            (admin) => `
        <article class="account-card compact-card directory-card ${admin.id === user.id ? "current-admin-card" : ""}">
          <span class="label">Admin account</span>
          <h3>${escapeHtml(admin.name)}</h3>
          <p>${escapeHtml(admin.email)}</p>
          <p class="field-note">${escapeHtml(admin.staffId)}${admin.id === user.id ? " · current session" : ""}</p>
          <div class="catalog-actions compact">
            <button class="btn-secondary danger-button js-delete-admin" data-admin-id="${escapeHtml(admin.id)}" type="button">Delete admin</button>
          </div>
        </article>
      `
          )
          .join("")
      : `<div class="empty-state small"><p>No admin accounts remain.</p></div>`;

    shell.innerHTML = `
      <section class="account-hero">
        <div>
          <div class="eyebrow">Admin desk</div>
          <h2>Circulation, catalog, and account records</h2>
          <p>Use this frontend control center to add books, check titles in and out, view who currently has a book, create future-ready admin workflows, and manage account deletion. Later, these same actions can be connected to your database.</p>
          <p class="account-subline">Signed in as ${escapeHtml(user.name)} · ${escapeHtml(user.email)}</p>
        </div>
        <div class="account-summary">
          <div class="summary-card">
            <span class="label">Catalog size</span>
            <strong>${books.length}</strong>
          </div>
          <div class="summary-card">
            <span class="label">Checked out</span>
            <strong>${openLoans.length}</strong>
          </div>
          <div class="summary-card">
            <span class="label">Accounts</span>
            <strong>${readers.length + admins.length}</strong>
          </div>
        </div>
      </section>

      <section class="admin-layout">
        <div class="admin-grid">
          <article class="admin-panel">
            <span class="label">Catalog management</span>
            <h3>Add a new book</h3>
            <p>This creates a frontend record now and can later be connected to a real database insert.</p>
            <form id="adminAddBookForm" class="admin-form two-col">
              <div class="form-group">
                <label for="adminBookTitle">Title</label>
                <input id="adminBookTitle" required>
              </div>
              <div class="form-group">
                <label for="adminBookAuthor">Author</label>
                <input id="adminBookAuthor" required>
              </div>
              <div class="form-group">
                <label for="adminBookCollection">Collection</label>
                <input id="adminBookCollection" value="Curator's Cabinet">
              </div>
              <div class="form-group">
                <label for="adminBookGenre">Genre</label>
                <input id="adminBookGenre" value="Dark Academia">
              </div>
              <div class="form-group">
                <label for="adminBookFormat">Format</label>
                <select id="adminBookFormat">
                  <option>Hardcover</option>
                  <option>Paperback</option>
                  <option>Journal</option>
                  <option>Archive Copy</option>
                </select>
              </div>
              <div class="form-group">
                <label for="adminBookYear">Publication year</label>
                <input id="adminBookYear" type="number" value="2026">
              </div>
              <div class="form-group">
                <label for="adminBookPages">Pages</label>
                <input id="adminBookPages" type="number" value="320">
              </div>
              <div class="form-group">
                <label for="adminBookCover">Cover image URL</label>
                <input id="adminBookCover" placeholder="Optional image URL">
              </div>
              <div class="form-group full-width">
                <label for="adminBookBlurb">Short blurb</label>
                <textarea id="adminBookBlurb" required></textarea>
              </div>
              <div class="form-group full-width">
                <label for="adminBookDescription">Description</label>
                <textarea id="adminBookDescription" required></textarea>
              </div>
              <div class="full-width split-actions">
                <button class="btn" type="submit">Add book to catalog</button>
                <span class="inline-stat">Frontend-ready for future database hookup</span>
              </div>
            </form>
          </article>

          <article class="admin-panel">
            <span class="label">Circulation desk</span>
            <h3>Check out a book</h3>
            <p>Choose an available title and assign it to an existing reader account so the borrower can be tracked cleanly.</p>
            <form id="adminCheckoutForm" class="admin-form">
              <div class="form-group">
                <label for="checkoutBook">Available title</label>
                <select id="checkoutBook" ${availableBooks.length ? "" : "disabled"}>${checkoutOptions}</select>
              </div>
              <div class="form-group">
                <label for="checkoutReader">Reader account</label>
                <select id="checkoutReader" ${readers.length ? "" : "disabled"}>${readerOptions}</select>
              </div>
              <div class="form-group">
                <label for="checkoutDays">Loan period (days)</label>
                <select id="checkoutDays">
                  <option value="14">14 days</option>
                  <option value="21">21 days</option>
                  <option value="28">28 days</option>
                </select>
              </div>
              <div class="split-actions">
                <button class="btn" type="submit" ${(availableBooks.length && readers.length) ? "" : "disabled"}>Check out book</button>
                <span class="inline-stat">${availableBooks.length} titles available · ${readers.length} reader accounts</span>
              </div>
            </form>

            <div class="notice-banner">
              Admin accounts can be created from the login page with the special admin creation key. Reader and admin accounts can both be deleted below.
            </div>
          </article>
        </div>

        <article class="admin-panel">
          <span class="label">Live status</span>
          <h3>Books currently checked out</h3>
          <div class="loans-grid">${openLoanCards}</div>
        </article>

        <article class="admin-panel">
          <span class="label">Borrower visibility</span>
          <h3>Catalog status and current holder</h3>
          <div class="management-grid">${managementCards}</div>
        </article>

        <article class="admin-panel">
          <span class="label">Account directory</span>
          <h3>Reader and admin accounts</h3>
          <div class="account-registry-grid">
            <div>
              <div class="section-heading section-heading-tight">
                <div>
                  <div class="eyebrow">Readers</div>
                  <h3>${readers.length} reader accounts</h3>
                </div>
              </div>
              <div class="management-grid">${readerCards}</div>
            </div>
            <div>
              <div class="section-heading section-heading-tight">
                <div>
                  <div class="eyebrow">Admins</div>
                  <h3>${admins.length} admin accounts</h3>
                </div>
              </div>
              <div class="management-grid">${adminCards}</div>
            </div>
          </div>
        </article>

        <article class="admin-panel">
          <span class="label">Current admin</span>
          <h3>Account settings</h3>
          <p class="field-note">You can reset passwords from the login page or delete this admin account here if needed.</p>
          <div class="split-actions">
            <a class="ghost-link" href="login.html">Open forgot password</a>
            <button class="btn-secondary danger-button js-delete-current-admin" type="button">Delete current admin account</button>
          </div>
        </article>
      </section>
    `;

    const addForm = $("#adminAddBookForm");
    if (addForm) {
      addForm.addEventListener("submit", (event) => {
        event.preventDefault();
        addBook({
          title: $("#adminBookTitle").value.trim(),
          author: $("#adminBookAuthor").value.trim(),
          collection: $("#adminBookCollection").value.trim(),
          genre: $("#adminBookGenre").value.trim(),
          format: $("#adminBookFormat").value,
          year: $("#adminBookYear").value,
          pages: $("#adminBookPages").value,
          cover: $("#adminBookCover").value.trim(),
          blurb: $("#adminBookBlurb").value.trim(),
          description: $("#adminBookDescription").value.trim()
        });
        addForm.reset();
        $("#adminBookCollection").value = "Curator's Cabinet";
        $("#adminBookGenre").value = "Dark Academia";
        $("#adminBookFormat").value = "Hardcover";
        $("#adminBookYear").value = "2026";
        $("#adminBookPages").value = "320";
      });
    }

    const checkoutForm = $("#adminCheckoutForm");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const bookId = $("#checkoutBook").value;
        const readerId = $("#checkoutReader").value;

        if (!bookId || !readerId) {
          toast("Please choose both a title and a reader account.");
          return;
        }

        checkOutBook(bookId, readerId, $("#checkoutDays").value);
        checkoutForm.reset();
        $("#checkoutDays").value = "14";
      });
    }

    $all(".js-return-loan", shell).forEach((button) => {
      button.addEventListener("click", () => returnLoan(button.dataset.loanId));
    });

    $all(".js-delete-reader", shell).forEach((button) => {
      button.addEventListener("click", () => {
        const reader = findReaderById(button.dataset.readerId);
        if (!reader) return;
        const confirmed = window.confirm(`Delete reader account for ${reader.name}? This will also clear reservations and active loans in this frontend demo.`);
        if (!confirmed) return;
        const result = deleteReaderAccount(reader.id, user.email);
        if (result.ok) {
          toast("Reader account deleted.");
          renderAdminPage();
          renderCatalogPage();
          renderBookDetailPage();
          renderAccountPage();
        }
      });
    });

    $all(".js-delete-admin", shell).forEach((button) => {
      button.addEventListener("click", () => {
        const admin = findAdminById(button.dataset.adminId);
        if (!admin) return;
        const confirmed = window.confirm(`Delete admin account for ${admin.name}?`);
        if (!confirmed) return;
        const result = deleteAdminAccount(admin.id);
        if (result.ok && result.loggedOut) {
          toast("Admin account deleted.");
          updateHeaderUserState();
          setTimeout(() => {
            window.location.href = "login.html";
          }, 250);
          return;
        }
        if (result.ok) {
          toast("Admin account deleted.");
          renderAdminPage();
        }
      });
    });

    const deleteCurrentAdmin = $(".js-delete-current-admin", shell);
    if (deleteCurrentAdmin) {
      deleteCurrentAdmin.addEventListener("click", () => {
        const confirmed = window.confirm("Delete the current admin account?");
        if (!confirmed) return;
        const result = deleteAdminAccount(user.id);
        if (result.ok) {
          toast("Admin account deleted.");
          updateHeaderUserState();
          setTimeout(() => {
            window.location.href = "login.html";
          }, 250);
        }
      });
    }
  }

  function activateNav() {
    const page = document.body.dataset.page;
    $all("[data-nav]").forEach((link) => {
      if (link.dataset.nav === page) {
        link.classList.add("active-link");
      }
    });
  }

async function init() {
  ensureSeedData();
  setYear();
  activateNav();
  handleHomepageSearch();
  handleLoginPage();
  updateHeaderUserState();

  await fetchBooksFromApi();

  renderTopPicks();
  renderCatalogPage();
  renderBookDetailPage();
  renderAccountPage();
  renderRecommendationsPage();
  renderAdminPage();
  refreshReservationButtons();
}

document.addEventListener("DOMContentLoaded", () => {
  init();
});
})();
