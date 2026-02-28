const productModel = require('./models/product.model');

class ProductDAO {
    async getAll(filter, options) {
        return await productModel.paginate(filter, options);
    }
    
    async getById(id) {
        return await productModel.findById(id);
    }
    
    async create(data) {
        return await productModel.create(data);
    }
    
    async update(id, data) {
        return await productModel.updateOne({ _id: id }, data);
    }
    
    async delete(id) {
        return await productModel.deleteOne({ _id: id });
    }
}

module.exports = new ProductDAO();