const ticketModel = require('./models/ticket.model');

class TicketDAO {
    async create(data) {
        return await ticketModel.create(data);
    }
}

module.exports = new TicketDAO();