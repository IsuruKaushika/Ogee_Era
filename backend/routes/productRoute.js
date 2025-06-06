import express from 'express';
import {
  singleProduct,
  removeProduct,
  listProducts,
  addProduct,
  updateStockStatus
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';
const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.fields([
  {name:'image1', maxCount:1},
  {name:'image2', maxCount:1},
  {name:'image3', maxCount:1},
  {name:'image4', maxCount:1},
  {name:'sizeChart', maxCount:1}
]), addProduct);
productRouter.post('/remove', adminAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProducts);
productRouter.post('/updateStockStatus', adminAuth, updateStockStatus); // Add this new route
productRouter.get('/:id', singleProduct);

export default productRouter;