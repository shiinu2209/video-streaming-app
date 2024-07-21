import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadVideoComponent from "./pages/UploadVideoComponent";
import StreamVideoComponent from "./pages/StreamVideoComponent";
import Signup from "./pages/SignUp";
import SignIn from "./pages/SignIn";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Home></Home>} />
          <Route path="/upload" exact element={<UploadVideoComponent />} />
          <Route
            path="/stream/:videoId"
            exact
            element={<StreamVideoComponent />}
          />
          <Route path="/signin" element={<SignIn />}></Route>
          <Route path="/Signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
