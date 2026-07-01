const cart = require("../data/cart");

function calculateTotal(){

    const total = cart.reduce((sum,p)=> sum + p.price, 0);
    console.log(`Total: $${total}`);
    return total;
}

modules.exports = calculateTotal;