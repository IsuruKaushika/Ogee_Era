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
  cancelPendingOrder,
  deleteOrder,
  orderReport
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';

const orderRouter = express.Router();

//for admin
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.post('/report', adminAuth, orderReport);

//payment
orderRouter.post('/place', optionalAuth, placeOrder);
orderRouter.post('/visa', optionalAuth, placeOrderWithCard);

// PayHere integration routes
orderRouter.post('/create-pending', optionalAuth, createPendingOrder);
orderRouter.post('/payhere-notify', payhereNotify); // No auth middleware since PayHere server needs access
orderRouter.get('/payhere-success', payhereSuccess);
orderRouter.get('/payhere-failure', payhereFailure);
orderRouter.post('/cancel-pending', optionalAuth, cancelPendingOrder);

  
//User Feature
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/delete', adminAuth, deleteOrder)

export default orderRouter;