import AuthPage from "../../../components/AuthPage";


const Signin = () => {
    return (
        <div className=" flex items-center justify-center min-h-screen">
            <AuthPage isSignin={true} />
        </div>
    );
}

export default Signin;