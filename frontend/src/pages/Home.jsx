import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Video from "../components/Video";
import Loader from "../components/Loader";
import axiosInstance from "../helpers/axiosInstance";

const Home = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [profile, setProfile] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [nav, setNav] = useState("all");
  const [loading, setLoading] = useState(true);

  const handleAllVideos = async () => {
    setLoading(true);
    const response = await axiosInstance.get("/videos");
    setVideos(response.data);
    setNav("all");
    setLoading(false);
  };

  const handleMyVideos = async () => {
    setLoading(true);
    const response = await axiosInstance.get("/myVideos");
    setVideos(response.data);
    setNav("my");
    setLoading(false);
  };

  const handleVideoPlayer = (videoId) => {
    navigate(`/stream/${videoId}`);
  };

  const handleUpload = () => {
    navigate("/upload");
  };

  const handleSignOut = async () => {
    try {
      await axiosInstance.post("/logout");
      localStorage.removeItem("token");
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  const fetchVideos = async () => {
    const response = await axiosInstance.get("/videos");
    setVideos(response.data);
  };
  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/profile");
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      navigate("/signin");
    }
  };
  const fetchProfilePicture = async () => {
    try {
      const response = await axiosInstance.get("/myProfilePicture", {
        responseType: "blob",
      });
      setProfilePicture(URL.createObjectURL(response.data));
    } catch (error) {
      console.error("Error fetching profile picture:", error);
    }
  };
  const fetchMyVideos = async () => {
    const response = await axiosInstance.get("/myVideos");
    setMyVideos(response.data);
  };
  const handldeDelete = async (videoId) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/deleteVideo/${videoId}`);
      fetchMyVideos();
      setLoading(false);
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };
const fetchtoken = async () => {
    const token = localStorage.getItem("token");
    console.log(token);
  };

  useEffect(() => {
    fetchtoken()
      .then(() => fetchProfile())
      .then(fetchProfilePicture)
      .then(() => fetchVideos())
      .then(() => fetchMyVideos())
      .then(() => setLoading(false));
  }, []);

  return (
    <>
      <nav className="bg-black bg-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8"
                  src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                  alt="Workflow"
                />
              </div>
              <div>
                <div className="ml-10 flex items-baseline space-x-4">
                  <button
                    onClick={() => handleAllVideos()}
                    className={`${
                      nav === "all"
                        ? "bg-indigo-700"
                        : "text-gray-300 hover:bg-gray-700"
                    }   hover:text-white px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    All Videos
                  </button>
                  <button
                    onClick={() => handleMyVideos()}
                    className={`${
                      nav === "my"
                        ? "bg-indigo-700"
                        : "text-gray-300 hover:bg-gray-700"
                    }   hover:text-white px-3 py-2 rounded-md text-sm font-medium`}
                  >
                    My Videos
                  </button>
                </div>
              </div>
            </div>
            {profile.name && (
              <span className="text-white flex justify-center items-center mr-[80px]">
                WELCOME{" "}
                <span className="ml-1 font-bold text-indigo-500">
                  {profile.name.toUpperCase()}
                </span>
              </span>
            )}
            <div className="flex flex-row">
              <button
                onClick={handleSignOut}
                className="px-1 py-1 mx-1 bg-indigo-700 rounded flex flex-row items-center"
              >
                {profilePicture && (
                  <img
                    className="w-[35px] h-[35px] rounded-full object-cover mx-1"
                    src={profilePicture}
                    alt=""
                  />
                )}
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {loading && <Loader />}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
            {nav === "all" ? (
              videos.length !== 0 ? (
                videos.map((video) => (
                  <Video
                    user={video.user}
                    key={video._id}
                    title={video.title}
                    id={video._id}
                    handleVideoPlayer={handleVideoPlayer}
                  />
                ))
              ) : (
                <div>No Videos to show</div>
              )
            ) : myVideos.length !== 0 ? (
              myVideos.map((video) => (
                <Video
                  user={video.user}
                  handleDelete={handldeDelete}
                  nav={nav}
                  key={video._id}
                  title={video.title}
                  id={video._id}
                  handleVideoPlayer={handleVideoPlayer}
                />
              ))
            ) : (
              <div>No videos to show</div>
            )}
          </div>
          <button
            className="fixed right-10 bottom-10 rounded bg-indigo-700 p-3"
            onClick={handleUpload}
          >
            Upload
          </button>
        </div>
      )}
    </>
  );
};

export default Home;
