let db = require('better-sqlite3')('database.db', { verbose: console.log });

function insertAllPages(pages) {
    const insertPages = db.prepare("INSERT OR REPLACE INTO fruits_pages (link, title, content) values (?, ?, ?)");
    const insertMany = db.transaction( (pages) =>{
        for(page in pages) {
            insertPages.run(page, pages[page].title ,pages[page].content);
        }
    });
    insertMany(pages);
}

function insertPage(page) {
    console.log(page);
    const insertPage = db.prepare("INSERT OR REPLACE INTO fruits_pages (link, title, content) values (?, ?, ?)");
    return insertPage.run(String(page.link), String(page.title), String(page.content));
}

function insertAllLinks(pages) {
    const insertLinks = db.prepare("INSERT OR REPLACE INTO fruits_links (origin, destination) values (?, ?)"); 
    const insertMany = db.transaction( (pages) =>{
        for(page in pages) {
            for(link of pages[page].links)
                insertLinks.run(page, link);
        }
    });
    insertMany(pages);
}

function insertLink(origin, destination) {
    const insertLink = db.prepare("INSERT OR REPLACE INTO fruits_links (origin, destination) values (?, ?)"); 
    console.log("aaaaaa "+ origin + " " + destination);
    return insertLink.run(origin, destination);
}

function insertWordCounts(link, wordCount) {
    const insertWordCount = db.prepare("INSERT OR REPLACE INTO fruits_wordcount (link, word, frequency) values (?, ?, ?)"); 
    const insertMany = db.transaction( (wordCount) =>{
        for(word in wordCount) {
            insertWordCount.run(link, word, wordCount[word]);
        }
    });
    insertMany(wordCount);
}

function selectAllLinks() {
    const incomingLinks = db.prepare('SELECT origin, destination FROM fruits_links').all();
    return incomingLinks;
}

function selectPopular() {
    const query = db.prepare("SELECT COUNT(origin) as incoming, destination as link FROM fruits_links GROUP BY destination ORDER BY incoming DESC LIMIT 10;");
    return query.all();
}

function selectLink(id) {
    const pageInfo = db.prepare('SELECT * FROM fruits_pages WHERE link = ?').get(id); 
    const incomingLinks = db.prepare('SELECT Origin FROM fruits_links WHERE Destination = ?').all(id);
    return {
        url: pageInfo.link,
        title: pageInfo.title,
        content: pageInfo.content,
        incomingLinks: incomingLinks.map(link => link.origin)
    };
}

function selectAllPages() {
    const query = db.prepare('SELECT * FROM fruits_pages');
    return query.all();
}

function selectAllLinksAsObject() {
    let links = selectAllLinks();
    let linksObject = {}

    for(link of links) {
        if(linksObject[link.origin] === undefined) {
            linksObject[link.origin] = {destinations:new Set()};
        }
        linksObject[link.origin].destinations.add(link.destination);
    }
    //return an object with the links as keys, and the values as an object with a single key called 'destinations', which is a set of links (strings) that are
    //the outgoing links from the key

    return linksObject;

}

function updatePageRanks(pages, pagerank) {
    const query = db.prepare('UPDATE fruits_pages SET pagerank = ? WHERE link = ?');
    const updateMany = db.transaction( () =>{

        for(i = 0; i<pagerank.length; ++i) {
            query.run(pagerank[i], pages[i].link);

        }
    });
    updateMany();
}

module.exports = {
    insertAllPages,
    insertAllLinks,
    selectPopular,
    selectLink,
    selectAllPages,
    selectAllLinks,
    selectAllLinksAsObject,
    insertLink,
    insertPage,
    insertWordCounts,
    updatePageRanks
};
