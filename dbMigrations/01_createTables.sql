CREATE TABLE IF NOT EXISTS careerPage (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    html TEXT NOT NULL,
    innerText TEXT NOT NULL,
    date INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS hyperlinks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    careerPageId TEXT NOT NULL,
    url TEXT,
    innerText TEXT,
    isJobPosting INTEGER NOT NULL,
    jobTitle TEXT,
    jobLocation TEXT,
    FOREIGN KEY (careerPageId) REFERENCES careerPage(id)
);

CREATE INDEX idx_hyperlinks_careerPageId ON hyperlinks(careerPageId);
CREATE INDEX idx_hyperlinks_isJobPosting ON hyperlinks(isJobPosting);
