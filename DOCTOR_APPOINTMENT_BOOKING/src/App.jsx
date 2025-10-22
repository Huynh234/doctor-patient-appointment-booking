import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AllRoutes from "./Routes/AllRoutes";
import AuthProvider from "./Context/AuthContext";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AllRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
} 

export default App;
