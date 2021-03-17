"use strict";
const express = require("express");
const cors = require("cors");
const superagent = require("superagent");
const override = require("method-override");
const pg = require("pg");
const PORT = process.env.PORT || 4200;
const server = express();

require("dotenv").config();
server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(override("method"));
server.use(express.static("./public"));
server.set("view engine", "ejs");
const client = new pg.Client(process.env.DATABASE_URL);

server.get("/", homeHandler);
server.post("/search", searchHandler);
server.get("/allcountries", allCouHandler);
server.post("/myrecords", addToRecords);
server.get("/myrecords", myRecordsHandler);
server.get("/recorddetails/:id", detailsHandler);
server.delete("/recorddetails/:id", deleteHandler);

function deleteHandler(req, res) {
  let SQL = `DELETE FROM corona19 WHERE id=${req.params.id}`;
  client.query(SQL).then(() => {
    res.redirect("/myrecords");
  });
}

function detailsHandler(req, res) {
  let SQL = `SELECT * FROM corona19 WHERE id=${req.params.id}`;
  client.query(SQL).then((result) => {
    res.render("recorddetails", { Country: result.rows });
  });
}

function myRecordsHandler(req, res) {
  let SQL = `SELECT * FROM corona19`;
  client.query(SQL).then((result) => {
    if (result.rowCount !== 0) {
      res.render("MyRecords", { Countries: result.rows });
    } else {
      res.render("noAvaialbe");
    }
  });
}

function addToRecords(req, res) {
  let {
    country,
    totalconfirmedcases,
    totaldeathscases,
    totalrecoveredcases,
    date,
  } = req.body;
  let SQL = `INSERT INTO corona19 (country,totalconfirmedcases,totaldeathscases,totalrecoveredcases,date) VALUES($1,$2,$3,$4,$5) RETURNING *`;
  let safeVal = [
    country,
    totalconfirmedcases,
    totaldeathscases,
    totalrecoveredcases,
    date,
  ];
  client.query(SQL, safeVal).then(() => {
    res.redirect("/myrecords");
  });
}

function allCouHandler(req, res) {
  let URL = `https://api.covid19api.com/summary`;
  superagent.get(URL).then((result) => {
    let country = result.body.Countries.map((item) => {
      return new Allcountries(item);
    });
    res.render("allCountries", { Countries: country });
  });
}

function Allcountries(data) {
  this.country = data.Country;
  this.totalconfirmedcases = data.TotalConfirmed;
  this.totaldeathscases = data.TotalDeaths;
  this.totalrecoveredcases = data.TotalRecovered;
  this.date = data.Date;
}

function searchHandler(req, res) {
  let URL = `https://api.covid19api.com/country/${req.body.search}/status/confirmed?from=${req.body.from}T00:00:00Z&to=${req.body.until}T00:00:00Z`;
  superagent.get(URL).then((result) => {
    res.render("getCountryResult", { CountryResult: result.body });
  });
}

function homeHandler(req, res) {
  let URL = `https://api.covid19api.com/world/total`;
  superagent.get(URL).then((result) => {
    res.render("home", { Total: result.body });
  });
}

client.connect().then(() => {
  server.listen(PORT, () => {
    console.log(`localhost:${PORT}`);
  });
});
