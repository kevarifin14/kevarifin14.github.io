export default function NavButton({ onClick, children }) {
  return (
    <button
      type="button"
      className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
