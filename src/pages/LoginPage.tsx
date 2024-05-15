import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/home");
  };

  return (
    <>
      <div>Login Page</div>
      <button onClick={handleLogin}>Home</button>
    </>
  );
}
