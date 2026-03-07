//Temporary Data
window.LibraryData = {
  books: [
    {
      id: "the-secret-history",
      title: "The Secret History",
      author: "Donna Tartt",
      collection: "Midnight Stacks",
      genre: "Dark Academia",
      format: "Hardcover",
      year: 1992,
      pages: 559,
      available: true,
      rating: 4.8,
      cover: "https://m.media-amazon.com/images/I/81YhQfeiynL._AC_UF1000,1000_QL80_.jpg",
      accent: "gold",
      blurb: "A circle of brilliant classics students drifts from beauty into obsession and murder.",
      description: "A defining modern dark academia novel filled with intellect, ritual, secrecy, and moral collapse."
    },
    {
      id: "if-we-were-villains",
      title: "If We Were Villains",
      author: "M. L. Rio",
      collection: "Curator's Cabinet",
      genre: "Literary Mystery",
      format: "Paperback",
      year: 2017,
      pages: 368,
      available: true,
      rating: 4.6,
      cover: "https://m.media-amazon.com/images/I/71OLMCvcWXL._AC_UF1000,1000_QL80_.jpg",
      accent: "burgundy",
      blurb: "Shakespeare, rivalry, ambition, and a murder that haunts a theatrical group.",
      description: "A moody campus mystery for readers who love performance, betrayal, and intense artistic friendships."
    },
    {
      id: "rebecca",
      title: "Rebecca",
      author: "Daphne du Maurier",
      collection: "Heritage Picks",
      genre: "Gothic",
      format: "Hardcover",
      year: 1938,
      pages: 448,
      available: false,
      rating: 4.7,
      cover: "https://m.media-amazon.com/images/I/91ziTMetVcL.jpg",
      accent: "green",
      blurb: "A young bride enters Manderley and finds herself trapped in the shadow of Rebecca.",
      description: "Elegant, atmospheric, and haunting, this is one of the great gothic novels of the twentieth century."
    },
    {
      id: "the-picture-of-dorian-gray",
      title: "The Picture of Dorian Gray",
      author: "Oscar Wilde",
      collection: "Midnight Stacks",
      genre: "Classic Gothic",
      format: "Hardcover",
      year: 1890,
      pages: 254,
      available: true,
      rating: 4.5,
      cover: "https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781625587534/the-picture-of-dorian-gray-9781625587534_hr.jpg",
      accent: "gold",
      blurb: "Beauty, decadence, corruption, and a portrait that records the soul.",
      description: "A sharp, stylish classic perfect for readers drawn to aesthetics, philosophy, and darkness."
    },
    {
      id: "the-name-of-the-rose",
      title: "The Name of the Rose",
      author: "Umberto Eco",
      collection: "Archive Hall",
      genre: "Historical Mystery",
      format: "Paperback",
      year: 1980,
      pages: 536,
      available: true,
      rating: 4.4,
      cover: "https://m.media-amazon.com/images/I/8116+Fd8+XL.jpg",
      accent: "burgundy",
      blurb: "A scholar investigates murders in a labyrinthine monastery library.",
      description: "Dense, cerebral, and richly atmospheric, this novel is ideal for readers who love manuscripts and mystery."
    },
    {
      id: "jane-eyre",
      title: "Jane Eyre",
      author: "Charlotte Brontë",
      collection: "Heritage Picks",
      genre: "Gothic Classic",
      format: "Hardcover",
      year: 1847,
      pages: 532,
      available: true,
      rating: 4.8,
      cover: "https://m.media-amazon.com/images/I/91zU70Aw9IS._AC_UF1000,1000_QL80_.jpg",
      accent: "green",
      blurb: "A fiercely intelligent heroine navigates love, duty, and the secrets of Thornfield Hall.",
      description: "A foundational gothic classic with emotional depth, intelligence, and unforgettable atmosphere."
    },
    {
      id: "the-historian",
      title: "The Historian",
      author: "Elizabeth Kostova",
      collection: "Archive Hall",
      genre: "Historical Gothic",
      format: "Hardcover",
      year: 2005,
      pages: 704,
      available: true,
      rating: 4.5,
      cover: "https://m.media-amazon.com/images/I/916rnhUsGvL._AC_UF1000,1000_QL80_.jpg",
      accent: "burgundy",
      blurb: "Letters, archives, and scholarship lead into a centuries-old hunt for Dracula.",
      description: "A sweeping literary gothic full of libraries, research trails, and old-world tension."
    },
    {
      id: "stoner",
      title: "Stoner",
      author: "John Williams",
      collection: "Upper Gallery",
      genre: "Campus Fiction",
      format: "Paperback",
      year: 1965,
      pages: 288,
      available: true,
      rating: 4.7,
      cover: "https://m.media-amazon.com/images/I/71Byh1PvwpL._UF1000,1000_QL80_.jpg",
      accent: "green",
      blurb: "A quiet and devastating portrait of a life devoted to literature and teaching.",
      description: "Perfect for readers who love the inward, melancholic, deeply human side of academia."
    },
    {
      id: "babel",
      title: "Babel",
      author: "R. F. Kuang",
      collection: "Scholars' Wing",
      genre: "Historical Fantasy",
      format: "Hardcover",
      year: 2022,
      pages: 545,
      available: false,
      rating: 4.7,
      cover: "https://m.media-amazon.com/images/I/A1lv97-jJoL._AC_UF1000,1000_QL80_.jpg",
      accent: "gold",
      blurb: "Translation, empire, language, and revolution collide at Oxford.",
      description: "A grand, intellectual fantasy with a strong dark academic atmosphere and beautiful linguistic detail."
    },
    {
      id: "ninth-house",
      title: "Ninth House",
      author: "Leigh Bardugo",
      collection: "Midnight Stacks",
      genre: "Dark Fantasy",
      format: "Hardcover",
      year: 2019,
      pages: 458,
      available: true,
      rating: 4.3,
      cover: "https://m.media-amazon.com/images/I/81pqCEtTAgL.jpg",
      accent: "burgundy",
      blurb: "Secret societies at Yale hide occult power, violence, and buried truths.",
      description: "A darker, modern campus fantasy with ghosts, mystery, and elite academic rituals."
    },
    {
      id: "frankenstein",
      title: "Frankenstein",
      author: "Mary Shelley",
      collection: "Heritage Picks",
      genre: "Classic Gothic",
      format: "Paperback",
      year: 1818,
      pages: 280,
      available: true,
      rating: 4.6,
      cover: "https://m.media-amazon.com/images/I/710p9SUfZtL._AC_UF1000,1000_QL80_.jpg",
      accent: "green",
      blurb: "Ambition, creation, isolation, and the cost of forbidden knowledge.",
      description: "A brilliant gothic classic that blends philosophy, science, and emotional intensity."
    },
    {
      id: "wuthering-heights",
      title: "Wuthering Heights",
      author: "Emily Brontë",
      collection: "Heritage Picks",
      genre: "Gothic Classic",
      format: "Hardcover",
      year: 1847,
      pages: 416,
      available: true,
      rating: 4.3,
      cover: "https://m.media-amazon.com/images/I/81dvA4tU0rL._AC_UF1000,1000_QL80_.jpg",
      accent: "burgundy",
      blurb: "Passion, revenge, and desolate moors shape this fierce gothic classic.",
      description: "For readers who want emotional intensity, wild atmosphere, and unforgettable darkness."
    },
    {
      id: "brideshead-revisited",
      title: "Brideshead Revisited",
      author: "Evelyn Waugh",
      collection: "Curator's Cabinet",
      genre: "Literary Classic",
      format: "Paperback",
      year: 1945,
      pages: 351,
      available: false,
      rating: 4.4,
      cover: "https://m.media-amazon.com/images/I/817sQZvIkbL.jpg",
      accent: "gold",
      blurb: "Memory, Oxford, privilege, and yearning unfold in luminous prose.",
      description: "A beautiful and melancholic novel with one of the strongest old-world academic atmospheres."
    },
    {
      id: "possession",
      title: "Possession",
      author: "A. S. Byatt",
      collection: "Archive Hall",
      genre: "Literary Fiction",
      format: "Hardcover",
      year: 1990,
      pages: 576,
      available: true,
      rating: 4.3,
      cover: "https://m.media-amazon.com/images/I/915umJovBAL._AC_UF1000,1000_QL80_.jpg",
      accent: "gold",
      blurb: "Scholars uncover letters and secrets that reshape literary history.",
      description: "An ideal pick for readers who love archives, research, romance, and intellectual mystery."
    },
    {
      id: "the-shadow-of-the-wind",
      title: "The Shadow of the Wind",
      author: "Carlos Ruiz Zafón",
      collection: "Archive Hall",
      genre: "Literary Mystery",
      format: "Paperback",
      year: 2001,
      pages: 487,
      available: true,
      rating: 4.7,
      cover: "https://m.media-amazon.com/images/I/913DdP7RflL.jpg",
      accent: "burgundy",
      blurb: "A boy discovers a forgotten book and follows its mystery through gothic Barcelona.",
      description: "A lush literary mystery for readers who want libraries, secrets, and beautifully layered storytelling."
    },
    {
      id: "the-bell-jar",
      title: "The Bell Jar",
      author: "Sylvia Plath",
      collection: "Upper Gallery",
      genre: "Classic Fiction",
      format: "Paperback",
      year: 1963,
      pages: 288,
      available: true,
      rating: 4.2,
      cover: "https://m.media-amazon.com/images/I/71SNjl0fA7L._AC_UF1000,1000_QL80_.jpg",
      accent: "green",
      blurb: "A sharp, intimate novel about ambition, identity, and pressure.",
      description: "A modern classic with emotional depth that fits beautifully within a literary, introspective collection."
    },
    {
      id: "northanger-abbey",
      title: "Northanger Abbey",
      author: "Jane Austen",
      collection: "Heritage Picks",
      genre: "Classic",
      format: "Paperback",
      year: 1817,
      pages: 288,
      available: true,
      rating: 4.2,
      cover: "https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1388201718i/50398.jpg",
      accent: "gold",
      blurb: "A witty, clever satire of gothic reading and imaginative young minds.",
      description: "A lighter classic that still keeps the abbey mood, literary charm, and antique atmosphere."
    },
    {
      id: "the-birth-of-tragedy",
      title: "The Birth of Tragedy",
      author: "Friedrich Nietzsche",
      collection: "Scholars' Wing",
      genre: "Philosophy",
      format: "Paperback",
      year: 1872,
      pages: 160,
      available: true,
      rating: 4.1,
      cover: "https://cdn.kobo.com/book-images/409b8436-7ee0-4435-afcc-f59b5c84724c/1200/1200/False/the-birth-of-tragedy-12.jpg",
      accent: "burgundy",
      blurb: "A dramatic philosophical work on art, myth, tragedy, and culture.",
      description: "For readers who want theory, intensity, and a more scholarly edge to their reading history."
    },
    {
      id: "the-likeness",
      title: "The Likeness",
      author: "Tana French",
      collection: "Curator's Cabinet",
      genre: "Literary Mystery",
      format: "Hardcover",
      year: 2008,
      pages: 466,
      available: false,
      rating: 4.2,
      cover: "https://m.media-amazon.com/images/I/51Pzvsk-2cL._AC_UF1000,1000_QL80_.jpg",
      accent: "green",
      blurb: "A detective enters an insular intellectual house after a murder.",
      description: "A smart, atmospheric mystery with intense group dynamics and strong academic-adjacent energy."
    },
    {
      id: "a-separate-peace",
      title: "A Separate Peace",
      author: "John Knowles",
      collection: "Upper Gallery",
      genre: "Campus Fiction",
      format: "Paperback",
      year: 1959,
      pages: 204,
      available: true,
      rating: 4.1,
      cover: "https://cdn1.bookmanager.com/i/m.php?b=eD19rNOeXfE9Pr41YhwR8A&cb=1558215657",
      accent: "gold",
      blurb: "Friendship, envy, and loss unfold within the cloistered world of a New England school.",
      description: "A reflective school novel with emotional tension, memory, and a beautifully classical setting."
    },
    {
      id: "the-maidens",
      title: "The Maidens",
      author: "Alex Michaelides",
      collection: "Midnight Stacks",
      genre: "Psychological Thriller",
      format: "Hardcover",
      year: 2021,
      pages: 352,
      available: true,
      rating: 4.0,
      cover: "https://m.media-amazon.com/images/I/81K05pTbJUL._UF1000,1000_QL80_.jpg",
      accent: "burgundy",
      blurb: "A therapist investigates a murder linked to a secretive Cambridge society.",
      description: "A sleek academic thriller with classical references, obsession, and campus atmosphere."
    }
  ],

  recommendationPools: {
    classics: {
      default: [
        "the-secret-history",
        "if-we-were-villains",
        "rebecca",
        "jane-eyre",
        "the-picture-of-dorian-gray"
      ],
      gothic: [
        "rebecca",
        "jane-eyre",
        "frankenstein",
        "wuthering-heights",
        "the-picture-of-dorian-gray"
      ],
      poetry: [
        "the-bell-jar",
        "stoner",
        "brideshead-revisited"
      ],
      history: [
        "the-name-of-the-rose",
        "the-historian",
        "babel",
        "possession"
      ],
      philosophy: [
        "the-birth-of-tragedy",
        "the-picture-of-dorian-gray",
        "babel"
      ],
      mystery: [
        "if-we-were-villains",
        "the-shadow-of-the-wind",
        "the-likeness",
        "the-maidens"
      ],
      academia: [
        "the-secret-history",
        "if-we-were-villains",
        "stoner",
        "brideshead-revisited",
        "babel"
      ]
    },

    history: {
      default: [
        "the-name-of-the-rose",
        "the-historian",
        "babel",
        "possession",
        "the-shadow-of-the-wind"
      ],
      gothic: [
        "rebecca",
        "frankenstein",
        "the-historian"
      ],
      poetry: [
        "brideshead-revisited",
        "the-bell-jar"
      ],
      history: [
        "the-name-of-the-rose",
        "the-historian",
        "babel",
        "possession"
      ],
      philosophy: [
        "the-birth-of-tragedy",
        "babel"
      ],
      mystery: [
        "the-name-of-the-rose",
        "the-shadow-of-the-wind",
        "the-likeness"
      ],
      academia: [
        "possession",
        "stoner",
        "the-secret-history"
      ]
    },

    student: {
      default: [
        "the-secret-history",
        "if-we-were-villains",
        "stoner",
        "babel",
        "a-separate-peace"
      ],
      gothic: [
        "ninth-house",
        "rebecca",
        "jane-eyre"
      ],
      poetry: [
        "the-bell-jar",
        "brideshead-revisited",
        "stoner"
      ],
      history: [
        "babel",
        "the-name-of-the-rose",
        "possession"
      ],
      philosophy: [
        "the-birth-of-tragedy",
        "babel"
      ],
      mystery: [
        "if-we-were-villains",
        "the-maidens",
        "the-likeness"
      ],
      academia: [
        "the-secret-history",
        "if-we-were-villains",
        "stoner",
        "ninth-house",
        "a-separate-peace"
      ]
    }
  }
};