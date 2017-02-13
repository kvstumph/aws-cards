var express = require("express");
var AWS = require("aws-sdk");
var bodyParser = require("body-parser");

AWS.config.update({
  region: "us-west-1",
  endpoint: "dynamodb.us-west-1.amazonaws.com"
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

var app = express();
var jsonParser = bodyParser.json();

var port = 8080;

var server = app.listen(port, function() {
  let port = server.address().port;
  console.log("Proxy listening on port %s", port);
});

app.post("/cards", jsonParser, function(req,res) {
  var requestType = req.get('Content-Type');
  if (!( typeof requestType !== "undefined" && requestType === "application/json")) {
    return ( res.status(400).send({ error: "Content-Type must be application/json" }) );
  }
  if (!(typeof req.body !== "undefined" && typeof req.body.question !== "undefined" && typeof req.body.answer !== "undefined")) {
    return ( res.status(400).send({ error: "Body can not be empty and must have both a question and an answer." }) );
  }

  var params = {
    TableName: "Cards",
    Item: {
      id: (new Date).getTime(),
      question: req.body.question,
      answer: req.body.answer
    }
  }
  docClient.put(params, function(err, data) {
    if (err) {
      res.json({ error: err });
    } else {
      res.json({ success: true });
    }
  });
});


app.get("/cards", function(req, res) {
  dynamodb.scan({ TableName: "Cards" }, function(err, data) {
    console.log("req.url is: " + req.url);  
    if (err) {
      res.json({ error: err });
    } else {
      res.json({ data: data });
    }
  });
});
