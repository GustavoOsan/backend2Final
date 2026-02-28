const cartDAO = require('../dao/cart.dao');
const productDAO = require('../dao/product.dao');
const ticketDAO = require('../dao/ticket.dao'); 
const { v4: uuidv4 } = require('uuid');
const { sendMail } = require('../services/mail.service');

const createCart = async (req, res) => {
    try {
        const newCart = await cartDAO.create();
        res.send({ status: 'success', payload: newCart });
    } catch (error) {
        console.error("Error en createCart:", error);
        res.status(500).send({ status: 'error', message: 'Error al crear carrito' });
    }
}

const getCartById = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartDAO.getById(cid);

        if (!cart) {
            return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });
        }

        res.send({ status: 'success', payload: cart });
    } catch (error) {
        console.error("Error en getCartById:", error);
        res.status(500).send({ status: 'error', message: 'Error al obtener carrito' });
    }
}

const addProductToCart = async (req, res) => {
    try {
        const { pid } = req.params;
        const cid = req.params.cid || req.user.cart;

        if (!cid) {
            return res.status(400).send({ status: 'error', message: 'No se encontro un carrito para este usuario' });
        }

        const cart = await cartDAO.getById(cid);
        if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

        const product = await productDAO.getById(pid);
        if (!product) return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });

        const productIndex = cart.products.findIndex(p => p.product._id.toString() === pid);

        if (productIndex === -1) {
            cart.products.push({ product: pid, quantity: 1 });
        } else {
            cart.products[productIndex].quantity++;
        }

        const result = await cartDAO.update(cid, { products: cart.products });
        res.send({ status: 'success', payload: result });

    } catch (error) {
        console.error("Error en addProductToCart:", error);
        res.status(500).send({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
}

const purchaseCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartDAO.getById(cid);

        if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });

        const unavailableProducts = [];
        let totalAmount = 0;

        for (let i = 0; i < cart.products.length; i++) {
            const item = cart.products[i];
            const product = item.product;
            const quantity = item.quantity;

            if (product.stock >= quantity) {
                product.stock -= quantity;
                await productDAO.update(product._id, { stock: product.stock }); 
                totalAmount += product.price * quantity;
            } else {
                unavailableProducts.push(product._id.toString());
            }
        }
        
        cart.products = cart.products.filter(item => unavailableProducts.includes(item.product._id.toString()));
        await cartDAO.update(cid, { products: cart.products });

        if (totalAmount > 0) {
            const ticket = await ticketDAO.create({
                code: uuidv4(),
                amount: totalAmount,
                purchaser: req.user.email
            });

            await sendMail({
                to: req.user.email,
                subject: `Compra exitosa - Ticket: ${ticket.code}`,
                html: `
                    <h1>¡Gracias por tu compra!</h1>
                    <p>Tu codigo de ticket es: <strong>${ticket.code}</strong></p>
                    <p>Total pagado: $${ticket.amount}</p>
                    <hr>
                    <p>Los productos que no tenian stock han quedado en tu carrito.</p>
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
        console.error("Error en purchaseCart:", error);
        res.status(500).send({ status: 'error', message: 'Error al procesar la compra' });
    }
}

module.exports = {
    createCart,
    getCartById,
    addProductToCart,
    purchaseCart
}