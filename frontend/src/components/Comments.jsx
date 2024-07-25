import React, { useState, useEffect } from "react";
import axios from "axios";
import { RiDeleteBin6Line } from "react-icons/ri";
import axiosInstance from "../helpers/axiosInstance";

const Comments = (props) => {
  const { videoId } = props;
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [onHover, setOnHover] = useState(-1);
  const handleComment = async () => {
    if (!comment) return;
    setComment("");
    try {
      await axiosInstance.post(`/comment/${videoId}`, {
        text: comment,
        videoId,
      });
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/comment/${videoId}/${commentId}`);
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(`/comments/${videoId}`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  useEffect(() => {
    fetchComments();
  }, [videoId]);
  return (
    <>
      <div className="flex w-8/12 min-h-screen p-4  flex-col relative">
        <div className="flex h-full mb-1 flex-col w-full bg-black bg-opacity-60 rounded-2xl overflow-scroll ">
          <h1 className="text-white text-2xl font-semibold text-center">
            Comments
          </h1>
          {comments?.length > 0 ? (
            comments.map((comment, index) => (
              <div
                onMouseEnter={() => setOnHover(index)}
                onMouseLeave={() => setOnHover(-1)}
                key={comment._id}
                className="flex flex-row w-full p-2 justify-between"
              >
                <div className="flex flex-row items-center">
                  <img
                    src={`http://localhost:3000/profilePicture/${comment.userId._id} `} // Change this line
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex flex-col ml-2">
                    <span className="text-white font-semibold">
                      {comment.userId.name}
                    </span>
                    <span className="text-white">{comment.text}</span>
                  </div>
                </div>
                <span className="text-white flex items-center ">
                  {onHover === index && (
                    <button className="text-white mr-2 bg-indigo-700 rounded-md p-1">
                      <RiDeleteBin6Line
                        onClick={() => handleDeleteComment(comment._id)}
                      />
                    </button>
                  )}
                  {new Date(comment.createdAt).toDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center h-full flex justify-center items-center">
              <span>No Comments yet</span>
            </div>
          )}
        </div>
        <div className=" bottom-2 flex flex-row items-center justify-center w-11/12  p-1 pb-5">
          <input
            onChange={(e) => setComment(e.target.value)}
            type="text"
            value={comment}
            className="w-9/12 rounded-xl text-xl text-black px-2 py-1"
          />
          <button
            onClick={handleComment}
            className=" text-xl bg-indigo-700 rounded-xl px-3 py-1 ml-2"
          >
            ADD
          </button>
        </div>
      </div>
    </>
  );
};

export default Comments;
