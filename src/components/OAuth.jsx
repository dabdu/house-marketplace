import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import googleIcon from "../assets/svg/googleIcon.svg";
function OAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const onGoogleClick = async (e) => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      //   Check for user
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      // If User doesnt exist, create User
      if (!docSnap.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          userType: "Landlord",
          timestamp: serverTimestamp(),
        });
      }
      navigate("/");
    } catch (error) {
      toast.error("Something we wrong, Try Again");
    }
  };
  return (
    <>
      <div className="socialLogin">
        <p>Sign {location.pathname === "/sign-up" ? "up" : "in"} with </p>
        <button className="socialIconDiv" onClick={onGoogleClick}>
          <img className="socialIconImg" src={googleIcon} alt="google" />
        </button>
      </div>
    </>
  );
}

export default OAuth;
