var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const pg = require('pg');
var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const connectionString = require('../constants').DB_URL;
/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

router.post('/login', function (req, res) {
  var results = {};
  pg.connect(connectionString, (err, client, done) => {
    const query = client.query('SELECT * FROM w3users WHERE email=($1)', [req.body.email]);
    query.on('row', (row) => {
      results = row;
    });
    query.on('end', () => {
      done();
      // if user is found and password is valid
      // create a token
      if (results.id) {
        // check if the password is valid
        var passwordIsValid = bcrypt.compareSync(req.body.password, results.password);
        if (!passwordIsValid) {
          return res.status(401).send({ auth: false, token: null });
        }
        var token = jwt.sign({ id: results.id, name: results.name, email: results.email }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
      } else {
        if (err) return res.status(500).send('Error on the server.');
        if (!results) return res.status(404).send('No user found.');
        return res.status(200).send({ auth: false, token: null });
      }
      // return the information including token as JSON
      res.status(200).send({ auth: true, token: token });
    });

  });
});

router.get('/logout', function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', function (req, res, err) {
  const results = {};
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  pg.connect(connectionString, (err, client, done) => {
    if (err) {
      done();
      console.log(err);
      return res.status(500).json({ success: false, data: err });
    }
   
    client.query('INSERT INTO w3users (date_creation, name, email, password) values ($1, $2, $3, $4)',
      [new Date(), req.body.name, req.body.email, hashedPassword]).then(r => {
        console.log("Successfully inserted");
        //SQL Query > Select Data
        const query = client.query('SELECT * FROM w3users WHERE email=($1)', [req.body.email]);

        // Stream results back one row at a time
        query.on('row', (row) => {
          result = row;
        });

        //end the query process and return object
        query.on('end', function () {
          done();
          if (err) return res.status(500).send("There was a problem finding the user.");
          if (!result) return res.status(404).send("Some thing went wrong");

          var token = jwt.sign({ id: results.id }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
          });
          return res.status(200).json({ auth: true, token: token });
        });
      }).catch(e => {
        console.error(e.stack);
        return res.status(200).json({ message: "Email'" + data.email + "' already exits" });
      })
  });
});

router.get('/me', VerifyToken, function (req, res, next) {
  var result = {};
  pg.connect(connectionString, (err, client, done) => {
    const query = client.query('SELECT * FROM w3users WHERE id=($1)', [req.userId]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      result = row;
    });
    //end the query process and return object
    query.on('end', function () {
      done();
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!result) return res.status(404).send("No user found.");
      var token = jwt.sign({ id: result.id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      return res.status(200).send(result);
    });
  });
});

module.exports = router;