import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="display text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-sm text-muted">That page does not exist in AYV WRLD.</p>
      <Link href="/" className="mt-6 text-sm text-accent hover:underline">
        Back home
      </Link>
    </div>
  );
}
