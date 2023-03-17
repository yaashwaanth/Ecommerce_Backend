// creating token and saving in cookie

const sendToken =(user,satusCode,res)=>{
    const token = user.getJWTToken();

    // options for cookie
    const options={
        expires:new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 100
        ),
        httpOnly:true,
    };
    res.status(satusCode).cookie('token',token,options).json({
        success:true,
        user,
        token

    }).render()
};


module.exports = sendToken;