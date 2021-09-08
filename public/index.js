function onInput(e){
    let author = document.getElementById('email').value;
    let message = document.getElementById('texto').value;
    let disabled = document.getElementById('submit').disabled;
    if(!(author!==""&&message!=="")){
        document.getElementById('submit').disabled = true
    }else{
        document.getElementById('submit').disabled = false
    }
}

const socket = io.connect();

socket.on('messages', function(data){
    render(data)
})
function render(data){
    var html = data.map(function(elem,index){
    return(`<div>
        <strong style="color: blue">${elem.author}</strong> 
        <span style="color: brown">${elem.time}</span>
        <em style="color: green">${elem.message}</em>
        </div>`)
    }).join(" ");
    document.getElementById('messages').innerHTML = html
}


function addMessage(e){
let time = new Date;

var mensaje = {
    author: document.getElementById('email').value,
    time: time,
    message: document.getElementById('texto').value
}
socket.emit('new-message', mensaje);
return false
}
