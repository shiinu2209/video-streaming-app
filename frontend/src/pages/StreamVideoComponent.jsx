import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { RiThumbUpLine, RiThumbUpFill } from "react-icons/ri";
import axios from "axios";
import Loader from "../components/Loader";
import Comments from "../components/Comments";

const VideoPlayer = () => {
  const { videoId } = useParams();
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/like/${videoId}`,
        {},
        {
          withCredentials: true,
        }
      );
      setIsLiked(response.data.isLiked);
      setLikes(response.data.likes);
    } catch (error) {
      console.error("Error liking the video:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    const videoDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/videoDetails/${videoId}`
        );
        const date = new Date(response.data.createdAt);
        response.data.createdAt = date.toDateString();
        setVideo(response.data);
        setLikes(response.data.likes.length);
      } catch (error) {
        setError("Error fetching the video");
        console.error("Error fetching the video:", error);
      }
    };
    videoDetails();
    const liked = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/isLiked/${videoId}`,
          {
            withCredentials: true,
          }
        );
        setIsLiked(response.data);
      } catch (error) {
        console.error("Error fetching the video:", error);
      }
    };
    liked();
    setLoading(false);
  }, [videoId]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="flex flex-row">
        {loading && <Loader></Loader>}
        {!loading && (
          <div className="flex flex-col  w-full p-4">
            <video
              ref={videoRef}
              src={`http://localhost:3000/video/${videoId}`}
              controls
              className="bg-black h-full w-auto cursor-pointer rounded-lg"
              onError={(e) => {
                setError("Error fetching the video");
                console.error("Error fetching the video:", e);
              }}
            >
              Your browser does not support the video tag.
            </video>
            <div className="flex justify-between p-2 text-2xl w-full">
              <span>{video?.title}</span>
              <span className=" flex justify-center items-center">
                <span className="pr-3">{likes}likes</span>
                <button onClick={handleLike}>
                  {!isLiked ? (
                    <RiThumbUpLine></RiThumbUpLine>
                  ) : (
                    <RiThumbUpFill></RiThumbUpFill>
                  )}
                </button>
              </span>
            </div>
            <div className=" bg-black bg-opacity-50 p-5 rounded-3xl flex flex-col">
              <span className="text-sm text-zinc-400">
                Posted On:-{video?.createdAt}
              </span>
              <span className="text-sm mt-3">DESCRIPTION:-</span>
              <span className="text-[14px]"> {video?.description}</span>
            </div>
          </div>
        )}
        <Comments videoId={videoId}></Comments>
      </div>
    </>
  );
};

export default VideoPlayer;
