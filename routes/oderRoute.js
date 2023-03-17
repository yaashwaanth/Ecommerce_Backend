const express = require("express");
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrder } = require("../controllers/orderController");
const { deleteUser } = require("../controllers/userController");
const { isAuthenticatedUser ,authorizedRoles} = require("../middleware/auth");

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser,authorizedRoles("admin"),newOrder);

router.route("/order/:id").get(isAuthenticatedUser,getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser,myOrders);

router.route("/admin/orders").get(isAuthenticatedUser,authorizedRoles("admin"),getAllOrders);

router.route("/admin/order/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updateOrder)
.delete(isAuthenticatedUser,authorizedRoles("admin"),deleteUser);





module.exports = router;