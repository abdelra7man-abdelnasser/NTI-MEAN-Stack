const cart = require("../data/cart");

function removeFromCart(id){

    const index= cart.findIndex((p)=> p.id === id);
    if(index === -1){
        console.log(`Product with ID ${id} is not in the cart`);
        return;
    }

    const removed = cart.splice(index, 1)[0];
    console.log(`${removed.name} removed from cart.`);
}

module.exports = removeFromCart;