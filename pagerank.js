const { Matrix } = require("ml-matrix");

function toAdjacencyMatrix(pages, links) {
    let adj = Array.from(Array(pages.length), _ => Array(pages.length).fill(0));
    
    for(let i = 0; i < pages.length; ++i) {
        for(let j = 0; j < pages.length; ++j) {
            let origin = pages[i].link;
            let destination = pages[j].link;

            //check if page at index i has page at index j as outgoing link
            if(links[origin] && links[origin].destinations.has(destination)) {
                adj[i][j] = 1;
            }
        }
    }

    //console.log('Adjacency Matrix:', adj);
    return new Matrix(adj);
}


/*
since we multiply the teleportation matrix by alpha and the adjacency matrix by 1-alpha,
a higher alpha value would make the pageranks more uniform and closer to each other since
the teleportation matrix has all values the same in it.
*/
function calculatePageRank(pages, links, alpha = 0.1, epsilon = 0.0001) {
    let adjMatrix = toAdjacencyMatrix(pages, links);

    //num rows
    let n = adjMatrix.rows;


    for (let i = 0; i < n; i++) {
        let sum = adjMatrix.getRow(i).reduce((a, b) => a + b, 0); 

        //console.log(sum);
        if (sum === 0) {
            adjMatrix.setRow(i, Array(n).fill(1));  //fill a row with 1, divide laters
        } else {
            
        }
    }

    //divide each num in the row by the number of 1s in said row
     //do it here to not mess with the zero replacement
     //will account for the replaced rows from earlier
     let colSum = adjMatrix.sum('row');
     //console.log(colSum);
     adjMatrix = adjMatrix.divColumnVector(colSum); 

    //matrix of 1/num. pages to be used as the "teleportation chance"
    //multiplied by alpha/N
    let teleportation = Matrix.ones(n, n).mul(alpha/ n);
    //console.log(teleportation);


    //adjacency matrix multiplied by 1-alpha, to be added together with the teleportation matrix
    let complement = adjMatrix.mul(1 - alpha);
    //console.log(complement);
    let modifiedAdjMatrix = teleportation.add(complement);

    //initiate vector [1/n, 1/n, ...] as the first value for pagerank calculation
    //this seems to be the vector that was used to generate the examples for the lab
    let pageRank = Matrix.ones(1, n).div(n);
    //console.log(pageRank);

    //alternative option that was recommended in the lecture: [1, 0, 0, ...]
    //let pageRank = Matrix.zeros(1, n);
    //pageRank.set(0,0,1);


    //console.log(modifiedAdjMatrix);
    let delta;
    
    do {
        //iterate over and over again to get closer to the pagerank
        let newPageRank = pageRank.mmul(modifiedAdjMatrix);
        delta = distance(pageRank.to1DArray(), newPageRank.to1DArray());
        pageRank = newPageRank;
        //console.log(delta);
        //exit when the euclidean distance between vectors is lower than some value
    } while (delta > epsilon);


    /*
    for(let i = 0; i < 25; i++){
        let newPageRank = pageRank.mmul(modifiedAdjMatrix);
        let d = distance(pageRank.to1DArray(), newPageRank.to1DArray());
        console.log(d);
        pageRank = newPageRank;
    }*/


    return pageRank.to1DArray();
}


//euclidean distance calculator
function distance(v1, v2) {
    let d = 0.0;
    for(i = 0; i < v1.length; ++ i) {
        d+= (v1[i] - v2[i]) * (v1[i] - v2[i]);
    }
    return Math.sqrt(d);
}

/*
function test() {
    let pages = sql.selectAllPages();
    let pageRank = calculatePageRank(pages, sql.selectAllLinksAsObject());  
    sql.updatePageRanks(pages, pageRank);

    let output = sql.smallSelectPages();

    console.log(output);

    console.log("PageRank:", pageRank);  

}

test();
*/

module.exports = {
    calculatePageRank
}
