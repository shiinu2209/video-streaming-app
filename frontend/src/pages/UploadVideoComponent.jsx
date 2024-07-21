import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UploadVideoComponent = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const handleSubmit = async (e) => {
    try {
      setUploading(true);
      e.preventDefault();
      const formData = new FormData();
      formData.append("video", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("thumbnail", thumbnail);
      const responce = await axios.post(
        "http://localhost:3000/upload",
        formData,
        {
          withCredentials: true,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploading(false);
      navigate("/");
    } catch (error) {
      setUploading(false);
      console.error("Error uploading video:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <h1 className="text-2xl font-bold mb-4 text-white">Upload Video</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-slate-700 rounded-md p-4"
      >
        <label htmlFor="title" className="mb-2 text-white">
          Title
        </label>
        <input
          onChange={(e) => setTitle(e.target.value)}
          id="title"
          type="text"
          placeholder="Title"
          className="border border-gray-300 rounded-md p-2 mb-2 bg-gray-700 text-white"
        />
        <label htmlFor="description" className="mb-2 text-white">
          Description
        </label>
        <input
          onChange={(e) => setDescription(e.target.value)}
          type="text"
          id="description"
          placeholder="Description"
          className="border border-gray-300 rounded-md p-2 mb-2 bg-gray-700 text-white"
        />
        <label htmlFor="thumbnail" className="mb-2 text-white">
          Thumbnail
        </label>
        <input
          onChange={(e) => setThumbnail(e.target.files[0])}
          type="file"
          id="thumbnail"
          className="mb-2"
        />
        <label htmlFor="video" className="mb-2 text-white">
          Video
        </label>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          id="video"
          type="file"
          className="mb-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadVideoComponent;
