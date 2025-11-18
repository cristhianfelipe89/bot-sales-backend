import Product from "../models/Product.js";

/**
 * GET /api/products?category=&search=&sort=price_asc|price_desc|name_asc|name_desc&limit=&skip=
 */
export const getProducts = async (req, res) => {
    try {
        const { category, search, sort, limit = 50, skip = 0 } = req.query;
        const q = {};
        if (category) q.category = category;
        if (search) q.name = { $regex: search, $options: "i" };

        let query = Product.find(q).skip(parseInt(skip)).limit(parseInt(limit));

        if (sort) {
            const mapping = {
                price_asc: { price: 1 },
                price_desc: { price: -1 },
                name_asc: { name: 1 },
                name_desc: { name: -1 }
            };
            const sortObj = mapping[sort];
            if (sortObj) query = query.sort(sortObj);
        } else {
            query = query.sort({ createdAt: -1 });
        }

        const products = await query.exec();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, category, price, stock } = req.body;
        const p = await Product.create({ name, description, category, price, stock });
        res.json(p);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const p = await Product.findById(req.params.id);
        if (!p) return res.status(404).json({ msg: "Product not found" });
        res.json(p);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
