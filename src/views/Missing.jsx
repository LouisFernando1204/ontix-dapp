import ErrorMessage from "../components/ui/error-message";

const Missing = () => {

    return (
        <ErrorMessage errorCode={404} errorName={"Page not found"} errorMessage={"Sorry, we couldn’t find the page you’re looking for."} />
    );
};

export default Missing;