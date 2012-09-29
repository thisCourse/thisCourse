sys = require("sys")
http = require("http")
express = require("express")
OperationHelper = require("apac").OperationHelper

secrets = require("../secrets")

opHelper = new OperationHelper
    awsId: secrets.awsId
    awsSecret: secrets.awsSecret
    assocId: secrets.assocId

app = express.createServer()

app.listen 10003, "127.0.0.1"

app.get "/",  (req, res) ->
    opHelper.execute 'ItemSearch',
        'SearchIndex': 'Books'
        'Keywords': req.query.q
        'ResponseGroup': 'ItemAttributes,Images'
        (error, results) ->
            console.log results
            if error
                return res.json([])
            res.json ({
                title: r.ItemAttributes.Title
                authors: (r.ItemAttributes.Author?.join?(" & ") || r.ItemAttributes.Author || r.ItemAttributes.Creator?[0]?["#"] || "")
                isbn10: r.ItemAttributes.ISBN
                year: r.ItemAttributes?.PublicationDate?[0...4]
                thumbnail: r.ImageSets?.ImageSet?.SmallImage?.URL
                image: r.ImageSets?.ImageSet?.TinyImage?.URL
                publisher: r.ItemAttributes?.Manufacturer
            } for r in results.Items.Item)
