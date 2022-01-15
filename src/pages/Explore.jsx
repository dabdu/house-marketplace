import { useEffect, useState } from "react";
import {  Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import rentCategoryImage from "../assets/jpg/rentCategoryImage.jpg";
import sellCategoryImage from "../assets/jpg/sellCategoryImage.jpg";
import Slider from "../components/Slider";

function Explore() {
  const [properties, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchProperties, setLastFetchProperties] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Get Reference to the collection
        const propertiesRef = collection(db, "listings");
        // Create a query
        const q = query(
          propertiesRef,
          where("status", "==", "pending"),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        // Execute Query
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchProperties(lastVisible);

        const properties = [];

        querySnap.forEach((doc) => {
          return properties.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setProperties(properties);
        setLoading(false);
      } catch (error) {
        toast.error("Error occured, Could not fetch Properties");
      }
    };
    fetchProperties();
  }, []);

  // Load More / Pagination Function
  const onLoadMoreProperties = async () => {
    try {
      // Get Reference to the collection
      const propertiesRef = collection(db, "listings");
      // Create a query
      const q = query(
        propertiesRef,
        where("status", "==", "pending"),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchProperties),
        limit(10)
      );
      // Execute Query
      const querySnap = await getDocs(q);

      const properties = [];

      querySnap.forEach((doc) => {
        return properties.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setProperties((prevState) => [...prevState, ...properties]);
      setLoading(false);
    } catch (error) {
      toast.error("Error occured, Could not fetch More Properties");
    }
  };
  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
      </header>

      <main>
        <Slider />

        <p className="exploreCategoryHeading">Categories</p>
        <div className="exploreCategories">
          <Link to="/houses/rent">
            <img
              src={rentCategoryImage}
              alt="rent"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Houses for rent</p>
          </Link>
          <Link to="/houses/sale">
            <img
              src={sellCategoryImage}
              alt="sell"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Houses for sale</p>
          </Link>
        </div>
        <p className="exploreCategoryHeading">All Properties</p>
{!loading &&  (<ul className="categoryListings">
              {properties.map((property) => (
                <ListingItem
                  property={property.data}
                  id={property.id}
                  key={property.id}
                />
              ))}
            </ul>)}
            {lastFetchProperties && (
            <p className="loadMore" onClick={onLoadMoreProperties}>
              Load More
            </p>
          )}
      </main>
    </div>
  );
}

export default Explore;
