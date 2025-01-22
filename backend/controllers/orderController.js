import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
const paystackBaseUrl = "https://api.paystack.co";

// placing user order for frontend
const placeOrder = async (req, res) => {
  // const frontend_url = "http://localhost:5173";
  const frontend_url = "https://foodsdeliveryfrontend.netlify.app/";
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const totalAmount =
      req.body.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ) + 2;

    const response = await fetch(`${paystackBaseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: req.body.email, // User email is required by Paystack
        amount: totalAmount * 100, // Amount in kobo
        callback_url: `${frontend_url}/verify?orderId=${newOrder._id}`,
      }),
    });

    const data = await response.json();
    if (data.status) {
      res.json({ success: true, session_url: data.data.authorization_url });
    } else {
      res.json({ success: false, message: "Failed to initialize payment" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, reference } = req.body;
  try {
    const response = await fetch(
      `${paystackBaseUrl}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const data = await response.json();
    if (data.status && data.data.status === "success") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({});
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// API for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    } else {
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
