import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

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

app.post("/sort", async (req, res) => {
  try {
    let sortType = req.body.sortType;
    let dbRes;
    if(sortType === "title"){
      dbRes = await db.query("SELECT * FROM books ORDER BY title ASC");
    } else if (sortType === "newest") {
      dbRes = await db.query("SELECT * FROM books ORDER BY readdate DESC");
    } else if (sortType === "best") {
      dbRes = await db.query("SELECT * FROM books ORDER BY recomendationratio DESC");
    }
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

app.post("/edit", async (req,res) => {
  const id = req.body.bookId;
  try {
    const dbRes = await db.query("SELECT * FROM books WHERE id = $1",[id]);
    let book = dbRes.rows[0];
    console.log(book);
    let date = getFormattedDate(book.readdate);
    book.date = date;
    res.render("edit.ejs", {
      book: book
    })
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
});

app.post("/editDetails", async (req, res) => {
  const updatedId = req.body.updatedBookId;
  const updatedDescription = req.body.updatedBookDescription.trim();
  const updatedNotes = req.body.updatedBookNotes.trim();
  try {
    await db.query(
      "UPDATE books SET description = $1, notes = $2  WHERE id = $3",
      [updatedDescription,updatedNotes,updatedId]
    );
    res.redirect("/");
  } catch (err) {
    console.error("Error updating book details.", err.stack);
  }
});

app.post("/delete", async (req, res) => {
  const deletedItemId = req.body.deletedBookId;
  try {
    await db.query(
      "DELETE FROM books WHERE id = $1",[deletedItemId]);
      res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});