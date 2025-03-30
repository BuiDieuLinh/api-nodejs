const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const requireToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader){
        return res.status(401).json({message: "Unauthentication"})
    }
    // validate
    // Bearer <token>
    const arr = authHeader.split(' ');
    if(!arr){
        return res.status(401).json({message: "Unauthentication"})
    }

    const token = arr[1];
    if(!token){
        return res.status(401).json({message: "Unauthentication"})
    }

    jwt.verify(token, JWT_SECRET, function(error, user){
        if(error){
            return res.status(401).json({message: "Invalid token"})
        }
        req.user = user;
        next();
    })
}
function verifyAdmin(req, res, next) {

    if (req.user.role !== "admin") {
      return res.status(401).json({ message: "Access denied. You need an Admin role to get access." });
    }
    next();
  }
module.exports = {requireToken, verifyAdmin};
