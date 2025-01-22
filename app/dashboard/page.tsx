import dynamic from "next/dynamic";
import { HydrationOverlay } from "@builder.io/react-hydration-overlay";

export const runtime = 'nodejs';

const ChatComponent = dynamic(() => import("@/components/Chat"), {
  loading: () => <div>Loading...</div>
});

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 min-h-0">
        <HydrationOverlay>
          <ChatComponent />
        </HydrationOverlay>
      </div>
    </div>
  );
}
