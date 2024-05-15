// import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  //   const navigate = useNavigate();

  //   const handleLogin = () => {
  // navigate("/home");
  //   };

  return (
    <>
      <div className="flex flex-col m-4 items-center justify-center">
        <input placeholder="username" className="m-2 px-2 py-1 rounded"></input>
        <input placeholder="password" className="m-2 px-2 py-1 rounded"></input>
      </div>
      {/* <button onClick={handleLogin} className="mt-4">
        Home
      </button> */}
    </>
  );
}
