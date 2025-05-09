import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Frontend of Drawing site</h1>
      <div>
        <Link href={"/signin"}>Signin</Link>
      </div>
      <div>
        <Link href={"/signup"}>Signup</Link>
      </div>
    </div>
  );
}
