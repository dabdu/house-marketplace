import { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import homeIcon from "../assets/svg/homeIcon.svg";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import ListingItem from "../components/ListingItem";
import Spinner from "../components/Spinner";

function Profile() {
  const auth = getAuth();
  const [properties, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
    phoneNumber: auth.currentUser.phoneNumber,
  });
  const { name, email } = formData;
  const navigate = useNavigate();
  useEffect(() => {
    const fectchUserProperties = async () => {
      const propertiesRef = collection(db, "listings");
      const q = query(
        propertiesRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      let properties = [];
      querySnap.forEach((doc) => {
        return properties.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setProperties(properties);
      setLoading(false);
    };
    fectchUserProperties();
  }, [auth.currentUser.uid]);
  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };
  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  const onSubmit = async (e) => {
    try {
      if (auth.currentUser.displayName !== name) {
        // UpDATE NAME IN FIRESTORE (in Browser)
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // Update in Firebase
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      toast.error("COuld not update profile, some thing went wrong");
    }
  };
  const onDelete = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", propertyId));
      const updatedProperties = properties.filter(
        (property) => property.id !== propertyId
      );
      setProperties(updatedProperties);
      toast.success("Property Successfully Deleted");
    }
  };
  const onEdit = (propertyId) => {
    navigate(`/edit-property/${propertyId}`);
  };
  if (loading) {
    return <Spinner />;
  }

  // if (properties.length === 0) {
  //   return <></>;
  // }
  return (
    <>
      <div className="profile">
        <header className="profileHeader">
          <p className="pageHeader">My Profile</p>
          <button type="button" className="logOut" onClick={onLogout}>
            Logout
          </button>
        </header>

        <main>
          <div className="profileDetailsHeader">
            <p className="profileDetailsText">Personal Details</p>
            <p
              className="changePersonalDetails"
              onClick={() => {
                changeDetails && onSubmit();
                setChangeDetails((prevState) => !prevState);
              }}
            >
              {changeDetails ? "done" : "change"}
            </p>
          </div>

          <div className="profileCard">
            <form>
              <input
                type="text"
                id="name"
                className={!changeDetails ? "profileName" : "profileNameActive"}
                disabled={!changeDetails}
                value={name}
                onChange={onChange}
              />
              <input
                type="text"
                id="email"
                className={
                  !changeDetails ? "profileEmail" : "profileEmailActive"
                }
                disabled={true}
                value={email}
                onChange={onChange}
              />
              {/* <input
                type="text"
                id="phoneNumber"
                className={
                  !changeDetails
                    ? "profilePhoneNumber"
                    : "profilePhoneNumberActive"
                }
                disabled={!changeDetails}
                value={phoneNumber}
                onChange={onChange}
              /> */}
            </form>
          </div>
          <Link to="/add-property" className="createListing">
            <img src={homeIcon} alt="home" />
            <p>Sell or rent your home</p>
            <img src={arrowRight} alt="arrow right" />
          </Link>
          {!loading && properties?.length > 0 && (
            <>
              <p className="listingsText">Your Properties</p>
              <ul className="listingsList">
                {properties.map((property) => (
                  <ListingItem
                    key={property.id}
                    property={property.data}
                    id={property.id}
                    onDelete={() => onDelete(property.id)}
                    onEdit={() => onEdit(property.id)}
                  />
                ))}
              </ul>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default Profile;
