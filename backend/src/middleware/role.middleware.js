exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied: Admin only" });
  }
  next();
};

exports.isManager = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ success: false, message: "Access denied: Manager only" });
  }
  next();
};

exports.isEmployee = (req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({ success: false, message: "Access denied: Employee only" });
  }
  next();
};

// Allow multiple roles
exports.hasRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access denied: Requires ${roles.join(" or ")} role` });
    }
    next();
  };
};