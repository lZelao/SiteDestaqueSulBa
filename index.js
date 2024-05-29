const express = require("express");
const app = express();
const connection = require("./database/database")
const slugify = require("slugify");

const categoriesController = require("./categories/CategoriesController")
const articlessController = require("./articles/ArticlesController")
const Article = require("./articles/Article")
const Category = require("./categories/Category")
const UserController = require("./users/UserController");
const session = require("express-session");
const User = require("./users/UserController");


app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//sessions

app.use(session({
    secret: "qualquercoisa", cookie: { maxAge: 3000000}

}));



app.use("/",UserController);
app.use("/", categoriesController);
app.use("/", articlessController);

//para trabalhar com arquivos staticos

app.use(express.static('public'));

//database conexao

connection
.authenticate()
.then(()=>{
    console.log("Conexão feita com Sucesso!!")
}).catch((error)=>{
    console.log(error);
})


app.get("/", async (req, res) => {
    try {
        // Busca todos os artigos (geral)
        const allArticles = await Article.findAll({
            order: [['id', 'DESC']],
            limit: 10 // Ajuste o limite conforme necessário
        });

        // Busca a categoria "Destaques"
        const destaquesCategory = await Category.findOne({
            where: { title: 'Destaques' }, // Supondo que o slug da categoria Destaques seja 'destaques'
            include: [{ model: Article }]
        });

        if (!destaquesCategory) {
            throw new Error('Categoria "Destaques" não encontrada.');
        }

        // Busca todas as categorias para o menu de categorias
        const categories = await Category.findAll();

        // Renderiza a página index com todos os artigos e os artigos da categoria Destaques
        res.render("index", { allArticles, destaquesArticles: destaquesCategory.Articles, categories });
    } catch (error) {
        console.error('Erro ao buscar artigos:', error);
        res.redirect("/");
    }
});





app.get('/contato', (req, res) => {
    res.render('contato'); // Renderiza o arquivo Contato.ejs
});


app.get('/quem-somos', (req, res) => {
    res.render('QuemSomos'); // Renderiza o arquivo QuemSomos.ejs
});

app.get('/anuncie', (req, res) => {
    res.render('anunciee'); // Renderiza o arquivo Anuncie.ejs
});

app.get("/:slug",(req,res)=>{

    var slug =req.params.slug;

    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
           
        Category.findAll().then(categories =>{

            res.render("article",{article: article, categories: categories});
        });
        }else{
            res.redirect("/");
        }
    }).catch(err =>{
        res.redirect("/");

    });
});



app.get("/category/:slug",(req, res)=>{
    var slug = req.params.slug;
    Category.findOne({
        where:{
            slug : slug
        }, 
        include: [{model: Article}]
    }).then (category =>{
        if(category != undefined){

            Category.findAll().then(categories =>{
                res.render("index",{articles: category.articles, categories: categories});
            });
        }else{
            res.redirect("/");
            
        }
    }).catch(err =>{

        res.redirect("/");

    });
});

app.listen(3030, ()=>{
    console.log("O servidor está rodando!")
});