import express  from "express";
import OrderController from "../controllers/OrderController.js";

const router = express.Router();

router.post('/CreateOrder', OrderController.createOrder);

router.get('/getAllOrders', OrderController.getAllOrders);

router.get('/GetbyOrderId/:orderId', OrderController.getOrderById);

router.get('/byStatus/:status', OrderController.getOrdersByStatus);

router.put('/updateByProductId/:orderId', OrderController.updateOrder);

router.delete('/deleteByOrderId/:orderId', OrderController.deleteOrder);

export default router;

