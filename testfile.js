const url = require('url');


const link = new URL(url.resolve("https://bg3.wiki/", "https://www.dndbeyond.com/claim/"));


link.search = '';
link.hash = ''


function isWikiUrl(str) {
    if(str === undefined) return false;
    return (str.startsWith("https://bg3.wiki") || str.startsWith("bg3.wiki"));
}



console.log(isWikiUrl(String(link)));