let mongoose = require('mongoose');

let productSchema = new mongoose.Schema({
    title: {
        type: String
    },
    link: {
        type: String
    },
    image: {
        type: String
    },
    orignalPrice: {
        type: String
    },
    salePrice: {
        type: String
    },
    created_at: {
        type: Number, default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);