import { cookies } from "next/headers";
import CanvasRoom from "../../../../components/CanvasRoom";


// Use async since cookies() returns a Promise in your Next.js version
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Await the cookies() result
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    return (
        <CanvasRoom id={Number(id)} token={token} />
    );
}