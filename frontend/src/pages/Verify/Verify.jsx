import React, { useContext, useEffect } from "react";
import "./Verify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";

const Verify = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const verifyPayment = async () => {
    try {
      const response = await axios.post(url + "/api/order/verify", {
        success,
        orderId,
      });

      if (response.data.success) {
        navigate("/myorders");
        toast.success("Order Placed Successfully");
      } else {
        toast.error("Something went wrong");
        navigate("/");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);

      if (error.response) {
        // If server responded with an error
        toast.error(
          `Error: ${error.response.data.message || "Server error occurred."}`
        );
      } else if (error.request) {
        // If no response received
        toast.error("Error: No response from server. Please try again.");
      } else {
        // Any other errors (e.g., network issues)
        toast.error(`Error: ${error.message}`);
      }

      navigate("/");
    }
  };

  useEffect(() => {
    verifyPayment();
  }, []);
  return (
    <div className="verify">
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;
