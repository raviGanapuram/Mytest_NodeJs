const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
var bodyParser = require('body-parser');
router.use(bodyParser.json());
var VerifyToken = require(__root + 'auth/VerifyToken');
const connectionString = require('../constants').DB_URL;

router.post('/createLanguage', VerifyToken, (req, res, next) => {
  const results = [];
  // Grab data from http request
  const data = req.body;
  console.log("Request-body:- " + req.body.name);
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false });
    }

    client.query('INSERT INTO programming_language(date_creation, name, title, introduction) values($1, $2, $3, $4)',
      [new Date(), data.name, data.title, data.introduction]).then(r => {
        console.log("Successfully language is inserted");
        const query = client.query('SELECT * FROM programming_language ORDER BY id DESC');
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
          done();
          return res.status(200).json(results);
        });
      })
      .catch(e => {
        console.error(e.stack);
        return res.status(405).json({ description: "Language name '" + data.name + "' already exits" });
      });
  });
});

router.get('/getLanguages', VerifyToken, (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err });
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM programming_language ORDER BY id ASC');

    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', function () {
      done();
      return res.json(results);
    });
  });
});

router.delete('/deleteLanguage/:id', VerifyToken, (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err });
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM programming_language WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM programming_language ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});

router.put('/updateLanguage/:id', VerifyToken, (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const data = req.body;
  const id = req.params.id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err });
    }

    client.query('UPDATE programming_language SET name=($1), title=($2), introduction=($3) WHERE id=($4)',
      [data.name, data.title, data.introduction, id]).then(r => {
        console.log("Successfully language is updated");
        const query = client.query('SELECT * FROM programming_language ORDER BY id DESC');
        // Stream results back one row at a time
        query.on('row', (row) => {
          results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
          done();
          return res.status(200).json(results);
        });
      })
      .catch(e => {
        console.error(e.stack);
        return res.status(405).json({ description: "Language name '" + data.name + "' already exits" });
      });
  });
});

module.exports = router;