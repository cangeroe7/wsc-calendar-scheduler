import { useState } from "react";
import { Button } from "./ui/button";

type Props = {
  text: string;
  limit?: number; // optional char limit
};

export default function TruncatedText({ text, limit = 150 }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= limit) {
    return <div className="my-2 mx-8">{text}</div>;
  }

  const displayText = expanded ? text : text.slice(0, limit).trimEnd();

  return (
    <div className="my-2 mx-2">
      {displayText}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-blue-500 hover:underline ml-1"
      >
        {expanded ? "show less" : "...more"}
      </button>
    </div>
  );
}
