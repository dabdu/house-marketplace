import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Explore from "./pages/Explore";
import Featured from "./pages/Featured";
import ForgotPassword from "./pages/ForgotPassword";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import "react-toastify/dist/ReactToastify.css";
import Houses from "./pages/Houses";
import AddProperty from "./pages/AddProperpty";
import Property from "./pages/Property";
import Contact from "./pages/Contact";
import EditProperty from "./pages/EditProperty";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" exact element={<Explore />} />
          <Route path="/houses/:purpose" element={<Houses />} />
          <Route path="/featured" element={<Featured />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/sign-in" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/houses/:purpose/:propertyId" element={<Property />} />
          <Route path="/contact/:landlordId" element={<Contact />} />
          <Route path="/edit-property/:propertyId" element={<EditProperty />} />
        </Routes>
        <Navbar />
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
