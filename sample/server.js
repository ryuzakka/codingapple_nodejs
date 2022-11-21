const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

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
    응답.render('index.ejs');
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
    // 응답.sendFile(__dirname + '/write.html');
    응답.render('write.ejs');
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

app.get('/edit/:id', function(요청, 응답){
    // 요청.params.id = parseInt(요청.params.id);
    db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function (에러, 결과) {
        console.log(결과);
        응답.status(200).render('edit.ejs', { data : 결과 });
    })
})

app.put('/edit', function(요청, 응답){
    // 폼에 담긴 제목과 날짜 데이터를 가지고
    // db.collection에다가 업데이트함

    // updateOne({쿼리문}, {operator}, 콜백함수(){})
    db.collection('post').updateOne({ _id : parseInt(요청.body.id) }, { $set : { title : 요청.body.title , date : 요청.body.date } }, function(에러, 결과){
        console.log('수정완료');
        응답.redirect('/list');
    });
})


/** Session 방식 로그인 준비물 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// 미들웨어
app.use(session({ secret : '비밀코드', resave : true, saveUninitialized : false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(요청, 응답){
    응답.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(요청, 응답){
    // passport 라이브러리는 로그인을 쉽게 도와주는 역할 => 로그인하면 아이디 비밀번호 검사 등
    응답.redirect('/');
});

app.get('/mypage', 로그인했니, function(요청, 응답){
    console.log(요청.user);   // session.deserializeUser 의 결과 중 user 값을 가져옴
    응답.render('mypage.ejs', {사용자 : 요청.user});
});

function 로그인했니(요청, 응답, next){
    if(요청.user) {
        next();
    } else {
        응답.send('로그인안하셨는디유?');
    }
}

// /login 페이지 post 요청시 passport.authenticate()로 인해 실행되는 검증기능
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function(입력한아이디, 입력한비번, done){
    console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({id : 입력한아이디}, function(에러, 결과){
        if(에러) return done(에러);
        if(!결과) return done(null, false, {message : '존재하지 않는 아이디요'})
        if(입력한비번 == 결과.pw) {
            return done(null, 결과);    // 아이디, 비밀번호 모두 일치하는 경우
        } else {
            return done(null, false, {message : '비번틀렸어요'});
        }
    })
}));

// 세션 생성 (로그인 성공시 실행)
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// 세션 찾기 (로그인 검증이 필요한 페이지 접속시 실행)
// 로그인한 유저의 세션아이디를 바탕으로 개인정보를 DB에서 찾는 역할
passport.deserializeUser(function(아이디, done){
    // DB에서 위에 있는 user.id로 유저를 찾은 뒤에 유저 정보를 -> done(null, {여기에 넣을 수 있음}) 
    db.collection('login').findOne({id : 아이디}, function(에러, 결과){
        done(null, 결과);   // 결과 = {id:test, pw:test} 이거일거임
    });
});
