var express = require('express');
var cors = require('cors');
var Bing = require('node-bing-api')({accKey: '855d213f01044028bb78e77adf289f25'});
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var searchTerm = require('./models/searchTerm');
var path = require('path');
var app = express();
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//var users = require('./routes/users');
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
//connect to the database
mongoose.connect('mongodb://mbuckles:adjf1963@ds159200.mlab.com:59200/searchterm' || 'mongo://localhost/searchTerms');

app.get('/api/recentsearchs', (req, res, next) =>{
searchTerm.find({}, (err, data)=>{
  res.json(data);
})
});
//get call for params for imagesearch
app.get('/api/imagesearch/:searchVal*', (req, res, next) =>{
  var {searchVal} = req.params;
  var {offset} = req.query;

  var data = new searchTerm({
    searchVal,
    searchDate: new Date()
  }
);
//in case dbase is down
  data.save(err => {if (err) {
    return res.send('Err saving to datebase');
  }
 });
var searchOffset;
if(offset){
  if(offset==1){
    offset=0;
    searchOffset = 1;
  }
  else if (offset>1){
    searchOffset = offset +1;
  }
}
 Bing.images(searchVal, {
   top:(10 * searchOffset),
   skip: (10 * offset)
 }, function(error, rez, body){
   var bingData=[];
   for(var i=0; i<10; i++){
     bingData.push({
       url:body.value[i].webSearchUrl,
       snippet: body.value[i].name,
       thumbnail: body.value[i].thumbnailUrl,
       context: body.value[i].hostPageDisplayUrl
     });
   }
   res.json(bingData);
 });
 //return res.json(data);
//}
//return res.json({
//searchVal,
//offset
//});

});

//app.use('/users', users);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.listen(process.env.PORT || 3000, ()=>{
//console.log('Working');
});

module.exports = app;
