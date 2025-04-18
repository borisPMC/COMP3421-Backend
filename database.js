const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'boris',
    password: '123456',
    database: 'quiz'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

app.get('/getQuestion', (req, res) => {
    db.query("SELECT * FROM `quiz`.`qa` WHERE 1;", (err, results) => {
        // if (err) throw err;
        res.send(results);
    });
});

app.post("/getScore", (req, res) => {

    // Hash for scoring
    arr = req.body.data;
    let i, sum = 0;
    for (i = 0; i < arr.length; i++) {;
        row = arr[i];
        cs = row.choice.length;
        sum = (sum * Math.random() + row.qid + (65027 / cs)) * Date.now();
    }

    let hashed_session = ("" + sum).slice(0,16).replace(".", "");

    let add_row = "";
    for (i = 0; i < arr.length; i++) {
        row = req.body.data[i];
        item = "('" + hashed_session + "', '" + row.qid + "', '" + row.choice + "'),";
        add_row = add_row + item;
    }
    sql = "INSERT INTO `userchoice`(`hashed_session`, `qid`, `choice`) VALUES " + add_row;
    insert_sql = sql.substring(0, sql.length - 1);

    // Record user score
    db.query(
        insert_sql,
        (err, results) => {
        if (err) throw err;
        console.log("Record Session: " + hashed_session);
        // res.send(results);
    });

    // Return user score
    score_sql = "SELECT COUNT(*) AS score FROM `qa`, `userchoice` WHERE `userchoice`.`hashed_session` = '" + hashed_session + "' AND `qa`.`qid` = `userchoice`.`qid` AND `userchoice`.`choice` = `qa`.`answer`;"
    db.query(
        score_sql,
        (err, results) => {
        if (err) throw err;
        console.log("Score: " + results[0].score);
        res.send(results[0].score);
    })
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));