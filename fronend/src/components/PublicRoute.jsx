import Spinner from "./ui/Spinner";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { user, isAuthChecked } = useSelector((state) => state.auth);

  if (!isAuthChecked) return <Spinner />;

  return user ? <Navigate to="/user-dashboard" /> : children;
};

export default PublicRoute;