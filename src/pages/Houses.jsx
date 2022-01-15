import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
import Spinner from "../components/Spinner";
function Houses() {
  const [properties, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchProperties, setLastFetchProperties] = useState(null);

  const params = useParams();
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Get Reference to the collection
        const propertiesRef = collection(db, "listings");
        // Create a query
        const q = query(
          propertiesRef,
          where("purpose", "==", params.purpose),
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
  }, [params.purpose]);

  // Load More / Pagination Function
  const onLoadMoreProperties = async () => {
    try {
      // Get Reference to the collection
      const propertiesRef = collection(db, "listings");
      // Create a query
      const q = query(
        propertiesRef,
        where("purpose", "==", params.purpose),
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
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.purpose === "rent" ? "Places for rent" : "Places for sale"}
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : properties && properties.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {properties.map((property) => (
                <ListingItem
                  property={property.data}
                  id={property.id}
                  key={property.id}
                />
              ))}
            </ul>
          </main>
          <br />
          <br />
          <br />
          <br />
          {lastFetchProperties && (
            <p className="loadMore" onClick={onLoadMoreProperties}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No Properties for {params.purpose}</p>
      )}
    </div>
  );
}
export default Houses;
