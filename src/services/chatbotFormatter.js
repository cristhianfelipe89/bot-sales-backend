/**
 * Funciones para construir respuestas/objetos amigables para el agent/Chatwoot.
 * Exporta un objeto con funciones utilitarias.
 */

const chatbotFormatter = {
    // formatea productos para presentarlos en texto simple o como elementos
    productsToText(products = [], limit = 5) {
        if (!products || products.length === 0) return "No se encontraron productos.";
        const list = products.slice(0, limit).map((p, i) => `${i + 1}. ${p.name} — $${p.price} — stock: ${p.stock}`).join("\n");
        return `Te muestro los primeros ${Math.min(limit, products.length)} resultados:\n${list}`;
    },

    // crea un resumen de carrito
    cartSummary(cart) {
        if (!cart || !cart.items || cart.items.length === 0) return "Tu carrito está vacío.";
        let total = 0;
        const lines = cart.items.map(it => {
            const name = it.productId?.name || "Producto";
            const price = it.productId?.price || it.price || 0;
            const qty = it.quantity;
            total += price * qty;
            return `- ${name} x${qty} — $${price * qty}`;
        });
        return `Tu carrito:\n${lines.join("\n")}\nTotal: $${total}`;
    },

    // formato que devuelve receiveMessage para que n8n lo use en el prompt
    formatForAgent({ conversation, latestMessage, cart, recommended }) {
        return {
            conversationId: conversation?._id,
            context: conversation?.context || {},
            messages: conversation?.messages || [],
            latestMessage,
            cart,
            recommended,
            humanReadableCart: this.cartSummary(cart),
        };
    }
};

export default chatbotFormatter;
