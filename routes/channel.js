var express = require('express');
var session = require('express-session');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/:id', function(req, resp, next) {
    var id = req.params.id;
    if (req.session.channels == undefined) {
        req.session.channels = {};
    }
    
    if (req.session.channels[id] == undefined) {
        var url = 'http://arenavision.in/' + id;

        // use a timeout value of 10 seconds
        var timeoutInMilliseconds = 10*1000
        var opts = {
        url: url,
        timeout: timeoutInMilliseconds
        }

        request(opts, function (err, res, body) {
        if (err) {
            console.dir(err)
            return
        }
        var statusCode = res.statusCode
        console.log('status code: ' + statusCode)
        
        var token = getToken(res.body);
        req.session.channels[id] = token;
        resp.render('channel', { title: id, token: token });
        });            
    }
    else {
        resp.render('channel', { title: id, token: req.session.channels[id] });
    }
    



    
});

function getToken(htmlString) {
    try {
        var token = htmlString.match('acestream:\/\/(.*?)(?=\")').slice(0)[0];    
    } catch (error) {
        var token ="";
    }
    
    return token;
}

module.exports = router;