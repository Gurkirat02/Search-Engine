let db = require('better-sqlite3')('database.db', { verbose: console.log });

const sql = "DROP TABLE IF EXISTS fruits_pages;\n" +
	"CREATE TABLE fruits_pages (\n" +
	"    link TEXT NOT NULL PRIMARY KEY,\n" +
	"    title TEXT,\n" +
	"    content TEXT,\n" +
	"    pagerank REAL DEFAULT 0\n" +
	");\n" +
	"\n" +
	"DROP TABLE IF EXISTS fruits_links;\n" +
	"CREATE TABLE fruits_links (\n" +
	"    origin TEXT NOT NULL REFERENCES fruits_pages(link) ON DELETE CASCADE,\n" +
	"    destination TEXT NOT NULL REFERENCES fruits_pages(link) ON DELETE CASCADE, \n" +
	"    PRIMARY KEY (origin, destination)\n" +
	");\n" +
	"\n" +
	"DROP TABLE IF EXISTS fruits_wordcount;\n" +
	"CREATE TABLE fruits_wordcount (\n" +
	"    link TEXT NOT NULL REFERENCES fruits_pages(link) ON DELETE CASCADE,\n" +
	"    word TEXT NOT NULL, \n" +
	"    frequency INTEGER NOT NULL, \n" +
	"    PRIMARY KEY (link, word)\n" +
	");\n" +
	"DROP TABLE IF EXISTS personal_pages;\n" +
	"CREATE TABLE personal_pages (\n" +
	"    link TEXT NOT NULL PRIMARY KEY,\n" +
	"    title TEXT,\n" +
	"    content TEXT,\n" +
	"    pagerank REAL DEFAULT 0\n" +
	");\n" +
	"\n" +
	"DROP TABLE IF EXISTS personal_links;\n" +
	"CREATE TABLE personal_links (\n" +
	"    origin TEXT NOT NULL REFERENCES personal_pages(link) ON DELETE CASCADE,\n" +
	"    destination TEXT NOT NULL REFERENCES personal_pages(link) ON DELETE CASCADE, \n" +
	"    PRIMARY KEY (origin, destination)\n" +
	");\n" +
	"\n" +
	"DROP TABLE IF EXISTS personal_wordcount;\n" +
	"CREATE TABLE personal_wordcount (\n" +
	"    link TEXT NOT NULL REFERENCES personal_pages(link) ON DELETE CASCADE,\n" +
	"    word TEXT NOT NULL, \n" +
	"    frequency INTEGER NOT NULL, \n" +
	"    PRIMARY KEY (link, word)\n" +
	");\n"
	
	;
db.exec(sql);
