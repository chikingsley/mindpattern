import dynamic from "next/dynamic";

export const runtime = 'edge';

const ChatComponent = dynamic(() => import("@/components/Chat"), {
  loading: () => <div>Loading...</div>
});

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 min-h-0">
        <ChatComponent />
      </div>
    </div>
  );
}
