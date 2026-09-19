import { Placeholder } from "@/components/Placeholder";

export default function NotFound() {
  return (
    <Placeholder
      title="This page does not exist"
      body="The link may be old, or the page has moved. Start from the tools list and work forward from there."
      backHref="/tools"
      backLabel="Go to tools"
    />
  );
}
