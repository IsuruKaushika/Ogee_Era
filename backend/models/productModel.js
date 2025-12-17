import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: false, min: 0, max: 100 },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    sizes: { type: Array, required: true },
    bestseller: { type: Boolean, default: false },
    date: { type: Number, required: true },
    // Add stock status field
    stockStatus: { 
        type: String, 
        enum: ['In Stock', 'Out of Stock', 'Limited Stock'], 
        default: 'In Stock',
        required: true 
    },
    // Add size chart image
    sizeChart: { type: String } // URL or path to size chart image
});

const productModel = mongoose.models.product || mongoose.model('Product', productSchema);

export default productModel;