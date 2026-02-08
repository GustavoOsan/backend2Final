const cartModel = require('../dao/models/cart.model');
const productModel = require('../dao/models/product.model');
const ticketModel = require('../dao/models/ticket.model'); 
const { v4: uuidv4 } = require('uuid'); 
const { sendMail } = require('../services/mail.service'); 

const createCart = async (req, res) => {
    try {
        const newCart = await cartModel.create({ products: [] });
        res.send({ status: 'success', payload: newCart });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: 'Error al crear carrito' });
    }
}

const getCartById = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid).populate('products.product');

        if (!cart) {
            return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });
        }

        res.send({ status: 'success', payload: cart });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: 'Error al obtener carrito' });
    }
}

const addProductToCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        
        const cart = await cartModel.findById(cid);
        if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

        const product = await productModel.findById(pid);
        if (!product) return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex === -1) {
            cart.products.push({ product: pid, quantity: 1 });
        } else {
            cart.products[productIndex].quantity++;
        }

        const result = await cartModel.updateOne({ _id: cid }, cart);
        res.send({ status: 'success', payload: result });

    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
}

const purchaseCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartModel.findById(cid).populate('products.product');

        if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

        const unavailableProducts = [];
        let totalAmount = 0;

        for (let i = 0; i < cart.products.length; i++) {
            const item = cart.products[i];
            const product = item.product;
            const quantity = item.quantity;

            if (product.stock >= quantity) {
                product.stock -= quantity;
                await product.save(); 
                totalAmount += product.price * quantity;
            } else {
                unavailableProducts.push(item.product._id.toString());
            }
        }

        cart.products = cart.products.filter(item => unavailableProducts.includes(item.product._id.toString()));
        await cart.save();

        if (totalAmount > 0) {
            const ticket = await ticketModel.create({
                code: uuidv4(),
                amount: totalAmount,
                purchaser: req.user.email 
            });

            await sendMail({
                to: req.user.email,
                subject: `Compra exitosa - Ticket: ${ticket.code}`,
                html: `
                    <h1>¡Gracias por tu compra!</h1>
                    <p>Tu código de ticket es: <strong>${ticket.code}</strong></p>
                    <p>Total pagado: $${ticket.amount}</p>
                    <hr>
                    <p>Los productos que no tenían stock han quedado en tu carrito.</p>
                `
            });

            return res.send({ 
                status: 'success', 
                message: 'Compra realizada y ticket enviado', 
                ticket: ticket,
                unavailable_products: unavailableProducts 
            });
        } else {
            return res.send({ 
                status: 'error', 
                message: 'No se pudo realizar la compra por falta de stock',
                unavailable_products: unavailableProducts 
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: 'Error al procesar la compra' });
    }
}

module.exports = {
    createCart,
    getCartById,
    addProductToCart,
    purchaseCart 
}