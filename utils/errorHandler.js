class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode=statusCode;
        Error.captureStackTrace(this,this.constructor);
    }
}
module.exports=ErrorHandler;



// in js this keyword refers to the object it belongs to .
// it has different values depending on where it is used;
// alone this refers to the global object

// 1.console.log(this);   // refers to window object
// 2.this used in regular function 
// function sum(){
//     var add =2+2;
//     console.log("sum of 2 numbers is " + add);
//     console.log(this);  // again this represents global object [window]
// }

//3.in a method this refers to the owner object
// const thapa = {
//     name:"GYS",
//     quali:"BTECH",
//     sum:function(){
//         var add =2+2;
//         console.log("sum of 2 numbers is " + add);
//         console.log(this);

//     }
// }
// thapa.sum()