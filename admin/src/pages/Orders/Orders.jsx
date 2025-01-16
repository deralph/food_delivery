import React from "react";
import "./Orders.css";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { assets } from "../../assets/assets";
import { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Orders = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);

  const fetchAllOrder = async () => {
    try {
      const response = await axios.get(url + "/api/order/list", {
        headers: { token },
      });

      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);

      if (error.response) {
        // Error response from the server
        toast.error(
          `Error: ${error.response.data.message || "Server error occurred."}`
        );
      } else if (error.request) {
        // No response received
        toast.error("Error: No response from server. Please try again.");
      } else {
        // Any other errors
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/status",
        {
          orderId,
          status: event.target.value,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchAllOrder(); // Refresh the orders list after status update
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);

      if (error.response) {
        // Error response from the server
        toast.error(
          `Error: ${error.response.data.message || "Server error occurred."}`
        );
      } else if (error.request) {
        // No response received
        toast.error("Error: No response from server. Please try again.");
      } else {
        // Any other errors
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    if (!admin && !token) {
      toast.error("Please Login First");
      navigate("/");
    }
    fetchAllOrder();
  }, []);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity;
                  } else {
                    return item.name + " x " + item.quantity + ", ";
                  }
                })}
              </p>
              <p className="order-item-name">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>${order.amount}</p>
            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
