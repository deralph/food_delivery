import React, { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { PaystackButton } from "react-paystack";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const deliveryFee = 500;

  const { getTotalCartAmount, token, food_list, cartItems, url } =
    useContext(StoreContext);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };
  let orderItems = [];

  // Loop through the food list and prepare the order items
  food_list.map((item) => {
    if (cartItems[item._id] > 0) {
      let itemInfo = item;
      itemInfo["quantity"] = cartItems[item._id];
      orderItems.push(itemInfo);
    }
  });
  // Prepare the order data
  let orderData = {
    address: data,
    items: orderItems,
    amount: getTotalCartAmount() + deliveryFee, // Including extra charge (e.g., shipping)
  };
  const componentProps = {
    email: "paystackwebview@something.com",
    amount: orderData.amount,
    metadata: orderData,
    publicKey: "pk_test_62ba3fa4e30ace38c25feca74eae65646f1cf095",
    text: "PROCEED TO PAYMENT NOW",
    onSuccess: (res) => {
      console.log(res);
      if (res.status === "success") {
        placeOrder(res);
        console.log("payment done");
      } else {
        toast.error("payment did not go through");
      }
    },
    onClose: () => {
      toast.error("Something went wrong");
      alert("Wait! You need this oil, don't go!!!!");
      navigate("/");
    },
  };
  const placeOrder = async (res) => {
    try {
      const response = await axios.post(
        url + "/api/order/place",
        { ...orderData, res },
        {
          headers: { token },
        }
      );
      console.log("placing order");
      console.log(response);
      if (response.data.success) {
        navigate("/myorders");
        toast.success("Order Placed Successfully");
      } else {
        toast.error("Something went wrong");
        navigate("/");
      }
    } catch (error) {
      console.error("Error placing the order:", error);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please Login first");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      toast.error("Please Add Items to Cart");
      navigate("/cart");
    }
  }, [token]);
  return (
    <form className="place-order" onSubmit={(event) => event.preventDefault()}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            value={data.firstName}
            onChange={onChangeHandler}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="text"
          placeholder="Email Address"
        />
        <input
          required
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            value={data.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="Zip Code"
          />
          <input
            required
            name="country"
            value={data.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          type="text"
          placeholder="Phone"
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotals</p>
              <p>₦{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₦{getTotalCartAmount() === 0 ? 0 : deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                ₦
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + deliveryFee}
              </b>
            </div>
          </div>
          <PaystackButton {...componentProps} />
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
