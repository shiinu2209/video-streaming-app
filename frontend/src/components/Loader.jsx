import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="flex items-center justify-center space-x-2">
        <img
          className="h-16 w-16 animate-spin"
          src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
          alt="Loading..."
        />
      </div>
    </div>
  );
};

export default Loader;
