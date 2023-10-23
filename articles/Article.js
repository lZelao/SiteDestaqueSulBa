const  Sequelize = require("sequelize");
const connection = require ("../database/database");
const Category = require ("../categories/Category")

const Article = connection.define('articles',{
    title:{
        type: Sequelize.STRING,
        allowNull: false
    },slug:{
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    image: {
        type: Sequelize.TEXT, // Usando BLOB para armazenar a imagem diretamente no banco de dados
        allowNull: true // Defina como true se a imagem for opcional
    }
  
})

Category.hasMany(Article); //um para muitos
Article.belongsTo(Category); // um para um


Article.sync({force : false});
module.exports = Article;
