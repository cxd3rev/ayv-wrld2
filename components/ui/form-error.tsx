export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-2 text-sm text-danger">{message}</p>;
}
