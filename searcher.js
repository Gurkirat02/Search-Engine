const elasticlunr = require('elasticlunr');
const fruits_sql = require('./sql/fruits_sql.js');

var index = elasticlunr(function () {
    this.addField('title');
    this.addField('content');
    this.setRef('link');
});



function search(pages, search, limit, boost) {
    //console.log(pages);
    
    for(page of pages) {
        index.addDoc(page);
    }
    //index.saveDocument(true);
    let searchData = index.search(search, {
        fields: {
            "title": {boost:10},
            "content": {boost:1}
        }
    });
    //console.log(searchData);
    if(boost) {
        for(data of searchData) {
            let boostedScore = data.score*((100*index.documentStore.getDoc(data.ref).pagerank)+1); //calculate page rank boost score, this formula should work well
            data.score = boostedScore;
        }

        searchData.sort(function (a,b) {
            if(a.score > b.score) return -1;
            else if(b.score > a.score) return 1;
            return 0;
        });
    }
    //console.log(searchData);
    return buildResults(searchData, pages, limit);
    
}

function buildResults(data, pages, limit) {
    //console.log(data);
    let results = {};
    for(a of data) {
        if(Object.keys(results).length >= limit) return results;
        results[a.ref] = index.documentStore.getDoc(a.ref);
        results[a.ref].score = a.score;
    }

    
    if(Object.keys(results).length < limit) {
        for(page of pages) {
            if(!(page.link in results)){
                results[page.link] = page;
                results[page.link].score = 0;
            }
            if(Object.keys(results).length >= limit) break;
        }
    }
    return results;
    
}

function testSearch() {
    console.log((search("apple")));
    //index.documentStore.getDoc(search("apple").at(0).ref);
}


//testSearch();

module.exports = {
    search
}