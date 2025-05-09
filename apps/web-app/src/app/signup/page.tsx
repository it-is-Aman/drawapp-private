import AuthPage from "../../../components/AuthPage";

const Signup = () => {
    return (
        <div className=" flex items-center justify-center min-h-screen">
            <AuthPage isSignin={false} />
        </div>
    );
}

export default Signup;