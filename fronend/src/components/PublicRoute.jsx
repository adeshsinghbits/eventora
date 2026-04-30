const PublicRoute = ({ children }) => {
  const { user, isAuthChecked } = useSelector((state) => state.auth);

  if (!isAuthChecked) return <Spinner />;

  return user ? <Navigate to="/user-dashboard" /> : children;
};