import PageClient from "./PageClient";
export default function page() {
  return (
    // <Suspense fallback={<div className="suspense-fallback">..loading.</div>}>
      <PageClient />
    // </Suspense>
  );
}