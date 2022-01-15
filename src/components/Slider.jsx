import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.config";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import Spinner from "./Spinner";
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

function Slider() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      const propertiesRef = collection(db, "listings");
      const q = query(propertiesRef, orderBy("timestamp", "desc"), limit(5));
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

    fetchProperties();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (properties.length === 0) {
    return <></>;
  }

  return (
    properties && (
      <>
        <p className="exploreHeading">Recommended</p>

        <Swiper slidesPerView={1} pagination={{ clickable: true }}>
          {properties.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/houses/${data.purpose}/${id}`)}
            >
              <div
                style={{
                  background: `url(${data.imageUrl[0]}) center no-repeat`,
                  backgroundSize: "cover",
                }}
                className="swiperSlideDiv"
              >
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  ${data.discountedPrice ?? data.regularPrice}{" "}
                  {data.type === "rent" && "/ month"}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}

export default Slider;
