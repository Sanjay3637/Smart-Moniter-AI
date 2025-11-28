const generateToken = (res, userId) => {
  // Store the authenticated user id in the session instead of issuing a JWT
  if (res && res.req && res.req.session) {
    res.req.session.userId = userId;
  }
};

export default generateToken;
