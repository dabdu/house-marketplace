import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import Spinner from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import { toast } from "react-toastify";
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);
function Property() {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();
  useEffect(() => {
    const fetchProperty = async () => {
      const docRef = doc(db, "listings", params.propertyId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(docSnap.data());
        setProperty(docSnap.data());
        setLoading(false);
      } else {
        toast.error("Error, Could not fetch Data");
      }
    };

    fetchProperty();
  }, [navigate, params.propertyId]);
  if (loading) return <Spinner />;
  return (
    <main>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {property.imageUrl.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${property.imageUrl[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt="" />
      </div>
      {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}
      <p className="listingName">
        {property.name} - N
        {property.offer
          ? property.discountedPrice
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          : property.regularPrice
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        {/* {property.offer && (
          <span
            style={{
              textDecoration: "line-through",
              margin: "0px 4px",
              color: "#B1FA79",
            }}
          >
            {`N${property.discountedPrice
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`} 
          </span>
        )}*/}
      </p>
      <p className="listingLocation">{property.address}</p>
      <p className="listingType">
        For {property.purpose === "rent" ? "Rent" : "Sale"}
      </p>
      {property.offer && (
        <p className="discountPrice">
          N{property.regularPrice - property.discountedPrice} discount
        </p>
      )}
      <ul className="listingDetailsList">
        <li>
          {property.bedrooms > 1
            ? `${property.bedrooms} Bedrooms`
            : "1 Bedroom"}
        </li>
        <li>
          {property.bathrooms > 1
            ? `${property.bathrooms} Bathrooms`
            : "1 Bathroom"}
        </li>
        <li>{property.parking && "Parking Spot"}</li>
        <li>{property.furnished && "Furnished"}</li>
      </ul>
      <p className="listingLocationTitle">Location</p>
      <div className="leafletContainer">
        <MapContainer
          style={{ height: "100%", width: "100%" }}
          center={[property.lat, property.lng]}
          zoom={13}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
          />
          <Marker position={[property.lat, property.lng]}>
            <Popup>{property.address}</Popup>
          </Marker>
        </MapContainer>
      </div>
      {auth.currentUser?.uid !== property.userRef && (
        <Link
          to={`/contact/${property.userRef}?propertyName=${property.name}`}
          className="primaryButton"
        >
          Contact Landlord
        </Link>
      )}
      <br />
      <br />
      <br />
      <br />
    </main>
  );
}

export default Property;
