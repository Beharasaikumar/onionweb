import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useDispatch } from "react-redux";
import { handleCarouselClickThunk } from "../../store/thunks/handleCarouselClickThunk";

const Carousel = ({ dataArray }) => {
  const [pointers, setPointers] = useState({ left: 0, right: 5 });
  const dispatch = useDispatch();

  const handleCarouselClick = (food) => {
    if (food.type === "food") {
      dispatch(handleCarouselClickThunk(food.name));
    } else if (food.type === "brand") {
      console.log(food.name);
    }
  };

  const handleBackArrow = () => {
    setPointers((prev) => ({
      left: Math.max(0, prev.left - 1),
      right: Math.max(5, prev.right - 1),
    }));
  };

  const handleForwardArrow = () => {
    setPointers((prev) => ({
      left: Math.min(dataArray.length - 6, prev.left + 1),
      right: Math.min(dataArray.length - 1, prev.right + 1),
    }));
  };

  const renderedCarousel = dataArray.map((food, index) => {
    if (index >= pointers.left && index <= pointers.right) {
      const content = (
        <div
          key={food._id || food.name}
          id={food.name}
          className="flex flex-col items-center gap-2 w-60 cursor-pointer"
          onClick={() => handleCarouselClick(food)}
        >
          <div className="rounded-full">
            <img
              src={food.img}
              alt={food.name}
              className="rounded-full w-60 shadow-md"
            />
          </div>
          <span className="text-xl text-center font-medium">{food.name}</span>
        </div>
      );

      return food.type === "brand" ? (
        <Link
          to={`/explore/${food._id}`}
          key={food._id || food.name}
          id={food.name}
          className="flex flex-col items-center gap-2 w-60 cursor-pointer"
          onClick={() => handleCarouselClick(food)}
        >
          {content.props.children}
        </Link>
      ) : (
        content
      );
    }
    return null;
  });

  return (
    <div className="relative">
      <div className="flex gap-10 max-[500px]:overflow-x-scroll max-[500px]:no-scrollbar">
        {renderedCarousel}
      </div>

      {pointers.left > 0 && (
        <IoIosArrowBack
          onClick={handleBackArrow}
          className="absolute -left-4 top-[60px] bg-white p-2 text-4xl rounded-full shadow-xl hover:bg-gray-100 cursor-pointer max-[500px]:hidden"
        />
      )}

      {pointers.right < dataArray.length - 1 && (
        <IoIosArrowForward
          onClick={handleForwardArrow}
          className="absolute -right-4 top-[60px] bg-white p-2 text-4xl rounded-full shadow-xl hover:bg-gray-100 cursor-pointer max-[500px]:hidden"
        />
      )}
    </div>
  );
};

export default Carousel;
