const productModel = require('../dao/models/product.model');

const getProducts = async (req, res) => {
    try {
        let { limit = 10, page = 1, sort, query } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);

        let filter = {};
        if (query) {
            filter = { $or: [{ category: query }, { status: query }] };
        }

        let options = {
            limit: limit,
            page: page,
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const result = await productModel.paginate(filter, options);

        res.send({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}` : null
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'error', message: 'Error al obtener productos' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productModel.findById(pid);
        
        if (!product) {
            return res.status(404).send({ status: 'error', message: 'Producto no encontrado' });
        }

        res.send({ status: 'success', payload: product });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error al obtener el producto' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { title, description, price, thumbnail, code, stock, status = true, category } = req.body;

        if (!title || !description || !price || !code || !stock || !category) {
            return res.status(400).send({ status: 'error', message: 'Faltan campos obligatorios' });
        }

        const result = await productModel.create({
            title, description, price, thumbnail, code, stock, status, category
        });

        res.status(201).send({ status: 'success', payload: result });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error al crear producto' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const productToUpdate = req.body;

        const result = await productModel.updateOne({ _id: pid }, productToUpdate);
        
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error al actualizar producto' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const result = await productModel.deleteOne({ _id: pid });
        
        res.send({ status: 'success', payload: result });
    } catch (error) {
        res.status(500).send({ status: 'error', message: 'Error al eliminar producto' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};