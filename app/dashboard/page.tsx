import dynamic from "next/dynamic";

export const runtime = 'edge';

const ChatComponent = dynamic(() => import("@/components/Chat"), {
  loading: () => <div>Loading...</div>
});

export default function Page() {
  return (
    <div className="grow flex flex-col">
      <ChatComponent />
    </div>
  );
}
