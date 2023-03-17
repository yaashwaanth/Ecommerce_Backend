const express= require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview, getAdminProducts } = require("../controllers/productController");
const { isAuthenticatedUser ,authorizedRoles} = require("../middleware/auth");
const router = express.Router();

// Get all products
router.route("/products").get(getAllProducts);

//get all products admin
router.route("/admin/products").get(isAuthenticatedUser,authorizedRoles("admin"),getAdminProducts);

// Create a product
router.route("/product/new").post(isAuthenticatedUser,authorizedRoles("admin"),createProduct);


// Update a product & Delete a product Get Product details

router.route("/product/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updateProduct)
.delete(isAuthenticatedUser,authorizedRoles("admin"),deleteProduct);

// Get product details
router.route("/product/:id").get(getProductDetails)


router.route("/review").put(isAuthenticatedUser,createProductReview);

router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReview)



module.exports= router;