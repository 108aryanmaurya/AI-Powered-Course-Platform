import MarkDown from "react-markdown";

export default function MarkDownRenderer({ md }: { md: string }) {
  return (
    <div className="prose max-w-none">
      <MarkDown>{md}</MarkDown>
    </div>
  );
}
