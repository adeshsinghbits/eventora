import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Spinner from "./ui/Spinner";

const PrivateRoute = ({ children }) => {
  const { user, isAuthChecked } = useSelector((state) => state.auth);

  if (!isAuthChecked) return <Spinner />;

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;