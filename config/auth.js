
const ensureAuthenticated = (req, res, next)=> {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('../');
}
const forwardAuthenticated = (req, res, next)=> {
    if (!req.isAuthenticated()) {
    return next();
    }
    res.redirect('/redirect');      
}
const checkRole = roles => (req, res, next) =>
    !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();

module.exports = {
    ensureAuthenticated,
    forwardAuthenticated,
    checkRole
};
  