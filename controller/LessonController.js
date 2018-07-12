const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
var bodyParser = require('body-parser');
var VerifyToken = require(__root + 'auth/VerifyToken');
const connectionString = require('../constants').DB_URL;

router.use(bodyParser.json());

router.post('/createLesson', VerifyToken, (req, res, next) => {
    const results = [];
    // Grab data from http request
    const data = req.body;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false });
        }

        client.query('INSERT INTO lesson(date_creation, lession_name, description, details, pl_id) values($1, $2, $3, $4, $5)',
            [new Date(), data.name, data.description, data.details, data.pid])
            .then(r => {
                console.log("Successfully lesson is inserted");
                // SQL Query > Select Data
                const query = client.query('SELECT * FROM lesson ORDER BY id DESC');
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
                return res.status(405).json({ error: "PROGRAMMING_LANGUAGE_NOT_FOUND", description: "Programming language not found" });
            })
    });
});

router.get('/getLessons', VerifyToken, (req, res, next) => {
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
        const query = client.query('SELECT * FROM lesson ORDER BY id ASC');

        // Stream results back one row at a time
        query.on('row', (row) => {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', function () {
            done();
            return res.status(200).json(results);
        });
    });
});

router.get('/getLesson/:id', VerifyToken, (req, res, next) => {
    const results = [];
    const id = req.params.id;
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM lesson WHERE id=($1)', [id]);

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

router.delete('/deleteLesson/:id', VerifyToken, (req, res, next) => {
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
        client.query('DELETE FROM lesson WHERE id=($1)', [id]);
        // SQL Query > Select Data
        var query = client.query('SELECT * FROM lesson ORDER BY id ASC');
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

router.put('/updateLesson/:id', VerifyToken, (req, res, next) => {
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

        client.query('UPDATE lesson SET lession_name=($1), description=($2), details=($3), pl_id=($4) WHERE id=($5)',
            [data.name, data.description, data.details, data.pid, id])
            .then(r => {
                console.log("Successfully Lesson updated");
                // SQL Query > Select Data
                const query = client.query('SELECT * FROM lesson ORDER BY id DESC');
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
                return res.status(405).json({ error: "PROGRAMMING_LANGUAGE_NOT_FOUND", description: "Programming language not found" });
         })
    });
});

module.exports = router;