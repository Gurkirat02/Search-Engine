
//Required module (install via NPM - npm install crawler)
const Crawler = require("crawler");
const url = require('node:url');
const fruits_sql = require('../sql/fruits_sql.js');
const pagerank = require('../pagerank.js');


function doCrawl() {
    let visited = {};

    const c = new Crawler({
        maxConnections : 10, //use this for parallel, rateLimit for individual
        //rateLimit: 1000,

        // This will be called for each crawled page
        callback : function (error, res, done) {
            if(error){
                console.log(error);
            }else{
                current = res.request.uri.href;
                //console.log(current); //log current page
                let $ = res.$; //get cheerio data, see cheerio docs for info
                let links = $("a") //get all links from page
                let title = $('title').first().text();
                let content = $('p').first().text();
                visited[current].title = title;
                visited[current].content = content;


                let currentPage = {};
                currentPage.link = current;
                currentPage.title = title;
                currentPage.content = content;

                let words = content.split(/[ ,.\n•◦]+/);
                
                //sql insert
                fruits_sql.insertPage(currentPage);

                let wordCounts = wordCount(words);


                fruits_sql.insertWordCounts(current, wordCounts);
            

                $(links).each(function(i, link){
                    //resolve the link so the crawler may add it to the queue
                    let nextLink = url.resolve(current, $(link).attr('href'));
                    //console.log(nextLink);
                    
                    if(visited[nextLink] == undefined) {
                        visited[nextLink] = {"title":"", "content":"", "links":[]};
                        c.queue(nextLink);
                    } 
                    visited[current].links.push(nextLink);
                    //fruits_sql.insertLink(current, nextLink);
                });
            }
            done();
        }
    });

    //Perhaps a useful event
    //Triggered when the queue becomes empty
    //There are some other events, check crawler docs
    c.on('drain',function(){
        //console.log(visited); //this is horrendously slow
        //fruits_sql.insertAllPages(visited);
        fruits_sql.insertAllLinks(visited);
        let pages = fruits_sql.selectAllPages();
        let linkObjs = fruits_sql.selectAllLinksAsObject();
        let pr = pagerank.calculatePageRank(pages, linkObjs);
        fruits_sql.updatePageRanks(pages, pr);
        //console.log(pr);
    });

    //Queue a URL, which starts the crawl
    let firstLink = "https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html";
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

doCrawl();