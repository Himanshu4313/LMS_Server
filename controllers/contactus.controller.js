import sendEmail from "../utils/send.email.js";

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
    
    try {
         
        const subject = 'Contact Us from';
        const textMessage  = `<h2>${name}</h2> <h3>Email: ${email}</h3> <p>${message}</p>`;

        await sendEmail(process.env.CONTACT_US_EMAIL,subject,textMessage)

    } catch (error) {
      return res.status(500).json({
             success:false,
             message:"Failed to send Email"
      })
    }

    res.status(200).json({
      success: true,
      message: " Your request form submited Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong.please try again",
    });
  }
};
