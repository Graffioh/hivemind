export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center w-full my-4">
      <div className="w-8 h-8 border-4 border-t-stone-500 border-b-stone-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
    </div>
  );
}
