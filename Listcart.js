const cart = require("../data/cart");

function listCart(){

    if(cart.lenght ===0){
        console.log("Cart is empty");
        return;
    }
    console.log("Cart items:");
    cart.forEach((p)=> console.log(`- $p.name : ${p.price}`));
}

modules.exports= listCart;