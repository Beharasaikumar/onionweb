import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import {
  fetchAllDelivery,
  fetchAllFoods,
  getBookmarksThunk,
  removeFromBookmarksThunk,
} from "../../store";
import { addToBookmarksThunk } from "../../store/thunks/addToBookmarksThunk";
import { getOpeningStatus, getStringFromArray } from "../../utils/utils";
import { useThunk } from "../../customHooks/useThunk";
import { Spinner, useToast } from "@chakra-ui/react";
import { BsBookmarkPlus, BsBookmarkCheckFill } from "react-icons/bs";
import FoodCard from "../../components/DeliveryRestaurant/FoodCard";

// Optional: fallback data (from BrandCarousel)
const brandArray = [];


const DeliveryRestaurantPage = () => {
  const { cafeId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);

  const { allDeliveryRestaurants } = useSelector((state) => state.delivery);
  const allFoodsArray = useSelector((state) => state.food);
  const { userId, bookmarks } = useSelector((state) => state.user);
  const location = useSelector((state) => state.location);

  const [runFetchAllDeliveryThunk] = useThunk(fetchAllDelivery);
  const [runFetchAllFoodsThunk] = useThunk(fetchAllFoods);
  const [runGetBookmarksThunk] = useThunk(getBookmarksThunk);
  const [runAddToBookmarkThunk, , addingLoader] = useThunk(addToBookmarksThunk);
  const [runRemoveBookmarkThunk, , removingLoader] = useThunk(removeFromBookmarksThunk);

  const [restaurantData, setRestaurantData] = useState();
  const [foodData, setFoodData] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoadingFood, setIsLoadingFood] = useState(true);

  // Initial data fetch
  useEffect(() => {
    if (!hasFetchedRef.current) {
      runFetchAllDeliveryThunk();
      runFetchAllFoodsThunk();
      runGetBookmarksThunk({ userId, token: localStorage.getItem("token") });
      hasFetchedRef.current = true;
    }
  }, [runFetchAllDeliveryThunk, runFetchAllFoodsThunk, runGetBookmarksThunk, userId]);

  // Set restaurant data
  useEffect(() => {
    if (!allDeliveryRestaurants.length || !cafeId) return;

    const found = allDeliveryRestaurants.find((item) => item._id === cafeId);
    const fallback = brandArray.find((item) => item._id === cafeId);

    if (found) {
      setRestaurantData(found);
    } else if (fallback) {
      setRestaurantData(fallback);
    } else {
      toast({
        title: "Restaurant not found",
        description: "Redirecting to explore page...",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/explore");
    }
  }, [cafeId, allDeliveryRestaurants, navigate, toast]);

  // Set food data
  useEffect(() => {
    if (restaurantData?.cuisine?.length && allFoodsArray.length) {
      const filteredFoods = allFoodsArray.filter((food) =>
        restaurantData.cuisine.includes(food.cuisine)
      );
      setFoodData(filteredFoods);
      setIsLoadingFood(false);
    }
  }, [restaurantData, allFoodsArray]);

  // Bookmark status
  useEffect(() => {
    if (restaurantData && bookmarks) {
      const isBookmarked = bookmarks.some(
        (item) => item?.restaurantId?._id === restaurantData._id
      );
      setIsBookmarked(isBookmarked);
    }
  }, [restaurantData, bookmarks]);

  // Handle bookmark toggle
  const handleBookmarkButton = () => {
    if (localStorage.getItem("token")) {
      const argument = {
        userId,
        restaurantId: restaurantData._id,
        token: localStorage.getItem("token"),
      };
      if (isBookmarked) {
        runRemoveBookmarkThunk(argument);
      } else {
        runAddToBookmarkThunk(argument);
      }
    } else {
      toast({
        title: "Login Required",
        description: "Please log in to use the bookmark feature.",
        status: "info",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const openingStatus = getOpeningStatus();

  if (!restaurantData) {
    return (
      <main className="flex justify-center items-center h-80">
        <Spinner size="xl" color="red.400" thickness="5px" emptyColor="gray.200" />
      </main>
    );
  }

  // Render food section
  let foodJsx;
  if (isLoadingFood) {
    foodJsx = (
      <Spinner size="xl" color="red.400" thickness="5px" emptyColor="gray.200" />
    );
  } else if (foodData.length === 0) {
    foodJsx = <p className="text-center text-gray-400">No food items available.</p>;
  } else {
    foodJsx = foodData.map((food) => <FoodCard food={food} key={food._id} />);
  }

  return (
    <main className="px-20 max-[500px]:px-7 flex flex-col text-gray-500">
      <hr className="h-[0.5px] bg-gray-300 my-2" />

      <div className="flex items-start justify-between">
        <h2 className="text-4xl max-[500px]:text-2xl text-black font-semibold">
          {restaurantData?.name}
        </h2>
        <div className="flex gap-4 font-semibold text-white items-start">
          <div className="flex flex-col items-end">
            <span className="flex items-center bg-green-600 gap-1 p-1 rounded-lg">
              {restaurantData?.rating} <FaStar className="text-xs" />
            </span>
            <span className="text-black text-[10px]">Delivery Ratings</span>
          </div>
          <div className="flex flex-col items-end max-[500px]:hidden">
            <span className="flex items-center bg-green-600 gap-1 p-1 rounded-lg">
              {restaurantData?.diningRating} <FaStar className="text-xs" />
            </span>
            <span className="text-black text-[10px]">Dining Ratings</span>
          </div>
        </div>
      </div>

      <div className="text-lg max-[500px]:text-base">
        <p>{getStringFromArray(restaurantData?.cuisine)}</p>
        <p className="text-gray-400 capitalize">{location}</p>
      </div>

      <div className="flex gap-1 text-sm">
        <p
          className={
            openingStatus === "Open now"
              ? "text-orange-400"
              : "text-red-500"
          }
        >
          {openingStatus}
        </p>
        <p> - 10am - 11pm (Today)</p>
      </div>

      <div
        onClick={handleBookmarkButton}
        className={`flex items-center p-2 rounded-lg border border-gray-500 gap-2 self-start text-sm cursor-pointer ${
          isBookmarked ? "bg-primary text-white" : "hover:bg-gray-100"
        } my-4`}
        title="Toggle Bookmark"
        aria-label="Bookmark Button"
      >
        {addingLoader || removingLoader ? (
          <Spinner size="xs" />
        ) : isBookmarked ? (
          <BsBookmarkCheckFill />
        ) : (
          <BsBookmarkPlus className="text-primary" />
        )}
        <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
      </div>

      <p className="text-black text-2xl font-medium mb-2">Order Online</p>
      <hr className="h-[0.5px] bg-gray-300" />

      <div className="flex flex-col gap-6 max-[500px]:gap-8 my-6">{foodJsx}</div>
    </main>
  );
};

export default DeliveryRestaurantPage;
