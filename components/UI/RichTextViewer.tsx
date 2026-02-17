import { sanitizeHtml, isHtmlContent } from "@/utils/html-content";

type RichTextViewerProps = {
  content: string;
  className?: string;
};

const RichTextViewer = ({ content, className }: RichTextViewerProps) => {
  if (!content?.trim()) return null;

  if (!isHtmlContent(content)) {
    return (
      <div className={`whitespace-pre-line ${className ?? ""}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`prose-dark ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
};

export default RichTextViewer;
