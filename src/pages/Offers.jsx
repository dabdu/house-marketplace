import { useEffect, useState } from "react";
import ListingItem from "../components/ListingItem";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
function Offers() {
  const [properties, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Get Reference to the collection
        const propertiesRef = collection(db, "listings");
        // Create a query
        const q = query(
          propertiesRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
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
        setProperties(properties);
        setLoading(false);
      } catch (error) {
        toast.error("Error occured, Could not fetch Properties");
      }
    };
    fetchProperties();
  }, []);
  return (
    <div className="category">
      <header>
        <p className="pageHeader">OFFERS</p>
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
        </>
      ) : (
        <p>There's No Offer Available Currently</p>
      )}
    </div>
  );
}
export default Offers;
