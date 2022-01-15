import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../firebase.config";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
function EditProperty() {
  const [loading, setLoading] = useState(false);
  const [geolocationEnabled] = useState(false);
  const [formData, setFormData] = useState({
    type: "apartment",
    purpose: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    lat: 0,
    lng: 0,
    description: "",
    city: "",
    area: "",
    state: "",
    slug: "",
    status: "pending",
  });
  const [property, setProperty] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);

  //   Redirect if Property Listing is not User's
  useEffect(() => {
    if (property && property.userRef !== auth.currentUser.uid) {
      toast.error("You can not edit that Property");
      navigate("/");
    }
  }, [auth.currentUser.uid, navigate, property]);
  // Fetch Property Details
  useEffect(() => {
    setLoading(true);
    const fetchProperty = async () => {
      const docRef = doc(db, "listings", params.propertyId);
      const docSnap = await getDoc(docRef);
      console.log(docSnap.data());
      if (docSnap.exists()) {
        setProperty(docSnap.data());
        setFormData({ ...docSnap.data() });
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Property does not exist");
      }
    };
    fetchProperty();
  }, [params.propertyId, navigate]);
  // Check if User is Logged In
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("sign-in");
        }
      });
    }
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line
  }, [isMounted]);
  if (loading) {
    return <Spinner />;
  }
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    lat,
    lng,
    description,
    city,
    area,
    state,
    purpose,
  } = formData;

  const onMutate = (e) => {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // Text/Boolean and Numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discounted Price Needs to be less than regular Price");
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("Upload Maximum of IMAGES to be uploaded");
      return;
    }
    // Generating Slug From Name
    const newSlug = name
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // store House Image in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, "images/" + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };
    const imageUrl = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });
    const formDataCopy = {
      ...formData,
      slug: newSlug,
      imageUrl,
      timestamp: serverTimestamp(),
    };
    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // Update Property
    const docRef = doc(db, "listings", params.propertyId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);

    console.log(formDataCopy);

    toast.success("Property Updated Succesfully");
    navigate(`/houses/${formDataCopy.purpose}/${docRef.id}`);
  };

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit Property</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sale / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              className={purpose === "sale" ? "formButtonActive" : "formButton"}
              id="purpose"
              value="sale"
              onClick={onMutate}
            >
              Sale
            </button>
            <button
              type="button"
              className={purpose === "rent" ? "formButtonActive" : "formButton"}
              id="purpose"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Property Type</label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "house" ? "formButtonActive" : "formButton"}
              id="type"
              value="house"
              onClick={onMutate}
            >
              House
            </button>
            <button
              type="button"
              className={
                type === "apartment" ? "formButtonActive" : "formButton"
              }
              id="type"
              value="apartment"
              onClick={onMutate}
            >
              Apartment
            </button>
          </div>

          <label className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              className={parking ? "formButtonActive" : "formButton"}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !parking && parking !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              className={furnished ? "formButtonActive" : "formButton"}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Area</label>
          <input
            className="formInputName"
            type="number"
            id="area"
            value={area}
            onChange={onMutate}
            required
          />
          <label className="formLabel">Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />

          <div className="formLatLng flex">
            <div>
              <label className="formLabel">State</label>
              <input
                className="formInputSmall"
                type="text"
                id="state"
                value={state}
                onChange={onMutate}
                required
              />
            </div>
            <div>
              <label className="formLabel">City</label>
              <input
                className="formInputSmall"
                type="text"
                id="city"
                value={city}
                onChange={onMutate}
                required
              />
            </div>
          </div>

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="lat"
                  value={lat}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="lng"
                  value={lng}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              className={offer ? "formButtonActive" : "formButton"}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === "rent" && <p className="formPriceText">$ / Month</p>}
          </div>

          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required={offer}
              />
            </>
          )}

          <label className="formLabel">Description</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="description"
            value={description}
            onChange={onMutate}
            required
          />

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max of 6 Images).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />

          {/* <label className="formLabel">Upload House Documents</label>
          <p className="imagesInfo">
            Please Upload the necessary House Document, Like CofO and the rest
            (JPg, png, jpeg Only)
          </p>
          <input
            className="formInputFile"
            type="file"
            id="houseDoc"
            onChange={onMutate}
            accept=".jpg,.png,.jpeg"
            multiple
            required
          /> */}
          <button type="submit" className="primaryButton createListingButton">
            Edit Property
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditProperty;
