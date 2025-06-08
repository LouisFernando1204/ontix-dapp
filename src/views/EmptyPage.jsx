import notFound from "../assets/empty_icon.png";

const EmptyPage = ({ text }) => {
  return (
    <div className="w-full h-screen justify-center flex flex-col items-center gap-6">
      <img src={notFound} alt="Not Found" className="size-48 md:size-72" />
      <div className="mb-8">
        <p className="text-md md:text-xl text-center">
          {text}
        </p>
      </div>
    </div>
  );
};

export default EmptyPage;