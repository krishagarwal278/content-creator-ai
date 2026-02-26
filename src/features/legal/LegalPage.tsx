import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LegalDocType = "privacy-policy" | "terms-of-service";

const docTitles: Record<LegalDocType, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
};

export function LegalPage() {
  const { type } = useParams<{ type: LegalDocType }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocument() {
      if (!type || !docTitles[type as LegalDocType]) {
        setError("Invalid document type");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/legal/${type}.md`);
        if (!response.ok) {
          throw new Error("Document not found");
        }
        const text = await response.text();
        setContent(text);
      } catch {
        setError("Legal document not available. Please contact support.");
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [type]);

  const title = type ? docTitles[type as LegalDocType] || "Legal" : "Legal";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>
            )}

            {!loading && !error && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownContent content={content} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc space-y-1 pl-6">
          {listItems.map((item, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={index} className="mb-4 mt-6 text-2xl font-bold">
          {trimmed.slice(2)}
        </h1>,
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={index} className="mb-3 mt-6 text-xl font-semibold">
          {trimmed.slice(3)}
        </h2>,
      );
    } else if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={index} className="mb-2 mt-4 text-lg font-medium">
          {trimmed.slice(4)}
        </h3>,
      );
    } else if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
    } else if (trimmed.startsWith("*") && trimmed.endsWith("*") && !trimmed.startsWith("**")) {
      flushList();
      elements.push(
        <p key={index} className="mt-4 text-sm italic text-muted-foreground">
          {trimmed.slice(1, -1)}
        </p>,
      );
    } else if (trimmed.startsWith("**") && trimmed.includes("**")) {
      flushList();
      elements.push(
        <p key={index} className="font-semibold text-muted-foreground">
          {trimmed.replace(/\*\*/g, "")}
        </p>,
      );
    } else if (trimmed === "---") {
      flushList();
      elements.push(<hr key={index} className="my-6 border-border" />);
    } else if (trimmed) {
      flushList();
      elements.push(
        <p key={index} className="mb-3">
          {trimmed}
        </p>,
      );
    }
  });

  flushList();

  return <>{elements}</>;
}

export default LegalPage;
