//Required module (install via NPM - npm install crawler)
const Crawler = require("crawler");
const url = require('node:url');
const personal_sql = require('../sql/personal_sql.js');
const pagerank = require('../pagerank.js');

let number = 998; //why not


function doCrawl() {
    let visited = {};

    const c = new Crawler({
        maxConnections : 2, //use this for parallel, rateLimit for individual
        //rateLimit: 1000,

        // This will be called for each crawled page
        callback : function (error, res, done) {
            if(error){
                console.log(error);
                //only read html
            }else if(res.headers["content-type"] != undefined && res.headers["content-type"].includes("text/html")){
                current = res.request.uri.href;
                //console.log(res.request);
                //console.log(current); //log current page
                let $ = res.$; //get cheerio data, see cheerio docs for info
                let links = $("a"); //get all links from page
                let title = $('title').first().text();
                let content = $('div[class="mw-parser-output"]').text().trim();

                if(visited[current] === undefined) visited[current] = {"title":"", "content":"", "links":[]};
                
                visited[current].title = title;
                visited[current].content = content.trim();


                let currentPage = {};
                currentPage.link = current;
                if(title === undefined) {
                    title = "";
                } else {
                    currentPage.title = title;
                }
                if(content === undefined) {
                    content = "";
                } else {
                    currentPage.content = content;
                }
                
                //remove extra characters
                let words = content.toLowerCase().split(/[ ,.\n•◦\(\)\[\]]+/);
                
                //sql insert
                personal_sql.insertPage(currentPage);

                let wordCounts = wordCount(words);

                personal_sql.insertWordCounts(current, wordCounts);

            
                //console.log(links);
                $(links).each(function(i, link){
                    if(($(link).attr('href') !== undefined)) {
                        
                        //resolve the link so the crawler may add it to the queue
                        let temp = new URL(url.resolve(current, $(link).attr('href')));
                        temp.hash = '';

                        let nextLink = String(temp);
                        //console.log(nextLink);
                    
                        if(isWikiUrl(nextLink)) {
                            if(visited[nextLink] === undefined && number > 0) {
                                --number;
                                visited[nextLink] = {"title":"", "content":"", "links":[]};
                                visited[current].links.push(nextLink);
                                c.queue(nextLink);
                            } else if (visited[nextLink] !== undefined){
                                visited[current].links.push(nextLink);
                            }
                        }

                    }
                });
            }
            done();
        }
    })

    //Perhaps a useful event
    //Triggered when the queue becomes empty
    //There are some other events, check crawler docs
    c.on('drain',function(){
        //console.log("done");
        //personal_sql.insertAllPages(visited);
        personal_sql.insertAllLinks(visited);
        let pages = personal_sql.selectAllPages();
        let linkObjs = personal_sql.selectAllLinksAsObject();
        let pr = pagerank.calculatePageRank(pages, linkObjs);
        personal_sql.updatePageRanks(pages, pr);
        
        return visited;
    });

    //Queue a URL, which starts the crawl
    let firstLink = "https://bg3.wiki/";
    visited[firstLink] = {"title":"", "content":"", "links":[]};
    c.queue(firstLink);
}

function wordCount(words) {
    let wordCounts = {};
    for(word of words) {
        if(word === undefined || word.trim() === '') continue;
        if(wordCounts[word] === undefined) {
            wordCounts[word] = 1;
        } else {
            wordCounts[word] += 1;
        }
    }

    return wordCounts
}

function isWikiUrl(str) {
    if(str === undefined) return false;
    //limit to only home page and /wiki (since they are the most relevant)
    return ((str.startsWith("https://bg3.wiki/wiki") || str.startsWith("bg3.wiki/wiki")) && (str.lastIndexOf(':') === 5) || str === "https://bg3.wiki/");
}

doCrawl();