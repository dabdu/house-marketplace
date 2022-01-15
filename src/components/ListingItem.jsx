import { Link } from "react-router-dom";
import { ReactComponent as DeleteIcon } from "../assets/svg/deleteIcon.svg";
import { ReactComponent as EditIcon } from "../assets/svg/editIcon.svg";
import bedIcon from "../assets/svg/bedIcon.svg";
import bathtubIcon from "../assets/svg/bathtubIcon.svg";

function ListingItem({ property, id, onDelete, onEdit }) {
  return (
    <li className="categoryListing">
      <Link
        to={`/houses/${property.purpose}/${id}`}
        className="categoryListingLink"
      >
        <img
          src={property.imageUrl[0]}
          alt={property.name}
          className="categoryListingImg"
        />
        <div className="categoryListingDetails">
          <p className="categoryListingLocation">{property.address}</p>
          <p className="categoryListingName">{property.name}</p>

          <p className="categoryListingPrice">
            N
            {property.offer
              ? property.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : property.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  <br/>
            {property.offer && (
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
            )}
            {property.purpose === "rent" && " / Month"}
          </p>
          <div className="categoryListingInfoDiv">
            <img src={bedIcon} alt="bed" />
            <p className="categoryListingInfoText">
              {property.bedrooms > 1
                ? `${property.bedrooms} Bedrooms`
                : "1 Bedroom"}
            </p>
            <img src={bathtubIcon} alt="bath" />
            <p className="categoryListingInfoText">
              {property.bathrooms > 1
                ? `${property.bathrooms} Bathrooms`
                : "1 Bathroom"}
            </p>
          </div>
        </div>
      </Link>

      {onDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgb(231, 76,60)"
          onClick={() => onDelete(property.id, property.name)}
        />
      )}
      {onEdit && <EditIcon className="editIcon" onClick={() => onEdit(id)} />}
    </li>
  );
}

export default ListingItem;
