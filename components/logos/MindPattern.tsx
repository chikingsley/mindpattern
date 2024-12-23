import { Brain } from "lucide-react"; // Using Brain icon as an example, you can change this to any other Lucide icon

export default function MindPatternLogo() {
  return (
    <div className="flex items-center gap-2">
      <Brain className="w-6 h-6" />
      <span className="font-semibold text-xl">MindPattern</span>
    </div>
  );
}
