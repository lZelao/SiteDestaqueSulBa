const express = require("express");
const session = require("express-session");
const router = express.Router();
const User = require("./User");
const bcrypt = require('bcryptjs');
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/users", adminAuth,(req,res) => {
    res.send("Listagem de Usuarios");
});

router.get("/admin/users/create", (req,res) =>{
    res.render("admin/users/create");
})



// Dados do novo usuário (definidos diretamente no código)
const userData = {
  name: "Eliseu",
  email: "esreis123@gmail.com",  password: "Ifba#2018",
};

User.findOne({ where: { email: userData.email } }).then((user) => {
  if (user === null) {
    // Criptografe a senha
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(userData.password, salt);

    // Adicione o novo usuário ao banco de dados
    User.create({
      name: userData.name,
      email: userData.email,
      password: hash,
    })
      .then(() => {
        console.log("Usuário criado com sucesso");
      })
      .catch((err) => {
        console.error("Erro ao criar o usuário:", err);
      });
  } else {
    console.log("Usuário já existe");
  }
});
router.get("/Validacao",(req, res)=>{
    res.render("admin/users/Validacao")
});

router.get("/login",(req,res) =>{

    res.render("admin/users/login");

});

router.post("/authenticate",(req,res)=>{

    var email = req.body.email;
    var password = req.body.password;

    User.findOne({where:{
        email: email
    }}).then(user => {

        if(user != undefined){

            var correct = bcrypt.compareSync(password, user.password);

            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/admin/articles/new");
            }else{
                res.redirect("/login");
            }
        }else{
            res.redirect("/login");
        }
    });
});


router.get("/logout",(req,res)=>{
    req.session.user = undefined;
    res.redirect("/");
});

module.exports = router;