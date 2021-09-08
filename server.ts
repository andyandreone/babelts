const { Socket } = require('dgram')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
var multer = require('multer');
const fs = require('fs');
const handlebars = require('express-handlebars')

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

http.listen(8080,()=>{
    console.log('Escuchando en puerto 8080')
})

interface Data{
    messages: any,
    err: any
}

io.on('connection',(socket: any)=>{
    console.log('usuario conectado')

    fs.promises.readFile('mensajes.txt').then((data: Data) =>{
        let messages= JSON.parse(data.toString());  
        socket.emit('messages', messages) 

        socket.on('new-message',function(data: Data){
            messages.push({...data});
                 fs.promises
                 .writeFile('mensajes.txt',JSON.stringify(messages, null, '\t'))
                 .then(()=>{
                     console.log("mensaje agregado");
                 })
                .catch((err:any)=>{
                   console.log(err)
                 })

            io.sockets.emit('messages', messages)
         })
})

    

   
    
})


let storage = multer.diskStorage ({
    destination: function (req: any, file :any, callback:any){
        callback(null, "images")
    },
    filename:function(req: any, file: any, callback:any){
        callback(null, file.originalname)
    }
})

var upload = multer({storage});

let productos = []

class Producto {
    id: number;
    price:number;
    title:string;
    thumbnail:string;

    constructor (thetitle: string, theprice: number, thethumbnail: string) {
        this.id = productos.length+1
        this.title = thetitle
        this.price = theprice
        this.thumbnail = thethumbnail
    }
}



app.post("/guardar",upload.single("myFile"),(req:{ body: any}, res: {redirect:any}) => {
    
   
    let title= req.body.title;
    let price= req.body.price;
    let thumbnail = req.body.thumbnail;
            // if (!req.file) {
            //     const error = new Error("Sin archivos")
            //     error.httpStatusCode = 400
            //     return next(error) 
            // }
            let producto = new Producto(title, price, thumbnail)
            
            
        if(fs.existsSync('productos.txt')){
            fs.promises.readFile('productos.txt').then((data: Data) =>{
                const json = JSON.parse(data.toString());
                 json.push({...producto, id: json.length});
                 fs.promises
                 .writeFile('productos.txt',JSON.stringify(json, null, '\t'))
                 .then(()=>{
                     console.log("agregado con exito");
                 })
             }).catch((err:any)=>{
                console.log(err)
             })
            }else{
                fs.promises.writeFile(('productos.txt'), JSON.stringify([{...producto, id:0}]))
             }
             res.redirect('/');
})


app.engine(
    "hbs",
    handlebars({
        extname:".html",
        defaultLayout:'index.html',
        layoutsDir: __dirname + "/public",
    })
)

app.set('view engine', 'hbs');

app.get('/',(req:{ body: any},res:{render:any})=>{
    fs.promises.readFile('productos.txt').then((data: Date) =>{
        const products = {
            items: [{}]
        }

        const json = JSON.parse(data.toString());
        products.items = json
        res.render('main',products)
      
     }).catch((err:any)=>{
        console.log(err)
     })
})    