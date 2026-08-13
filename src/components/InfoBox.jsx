export default function InfoBox({ children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:p-6">
      {children}
    </div>
  );
}
