const catchAsyncError = require("../middleware/catchAsyncErrors");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

// create product

exports.createProduct=catchAsyncErrors(async(req,res,next)=>{
    let images=[];
    if(typeof req.body.images==="string"){
        images.push(req.body.images);
    }
    else{
        images=req.body.images;
    }
    const imagesLink=[];
    for(let i=0;i<images.length;i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder:"products",
        });
        imagesLink.push({
            public_id:result.public_id,
            url:result.secure_url,
        })
    }
req.body.images=imagesLink;
req.body.user=req.user.id;
  const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    });
});

// Get all products

// exports.getAllProducts =catchAsyncErrors(async(req,res)=>{
// const resultPerPage =8;
// const productCount = await Product.countDocuments();

//    const apiFeatures= new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);
//    const products= await apiFeatures.query;
// //    const products= await Product.find();
//     //  res.status(200).json({message:"Route is working fine"});
//      res.status(200).json({
//          success:true,
//          products,
//          productCount
//      });

// });

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments();
  
    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter();
    //   .pagination(resultPerPage);
  
    let products = await apiFeature.query.clone();
  
    let filteredProductsCount = products.length;
  
    apiFeature.pagination(resultPerPage);
  
    products = await apiFeature.query;
  
    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount
    });
  });

// Update Product --Admin
exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{
    let product = Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHander("Product not found",404))
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
        product
    })
});


// Delete Product
exports.deleteProduct =catchAsyncErrors(async(req,res)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHander("Product not found",404))
    }

    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product Deleted"
    })

});


// Get single product details
exports.getProductDetails =catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);
   
    // if(!product){
    //     res.success(500).json({
    //         success:false,
    //         message:"Product not found"
    //     })
    // }
    if(!product){
        return next(new ErrorHander("Product not found",404))
    }

    res.status(200).json({
        success:true,
        product
    });
});


// [3:48:00]
// create a review or update a review

exports.createProductReview = catchAsyncError(async(req,res,next)=>{
    const {rating,comment,productId} = req.body;
    const review ={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
   }


  const product = await Product.findById(productId);
  const isReviewed = product.reviews.find(rev=>rev.user.toString() === req.user._id.toString() )
  if(isReviewed){
      product.reviews.forEach(rev=>{
          if(rev.user.toString() === req.user._id.toString())
          rev.rating=rating,
          rev.comment=comment
      })

  }else{
      product.reviews.push(review);
      product.numOfReviews=product.reviews.length
  }
  let avg=0;
  product.reviews.forEach(rev=>{
      avg=avg+rev.rating;
  })
  product.ratings = avg/product.reviews.length

  await product.save({validateBeforeSave:false})
  res.status(200).json({
      success:true
  })

});

// / [4:02:00]
// Get All Reviews of a single product
exports.getProductReviews = catchAsyncError(async(req,res,async)=>{
    const product = await Product.findById(req.query.id);
    if(!product){
        next(new ErrorHander(`Product not found `,404));
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews,

    })
});


// [4:03:05]
// Delete review
exports.deleteReview = catchAsyncError(async(req,res,async)=>{
    const product = await Product.findById(req.query.productId);
    if(!product){
        next(new ErrorHander(`Product not found `,404));
    }
    const review = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

    let avg =0 ;
    reviews.forEach(rev=>{
        avg=avg+rev.rating;
    })
    const ratings = avg/product.reviews.length;

    const numOfReviews = reviews.length;
     
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        reviews:product.reviews,

    })
});



//GET ALL PRODUCTS (ADMIN)

exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
    
  const products = await Product.find();
    res.status(200).json({
      success: true,
      products,
   
    });
  });