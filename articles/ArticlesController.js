const express = require("express");
const router = express.Router();
const Category = require ("../categories/Category")
const Article = require ("./Article");
const slugify = require ("slugify");
const adminAuth = require("../middlewares/adminAuth");
const sharp = require('sharp');

const multer = require("multer");
const path = require ('path');

const currentDirectory = __dirname;
//REMOVE A ULTIMA PASTA DO DIRETORIO
const newDirectory = path.join(currentDirectory, '..');
router.use(express.static(path.join(__dirname, 'public')));

// Define o caminho base absoluto para o diretório de uploads
const uploadDirectory = path.join(newDirectory, 'public', 'uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null,uploadDirectory);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  const upload = multer({ storage });
 

router.get("/admin/articles", adminAuth,(req, res)=>{
    Article.findAll({

        order:[
            ['id','DESC']],

        include: [{model: Category}]
        
    }).then(articles=>{
        Category.findAll().then(categories =>{

            res.render("admin/articles/index",{articles: articles, categories: categories});
        });
       

    });
  
});




router.get("/admin/articles/new", adminAuth, (req, res)=>{
    Category.findAll().then( categories =>{
       
        res.render("admin/articles/new", { categories : categories});

    })
    
});

router.post("/admin/articles/save", adminAuth, upload.single("image"), (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
 
   
    var imageUrl = req.file ? 'uploads/' + req.file.filename : ''; // Gere a URL da imagem carregada
    // Renderize a página "new.ejs" com a URL da imagem
     // A imagem está no req.file.buffer
   
   
    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category,
       image: imageUrl// Salve a imagem no banco de dados
    }).then(() => {
        res.redirect("/admin/articles");
    });
});


router.post("/articles/delete",adminAuth, (req,res) =>{
    var id = req.body.id;
    if( id != undefined){
        if( !isNaN(id)){

            Article.destroy({
                where:{
                    id :id
                }
            }).then(() =>{
                res.redirect("/admin/articles");

            });

        }else{
            res.redirect("/admin/articles");
        }
        }else{
            res.redirect("/admin/articles");
    }

});

router.get("/admin/articles/edit/:id", adminAuth,(req,res) =>{
    var id = req.params.id;
    Article.findByPk(id).then(article =>{
        if(article != undefined){
            Category.findAll().then(categories =>{

                res.render("admin/articles/edit", {categories: categories,article: article})
            });
        }else{
            res.redirect("/admin/articles");
        }
    }).catch(err =>{
        res.redirect("/admin/articles");
    });
});

router.post("/articles/update", adminAuth, upload.single("image"),(req,res) =>{
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category
    var imageUrl = req.file ? 'uploads/' + req.file.filename : ''; // Gere a URL da imagem carregada
    
    Article.update({
        title: title,
        body: body,
        categoryId: category,
        slug: slugify(title),
        image: imageUrl
    },{
       
            where:{
            id :id
        }
    }).then(() =>{
        res.redirect("/admin/articles");

    }).catch(err =>{
        res.redirect("/");
    });
});

// sistema de paginação do blog

router.get("/articles/page/:num", adminAuth,(req, res)=>{

    var page = req.params.num;
    var offset = 0;

    if(isNaN(page) || page == 1){
        offset = 0;
    }else{
        offset = (parseInt(page)-1) * 4;
    }

    Article.findAndCountAll({
         limit: 4,
         offset: offset,

         order:[
            ['id','DESC']
        ]

    }).then(articles =>{

        var next;

        if(offset + 4 >= articles.count){
            next = false
        }else{
            next = true;
        }

        var result = {
            page:  parseInt(page),
            next : next,
            articles : articles
        }

        Category.findAll().then(categories =>{
            res.render("admin/articles/page",{ result: result, categories: categories})

        });

        
    });

});

















module.exports = router;                                          