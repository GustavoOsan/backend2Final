const cartModel = require('./models/cart.model');

class CartDAO {
    async create() {
        return await cartModel.create({ products: [] });
    }
    
    async getById(id) {
        return await cartModel.findById(id).populate('products.product');
    }

    async update(id, data) {
        return await cartModel.updateOne({ _id: id }, data);
    }
}

module.exports = new CartDAO();