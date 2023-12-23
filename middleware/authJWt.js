import JWT from "jsonwebtoken";
const authJWT = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(400)
      .json({
        success: false,
        message: "NOT Autherized user , Please loggedIn",
      });
  }

  //verfiy existing token
  try {
    const userDetails = await JWT.verify(token, process.env.SECRET);
    req.user = userDetails;

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export default authJWT;
