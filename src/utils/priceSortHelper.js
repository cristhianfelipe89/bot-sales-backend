/**
 * Helper simple para mapear filtros de ordenamiento a objetos de sort de mongoose.
 */
export const mapSort = (sortKey) => {
    const map = {
        price_asc: { price: 1 },
        price_desc: { price: -1 },
        name_asc: { name: 1 },
        name_desc: { name: -1 },
        created_desc: { createdAt: -1 },
        created_asc: { createdAt: 1 }
    };
    return map[sortKey] || { createdAt: -1 };
};
/*  */