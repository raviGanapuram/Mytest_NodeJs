const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
var bodyParser = require('body-parser');
const connectionString = require('../constants').DB_URL;
var VerifyToken = require(__root + 'auth/VerifyToken');
router.use(bodyParser.json());

router.post('/createExample', VerifyToken, (req, res, next) => {
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

        client.query('INSERT INTO example(date_creation, ex_name, example, le_id) values($1, $2, $3, $4)',
            [new Date(), data.name, data.example, data.lid]).then(r => {
                console.log("Successfully example is inserted");
                const query = client.query('SELECT * FROM example ORDER BY id DESC');
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
                return res.status(405).json({ description: "Lesson id should not be null" });
         });
    });
});


router.get('/getExamplesByLesson/:id', VerifyToken, (req, res, next) => {
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
        const query = client.query('SELECT * FROM example WHERE le_id=($1)', [id]);

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

router.get('/getExamples', VerifyToken, (req, res, next) => {
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
        const query = client.query('SELECT * FROM example ORDER BY id ASC');

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

router.get('/getExample/:id', VerifyToken, (req, res, next) => {
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
        const query = client.query('SELECT * FROM example WHERE id=($1)', [id]);

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

router.delete('/deleteExample/:id', VerifyToken, (req, res, next) => {
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
        client.query('DELETE FROM example WHERE id=($1)', [id]);
        // SQL Query > Select Data
        var query = client.query('SELECT * FROM example ORDER BY id ASC');
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

router.put('/updateExample/:id', VerifyToken, (req, res, next) => {
    const results = [];
    // Grab data from the URL parameters
    const data = req.body;
    const id = req.params.id;
    console.log(data.lid);
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, (err, client, done) => {
        // Handle connection errors
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        }

        client.query('UPDATE example SET ex_name=($1), example=($2), le_id=($3) WHERE id=($4)',
            [data.name, data.example, data.lid, id]).then(r => {
                console.log("Successfully example is updated");
                const query = client.query('SELECT * FROM example ORDER BY id DESC');
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
                return res.status(405).json({ description: "Lesson id should not be null" });
         });
    });
});

module.exports = router;