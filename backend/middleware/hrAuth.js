const hrAuth = (req, res, next) => {
  if (req.user.role !== 'hr') {
    return res.status(403).json({ message: 'Access denied. HR role required.' });
  }
  next();
};

module.exports = hrAuth; 