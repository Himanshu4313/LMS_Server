//controller for contact us
export const ContactUs = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are mandatroy",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully submited",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.please try again",
    });
  }
};
