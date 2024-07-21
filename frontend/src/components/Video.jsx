import React from "react";
import { RiDeleteBin6Line } from "react-icons/ri";

const Video = (props) => {
  const { title, id } = props;
  const thumbnailUrl = `http://localhost:3000/thumbnail/${id}`;
  const profilePicture = `http://localhost:3000/profilePicture/${props.user._id}`;
  return (
    <div className="p-4 m-4 flex flex-col w-min ">
      <div className="w-[360px] h-[220px] justify-center items-center bg-black   shadow-lg shadow-black">
        <img
          onClick={() => props.handleVideoPlayer(id)}
          src={thumbnailUrl}
          alt="ThumbnailNotFound"
          className="object-cover w-full h-full rounded-2xl cursor-pointer border border-black"
        />
      </div>
      <div className="flex flex-row justify-between">
        <span className="font-bold text-[20px] p-1 flex flex-row justify-center items-center">
          <img
            className="w-[35px] h-[35px] rounded-full object-cover m-2 border border-white border-1"
            src={profilePicture}
            alt={props.user.name}
          />
          {title && title.toUpperCase()}
        </span>
        {props.nav && (
          <button className="m-2 w-[35px] h-[35px] rounded-full bg-indigo-700 text-xl flex justify-center items-center">
            <RiDeleteBin6Line onClick={() => props.handleDelete(id)} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Video;
