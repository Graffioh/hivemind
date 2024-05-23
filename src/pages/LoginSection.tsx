// import { useNavigate } from "react-router-dom";

export default function LoginSection() {
  //   const navigate = useNavigate();

  const handleLogin = () => {
    //   navigate("/home");
  };

  return (
    <>
      <div className="flex flex-col m-4 items-center justify-center">
        <input placeholder="username" className="m-2 px-2 py-1 rounded"></input>
        <input type="password" placeholder="password" className="m-2 px-2 py-1 rounded"></input>
        <button onClick={handleLogin} className="mb-2 w-32 h-8">
          Login/Register
        </button>
        <div className="text-sm text-stone-400">or register by simply entering a new username and password</div>
      </div>
    </>
  );
}
