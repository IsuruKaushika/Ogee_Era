import express from 'express';
import {
  placeOrder,
  userOrders,
  updateStatus,
  allOrders,
  placeOrderWithCard,
  createPendingOrder,
  payhereNotify,
  payhereSuccess,
  payhereFailure,
  deleteOrder
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

//for admin
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);

//payment
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/visa', authUser, placeOrderWithCard);

// PayHere integration routes
orderRouter.post('/create-pending', authUser, createPendingOrder);
orderRouter.post('/payhere-notify', payhereNotify); // No auth middleware since PayHere server needs access
orderRouter.get('/payhere-success', payhereSuccess);
orderRouter.get('/payhere-failure', payhereFailure);

  
//User Feature
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/delete', adminAuth, deleteOrder)

export default orderRouter;