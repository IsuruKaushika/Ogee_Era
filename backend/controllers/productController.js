import {v2 as cloudinary} from "cloudinary"
import productModel from "../models/productModel.js"

//add product
const addProduct = async(req, res) => {
    try {
        const {
            name, 
            description, 
            price, 
            category, 
            subCategory, 
            sizes, 
            bestseller,
            stockStatus // New field
        } = req.body;

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]
        const sizeChartImage = req.files.sizeChart && req.files.sizeChart[0] // New file field

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url;
            })
        )

        // Upload size chart image if provided
        let sizeChartUrl = null;
        if (sizeChartImage) {
            const result = await cloudinary.uploader.upload(sizeChartImage.path, {resource_type: 'image'});
            sizeChartUrl = result.secure_url;
        }

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: JSON.parse(sizes),
            bestseller: bestseller === "true" ? true : false,
            image: imagesUrl,
            date: Date.now(),
            stockStatus: stockStatus || 'In Stock', // Set default if not provided
            sizeChart: sizeChartUrl // Add size chart URL
        }
        console.log(productData)

        const product = new productModel(productData)
        await product.save()

        res.json({success: true, message: "Product Added Successfully"})
    }
    catch(error){
        res.json({success: false, message: error.message})
    }
}

//list product
// List products sorted by most recent (newest first)
const listProducts = async (req, res) => {
    try {
        // Sort by date field in descending order so newest products appear first
        const products = await productModel.find({}).sort({ date: -1 }); 
        res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//function remove Product
const removeProduct = async(req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success: true, message: "Product Deleted Successfully"})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

//single product info
const singleProduct = async(req, res) => {
    try {
        const {productId} = req.body
        const product = await productModel.findById(productId)
        res.json({success: true, product})
    } catch(error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Update product stock status
const updateStockStatus = async(req, res) => {
    try {
        const { productId, stockStatus } = req.body
        
        if (!['In Stock', 'Out of Stock', 'Limited Stock'].includes(stockStatus)) {
            return res.json({ 
                success: false, 
                message: "Invalid stock status. Must be 'In Stock', 'Out of Stock', or 'Limited Stock'" 
            })
        }
        
        await productModel.findByIdAndUpdate(productId, { stockStatus })
        res.json({ success: true, message: "Stock status updated successfully" })
    } catch(error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    singleProduct, 
    removeProduct, 
    listProducts, 
    addProduct,
    updateStockStatus // New function export
}