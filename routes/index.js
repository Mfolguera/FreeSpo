var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, resp, next) {
    
    var url = 'http://arenavision.in/agenda'

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
    
    var objEvents = parseSchedule(res.body);
    resp.render('index', { title: 'Express', events: objEvents });
    //resp.send(parseSchedule(res.body));
    });    
    
  //resp.render('index', { title: 'Express' });
});

module.exports = router;

var AllChannels = new Array();

// Event item in Schedule
var EventItem = function (rawData) { 
    this.rawData = rawData;
    try {
        this.date =  rawData[0] + " " + rawData[1];
    } catch (error) {
        
    }
    try {
        this.name =  rawData[4] + " (" + rawData[3] + ")";
        this.type = "EVENT";
    } catch (error) {
        this.type = "OTHER";
    }
    try {
        this.channels =   rawData[5].match(".+?(?= \\[)")[0].split("-").map(function(obj){
            var rObj = {};
            rObj["name"] = obj;
            rObj["url"] = "http://arenavision.in/av" + obj.toLowerCase();
            return rObj;
        }); 
        this.language = rawData[5].match("(?<=\\[)(.*)(?=\\])");
    } catch (error) {
        
    }
    try {
        this.sport =   this.name.match("[^:]*").slice(0)[0]; 
        this.name = this.name.replace(this.sport + ": ", "");
    } catch (error) {
        
    }
};


function parseSchedule(htmlString) {
    var newHTML = '<ul>';
    var objArray = [];
    $ = cheerio.load(htmlString);
    
    
    var tbl = $('.field-items tr').get().map(function(row) {
  return $(row).find('td').get().map(function(cell) {
    return $(cell).html();
  });
});
    for (i=1; i <= tbl.length-2; i++){
        var Item = new EventItem(tbl[i]);
        objArray.push(Item);
    }
    
/*    $('div.field-item.even p').each(function( index ) {
        for(var key in this.children) {
            if (this.children[key].data != undefined) {
                var itemSched = new EventItem(this.children[key].data );
                newHTML += '<li>' + this.children[key].data + '</li>';
                objArray.push(itemSched);    
            }
        }
    });
    newHTML += '</ul>'*/
    return objArray;
}
