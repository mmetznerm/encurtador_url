const express = require("express");
const mongodb = require("mongodb");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs")
const server = express();
var dbo = null

const spec = YAML.load("./swagger.yml");

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";

mongoClient.connect(url, function (err, db) {
    if (err) throw err;
    dbo = db.db("mydb");
});

server.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
server.use(express.json());
server.listen(3000, function () {
    console.log("Servidor rodando...");
});

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

server.get('/url', function (req, res) {
    var ObjectId = mongodb.ObjectId
    var query = { _id: new ObjectId(req.query.id) };
    dbo.collection("urls").find(query).toArray(function (err, result) {
        if (err) throw err;
        return res.json(result);
    });
})

server.post('/url/encurt', function (req, res) {
    const { url } = req.body
    var encurtedUrl = "mm.z/" + generateCode()
    var myobj = { url: url, encurtedUrl: encurtedUrl, date: new Date() };
    dbo.collection("urls").insertOne(myobj, function (err, resp) {
        if (err) throw err;
        return res.json(encurtedUrl)
    });
});

/**
 * Gera um texto com 5 caracteres aleatórios
 * @returns {string} - Retorna um texto de caracteres aleatórios]
 */
function generateCode() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}