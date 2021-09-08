"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Socket = require('dgram').Socket;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var multer = require('multer');
var fs = require('fs');
var handlebars = require('express-handlebars');
//----------------------
// PRODUCTOS
/*
interface Producto {
    items: {
      id: number,
      title: string,
      price: number,
      thumbnail: string
    }
  }
  
  const productos: Array<Producto> = [];
  let id = 1;
  
  // MENSAJES
  
  interface Chat {
    mensajes: {
      email: string,
      mensaje: string,
      fecha: Date
    }
  };
  
  const chat: Array<Chat> = [];;
*/
//----------------------
app.use('/static', express.static(__dirname + '/public'));
// app.get('/',(req,res)=>{
//    res.sendFile('index.html', {root: __dirname})
//  })
http.listen(8080, function () {
    console.log('Escuchando en puerto 8080');
});
io.on('connection', function (socket) {
    console.log('usuario conectado');
    fs.promises.readFile('mensajes.txt').then(function (data) {
        var messages = JSON.parse(data.toString());
        socket.emit('messages', messages);
        socket.on('new-message', function (data) {
            messages.push(__assign({}, data));
            fs.promises
                .writeFile('mensajes.txt', JSON.stringify(messages, null, '\t'))
                .then(function () {
                console.log("mensaje agregado");
            })
                .catch(function (err) {
                console.log(err);
            });
            io.sockets.emit('messages', messages);
        });
    });
});
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "images");
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({ storage: storage });
var productos = [];
var Producto = /** @class */ (function () {
    function Producto(thetitle, theprice, thethumbnail) {
        this.id = productos.length + 1;
        this.title = thetitle;
        this.price = theprice;
        this.thumbnail = thethumbnail;
    }
    return Producto;
}());
app.post("/guardar", upload.single("myFile"), function (req, res) {
    var title = req.body.title;
    var price = req.body.price;
    var thumbnail = req.body.thumbnail;
    // if (!req.file) {
    //     const error = new Error("Sin archivos")
    //     error.httpStatusCode = 400
    //     return next(error) 
    // }
    var producto = new Producto(title, price, thumbnail);
    if (fs.existsSync('productos.txt')) {
        fs.promises.readFile('productos.txt').then(function (data) {
            var json = JSON.parse(data.toString());
            json.push(__assign(__assign({}, producto), { id: json.length }));
            fs.promises
                .writeFile('productos.txt', JSON.stringify(json, null, '\t'))
                .then(function () {
                console.log("agregado con exito");
            });
        }).catch(function (err) {
            console.log(err);
        });
    }
    else {
        fs.promises.writeFile(('productos.txt'), JSON.stringify([__assign(__assign({}, producto), { id: 0 })]));
    }
    res.redirect('/');
});
app.engine("hbs", handlebars({
    extname: ".html",
    defaultLayout: 'index.html',
    layoutsDir: __dirname + "/public",
}));
app.set('view engine', 'hbs');
app.get('/', function (req, res) {
    fs.promises.readFile('productos.txt').then(function (data) {
        var products = {
            items: [{}]
        };
        var json = JSON.parse(data.toString());
        products.items = json;
        res.render('main', products);
    }).catch(function (err) {
        console.log(err);
    });
});
