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

    app.listen(8080, function(요청, 응답) {
        console.log('listening on 8080');
    });
});

app.get('/', (요청, 응답) => {
    // app.listen(8080, function() => {
    console.log('Welcome! root page');
    // 응답.send('Hi there !');
    // 응답.sendFile(__dirname + '/views/index.ejs');
});

app.get('/pet', (요청, 응답) => {
    console.log('Here is pet page');
    응답.send('Here is pet page');
});

app.get('/beauty', (요청, 응답) => {
    console.log('Here is beauty page.');
    응답.send('Here is beauty page');
});

app.get('/write', (요청, 응답) => {
    응답.sendFile(__dirname + '/write.html');
});

app.post('/add', (요청, 응답) => {
    // console.log(req.body);
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
        console.log(결과.totalPost);
        let 총게시물갯수 = 결과.totalPost;

        db.collection('post').insertOne({ _id : 총게시물갯수 + 1, title : 요청.body.title, date : 요청.body.date }, function(에러, 결과) {
            console.log('저장완료');
            
            // counter의 totalPost를 1 증가
            // db.collection('counter').updateOne({어떤 데이터를 수정할지}, {수정값}, function(){})
            db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : { totalPost : 1 } }, function(에러, 결과){
                if(에러) return console.log(에러);
            });
            // $set은 오퍼레이터(operator) -> $inc 등 여러가지가 있음
        });

    });

    응답.send('전송완료');
});

app.get('/list', (요청, 응답) => {
    // DB에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요.
    db.collection('post').find().toArray(function(에러, 결과) {
        console.log(결과);
        응답.render('list.ejs', { posts: 결과 });
    });
});

app.delete('/delete', function(요청, 응답) {
    요청.body._id = parseInt(req.body._id);
    // 의미 : 요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요.
    db.collection('post').deleteOne(요청.body, function (에러, 결과){
        console.log(요청.body);
        console.log('삭제완료');
        응답.status(200).send({ message : '삭제 성공했습니다.' });
        // 응답.status(400).send({ message : '400 에러' });
    });
})


// /detail로 접속하면 detail.ejs 보여줌
// : 은 파라미터를 의미
app.get('/detail/:id', function(요청, 응답){
    요청.params.id = parseInt(요청.params.id);
    // db.collection('post').findOne({ _id : detail/뒤에있는숫자 }, function (에러, 결과) {
    db.collection('post').findOne({ _id : 요청.params.id }, function (에러, 결과) {
        console.log(결과);
        응답.status(200).render('detail.ejs', { data : 결과 });
        // 응답.status(400).send({ message : '잘못된 요청' });
    })
})
