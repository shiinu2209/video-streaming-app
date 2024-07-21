import React from "react";
import { useState } from "react";

const Task = () => {
  // Initialize the matrix state with an array of objects
  const [matrix, setMatrix] = useState(
    Array(3)
      .fill(null)
      .map((_, rowIndex) =>
        Array(3)
          .fill(null)
          .map((_, colIndex) => ({
            id: rowIndex * 3 + colIndex,
            clicked: false,
            order: -1,
            color: "bg-white",
          }))
      )
  );

  // State to track the order of clicks
  const [clickOrder, setClickOrder] = useState([]);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = (row, col) => {
    // Avoid further clicks once the last box is clicked
    if (clickCount >= 9) return;

    // Update the matrix state
    setMatrix((prevMatrix) =>
      prevMatrix.map((r, rowIndex) =>
        r.map((box, colIndex) => {
          if (rowIndex === row && colIndex === col && !box.clicked) {
            return {
              ...box,
              clicked: true,
              order: clickCount,
              color: "bg-green-500",
            };
          }
          return box;
        })
      )
    );

    // Update the click order state
    setClickOrder((prevOrder) => [...prevOrder, { row, col }]);
    setClickCount((prevCount) => prevCount + 1);
  };

  // Change all boxes to orange in the order of their original clicks
  const changeToOrange = () => {
    clickOrder.forEach((pos, index) => {
      setTimeout(() => {
        setMatrix((prevMatrix) =>
          prevMatrix.map((r, rowIndex) =>
            r.map((box, colIndex) => {
              if (rowIndex === pos.row && colIndex === pos.col) {
                return {
                  ...box,
                  color: "bg-orange-500",
                };
              }
              return box;
            })
          )
        );
      }, index * 400); // Adjust the delay to control the speed of the color change
    });
  };

  // Trigger color change to orange when the last box is clicked
  if (clickCount === 9) {
    changeToOrange();
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="grid grid-cols-3 gap-2">
        {matrix.map((row, rowIndex) =>
          row.map((box, colIndex) => (
            <div
              key={box.id}
              className={`w-24 h-24 ${box.color} border border-gray-300`}
              onClick={() => handleClick(rowIndex, colIndex)}
            ></div>
          ))
        )}
      </div>
    </div>
  );
};

export default Task;
