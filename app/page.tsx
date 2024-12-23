import { getHumeAccessToken } from "@/utils/getHumeAccessToken";
import dynamic from "next/dynamic";

export const runtime = 'edge';

const ChatComponent = dynamic(() => import("@/components/Chat"), {
  loading: () => <div>Loading...</div>
});

export default async function Page() {
  const accessToken = await getHumeAccessToken();

  if (!accessToken) {
    throw new Error();
  }

  return (
    <div className={"grow flex flex-col"}>
      <ChatComponent accessToken={accessToken} />
    </div>
  );
}
