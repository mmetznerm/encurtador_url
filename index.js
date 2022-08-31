const express = require("express");
const mongodb = require("mongodb");
const server = express();
var dbo = null

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";

mongoClient.connect(url, function (err, db) {
    if (err) throw err;
    dbo = db.db("mydb");
});

server.use(express.json());
server.listen(3000, function () {
    console.log("Servidor rodando...");
});

//Get all URLs between a date
server.get('/urls', function (req, res) {
    const startDate = req.query.startDate
    const endDate = req.query.endDate

    dbo.collection("urls").find({
        "date": {
            $gte: startDate,
            $lt: endDate,
        }
    }).toArray(function (err, result) {
        if (err) throw err;
        return res.json(result);
    });
})

//Get a Url by ID
server.get('/url', function (req, res) {
    var ObjectId = mongodb.ObjectId
    var query = { _id: new ObjectId(req.query.id) };
    dbo.collection("urls").find(query).toArray(function (err, result) {
        if (err) throw err;
        return res.json(result);
    });
})

//Encode a URL
server.post('/url', function (req, res) {
    const { url } = req.body
    var encurtedUrl = "mm.z/" + generateCode()
    var myobj = { url: url, encurtedUrl: encurtedUrl, date: new Date() };
    dbo.collection("urls").insertOne(myobj, function (err, resp) {
        if (err) throw err;
        return res.json(encurtedUrl)
    });
});

function generateCode() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}