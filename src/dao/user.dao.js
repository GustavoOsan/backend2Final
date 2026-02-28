const userModel = require('./models/user.model');

class UserDAO {
    async getByEmail(email) {
        return await userModel.findOne({ email });
    }
    
    async getById(id) {
        return await userModel.findById(id);
    }
    
    async create(user) {
        return await userModel.create(user);
    }
    
    async update(email, data) {
        return await userModel.updateOne({ email }, data);
    }
}

module.exports = new UserDAO();