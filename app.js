const express = require('express');
const path = require('path');   
const app = express();
const bodyParser = require('body-Parser');
const session = require('express-session');
const bcrypt = require('bcrypt');   
const mongoose = require('mongoose');
const UserSchema = require('./User');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended :false}));
app.use(express.static(path.join(__dirname,'public')));
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
const mongo_url ='mongodb://localhost:27017/todos';

app.post('/register',(req,res)=>{
    const {username, password}= req.body;
    let newUser = new UserSchema ({username,password});

    newUser.save(err =>{
        if(err){
            res.status(500).send('ERROR AL REGISTRAR AL USUARIO')
        }else{
            res.status(200).send('Usuario Registrado')
        }return
    })
});

app.post('/authenticate',(req,res)=>{
    const {username, password}= req.body;
    UserSchema.findOne({username},(err, user)=>{
        if(err){
            res.status(500).send('ERROR AL AUTENTICAR AL USUARIO')
        }else if(!user){
            res.status(500).send('EL USUARIO NO EXISTE')
        }else{
            user.isCorrectPassword(password,(err,result)=>{
                if(err){
                    res.status(500).send('ERROR AL AUTENTICAR');
                }else if(result){
                    isLoggedIn = true;
                    res.status(200).send('USUARIO AUTENTICADO CORRECTAMENTE');
                }else{
                    res.status(500).send('USUARIO Y/O CONTRASEÑA INCORRECTA');
                }return
            })
        }
    })
});
app.post('/login', (req, res) => {
    req.session.username = req.body.username;
    isLoggedIn = false;
    res.redirect('/');
});
app.post('/logout', (req, res) => {
    isLoggedIn = false;
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/index');
        }
    });
});

app.get('/username', (req, res) => {
    const searchCriteria = {_id: req.session.userId};
    UserSchema.findOne(searchCriteria, (err, user) => {
      if (err) {
        res.send({error: 'Error al buscar el usuario'});
      } else if (user) {
        res.send({username: user.username});
      } else {
        res.send({error: 'Usuario no encontrado'});
      }
    });
  });

mongoose.connect(mongo_url, function(err){
    if(err){
        throw err;
       } else {
        console.log(`Conectado a la BD ${mongo_url}`);
       }
});

app.listen(3000,()=>{
    console.log('Server Iniciado');
});

module.exports = app;