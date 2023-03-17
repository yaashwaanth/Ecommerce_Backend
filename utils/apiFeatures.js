// const Logger = require("nodemon/lib/utils/log");

// [1:25:03]
// class ApiFeatures{
//     constructor(query,queryStr){
//         this.query=query;
//         this.queryStr=queryStr;
//     }
//     search(){
//         const keyword = this.queryStr.keyword ? {
//             name:{
//                 $regex:this.queryStr.keyword,
//                 $options:"i",

//             }
//         }:{}
//         this.query=this.query.find({...keyword});
//         return this;
//     }
//     // [1:35:00]
//     filter(){
//         const querycopy = {...this.queryStr};
//         console.log(querycopy);
//         // Removing some feilds for category
//         const removeFeilds = ["keyword","page","limit"];
//         removeFeilds.forEach(key => delete querycopy[key]);
//         console.log(querycopy);



//         // filter for price and rating
//         let queryStr=JSON.stringify(querycopy);
//         queryStr=queryStr.replace(/\b(gte|gt|lt|lte)\b/g,key =>`$${key}`)

//         this.query=this.query.find(JSON.parse(querycopy));
//         return this;

//     }
//     pagination(resultPerPage){
//             const currentPage=Number(this.queryStr.page) || 1;
//             const skip = resultPerPage*(currentPage-1);

//             this.query = this.query.limit(resultPerPage).skip(skip);

//             return this;
//     }


// };

// module.exports=ApiFeatures;


// ****************


class ApiFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    search() {
      const keyword = this.queryStr.keyword
        ? {
            name: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          }
        : {};
  
      this.query = this.query.find({ ...keyword });
      return this;
    }
  
    filter() {
      const queryCopy = { ...this.queryStr };
      //   Removing some fields for category
      const removeFields = ["keyword", "page", "limit"];
  
      removeFields.forEach((key) => delete queryCopy[key]);
  
      // Filter For Price and Rating
  
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
  
      this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }

    // const querycopy = {...this.queryStr};
    //         console.log(querycopy);
    //         // Removing some feilds for category
    //         const removeFeilds = ["keyword","page","limit"];
    //         removeFeilds.forEach(key => delete querycopy[key]);
    //         console.log(querycopy);
    
    
    
    //         // filter for price and rating
    //         let queryStr=JSON.stringify(querycopy);
    //         queryStr=queryStr.replace(/\b(gte|gt|lt|lte)\b/g,key =>`$${key}`)
    
    //         this.query=this.query.find(JSON.parse(querycopy));
    //         return this;
    
    //     }
  
    pagination(resultPerPage) {
      const currentPage = Number(this.queryStr.page) || 1;
  
      const skip = resultPerPage * (currentPage - 1);
  
      this.query = this.query.limit(resultPerPage).skip(skip);
  
      return this;
    }
  }
  
  module.exports = ApiFeatures;