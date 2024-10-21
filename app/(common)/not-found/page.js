import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h2 className="text-3xl font-bold">Not Found</h2>
      <Link href="/">Return Home</Link>
    </div>
  );
}
