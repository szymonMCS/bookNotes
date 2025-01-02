import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import { stringify } from "querystring";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book-notes",
  password: "qwerty123",
  port: 5432,
});

db.connect();

function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

app.get("/", async (req, res) => {
  try {
    const dbRes = await db.query("SELECT * FROM books");
    let books = dbRes.rows;
    books.forEach((book) => {
      let date = getFormattedDate(book.readdate);
      book.date = date;
      console.log(date);
    })
    console.log(books);
    res.render("index.ejs", {
      books: books
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});