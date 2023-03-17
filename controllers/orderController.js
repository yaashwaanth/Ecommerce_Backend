const Order = require("../models/oderModels");
const catchAsyncError = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


exports.newOrder=catchAsyncError(async(req,res,next)=>{
    const {shippingInfo,
           orderItems,
           paymentInfo,
           itemsPrice,
           taxPrice,
           shippingPrice,
           totalPrice,
    } = req.body;

    const order = await Order.create({
           shippingInfo,
           orderItems,
           paymentInfo,
           itemsPrice,
           taxPrice,
           shippingPrice,
           totalPrice,
           paidAt:Date.now(),
           user:req.user._id,
    });
    res.status(201).json({
        success:true,
        order,
    })

});

// Get single orders
exports.getSingleOrder = catchAsyncError(async(req,res,next)=>{

    const order = await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        next(new ErrorHander(`Order not found with this Id`,404))
    }
        res.status(200).json({
            success:true,
            order
        })
})


// Get logged in user orders
exports.myOrders = catchAsyncError(async(req,res,next)=>{

    const orders = await Order.find({user: req.user._id});
    if(!orders){
        next(new ErrorHander(`Order not found with this Id`,404))
    }
        res.status(200).json({
            success:true,
            orders
        })
})

//[4:26:00]
//Get all orders -- Admin
exports.getAllOrders = catchAsyncError(async(req,res,next)=>{

    const orders = await Order.find();
   let totalAmount=0;
   orders.forEach((order)=>{
            totalAmount+=order.totalPrice;

   })
        res.status(200).json({
            success:true,
            totalAmount,
            orders
        })
})


//4:28:00
//update order status -- Admin
exports.updateOrder = catchAsyncError(async(req,res,next)=>{

    const order = await Order.findById(req.params.id);
    if(!orders){
        next(new ErrorHander(`Order not found with this Id`,404))
    }
    
  if(order.orderStatus=="Deliverd"){
      return next(new ErrorHander("You have already deliverd this order",404));

  }
  order.orderItems.forEach(async(o)=>{
      await updateStock(o.product,o.quantity);
  })

  order.orderStatus =req.body.status;
if(req.body.status==="Deliverd")
{
  order.deliverdAt=Date.now();

}

await order.save({validateBeforeSave:false});

        res.status(200).json({
            success:true,
            
        })
})


async function updateStock(id,quantity){
  const product = await Product.findById(id);
  product.Stock=product.stock-quantity;
  await  product.save({validateBeforeSave:false})
};


//delete Order-- Admin
exports.deleteOrder = catchAsyncError(async(req,res,next)=>{

    const order = await Order.findById(req.params.id);
    if(!orders){
        next(new ErrorHander(`Order not found with this Id`,404))
    }
  
    await order.remove();
        res.status(200).json({
            success:true,
            totalAmount,
            orders
        })
})