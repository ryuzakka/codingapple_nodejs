const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

var db;
MongoClient.connect('mongodb+srv://admin:5032@cluster0.uqyoyax.mongodb.net/test?retryWrites=true&w=majority', function(에러, client) {
    // 연결되면 할일
    if (에러) return console.log(에러);
    db = client.db('todoapp');

    // db.collection('post').insertOne('저장할 데이터', function(에러, 결과) {
    //     console.log('저장완료');
    // });
    // db.collection('post').insertOne({ _id: 100, title: 'Test01', date: '2022-11-02' }, function(에러, 결과) {
    //     console.log('저장완료');
    // });

    app.listen(8080, function(req, res) {
        console.log('listening on 8080');
    });
});

app.get('/', (req, res) => {
    console.log('Welcome! root page');
    // res.send('Hi there !');
    res.sendFile(__dirname + '/index.html');
});

app.get('/pet', (req, res) => {
    console.log('Here is pet page');
    res.send('Here is pet page');
});

app.get('/beauty', (req, res) => {
    console.log('Here is beauty page.');
    res.send('Here is beauty page');
});

app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html');
});

app.post('/add', (req, res) => {
    // console.log(req.body);
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
        console.log(결과.totalPost);
        let 총게시물갯수 = 결과.totalPost;

        db.collection('post').insertOne({ _id : 총게시물갯수 + 1, title : req.body.title, date : req.body.date }, function(에러, 결과) {
            console.log('저장완료');
            
            // counter의 totalPost를 1 증가
            // db.collection('counter').updateOne({어떤 데이터를 수정할지}, {수정값}, function(){})
            db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : { totalPost : 1 } }, function(에러, 결과){
                if(에러) return console.log(에러);
            });
            // $set은 오퍼레이터(operator) -> $inc 등 여러가지가 있음
        });

    });

    res.send('전송완료');
});

app.get('/list', (req, res) => {
    // DB에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요.
    db.collection('post').find().toArray(function(에러, 결과) {
        console.log(결과);
        res.render('list.ejs', { posts: 결과 });
    });
});