import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "https://food-delivery-94mk.onrender.com";
  // const url = "http://localhost:4000";

  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);

  const addToCart = async (itemId) => {
    try {
      if (!cartItems[itemId]) {
        setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
      } else {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
      }

      if (token) {
        const response = await axios.post(
          url + "/api/cart/add",
          { itemId },
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success("Item added to Cart");
        } else {
          toast.error("Something went wrong");
        }
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);

      if (error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Server error occurred."}`
        );
      } else if (error.request) {
        toast.error("Error: No response from server. Please try again.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

      if (token) {
        const response = await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success("Item removed from Cart");
        } else {
          toast.error("Something went wrong");
        }
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);

      if (error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Server error occurred."}`
        );
      } else if (error.request) {
        toast.error("Error: No response from server. Please try again.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        // Ensure `item` and `food_list` are valid
        const itemInfo = food_list.find(
          (product) => String(product._id) === String(item)
        );

        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        } else {
          console.warn(`Item with ID ${item} not found in food_list.`);
        }
      }
    }

    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");

      if (response.data.success) {
        setFoodList(response.data.data);
      } else {
        alert("Error! Products are not fetching..");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);

      if (error.response) {
        alert(
          `Error: ${error.response.data.message || "Server error occurred."}`
        );
      } else if (error.request) {
        alert("Error: No response from server. Please try again.");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const loadCardData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      );

      setCartItems(response.data.cartData);
    } catch (error) {
      console.error("Error loading cart data:", error);

      if (error.response) {
        alert(
          `Error: ${error.response.data.message || "Server error occurred."}`
        );
      } else if (error.request) {
        alert("Error: No response from server. Please try again.");
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
        await loadCardData(localStorage.getItem("token"));
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;
