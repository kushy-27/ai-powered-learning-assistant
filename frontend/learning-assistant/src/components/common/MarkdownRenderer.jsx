import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none prose-slate">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mb-3 mt-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mb-3 mt-4" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold mb-2 mt-3" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-semibold mb-2 mt-3" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-3 leading-relaxed" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-emerald-600 underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          strong: ({ node, ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({ node, ...props }) => <em className="italic" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-emerald-500 pl-4 italic text-slate-600 my-3"
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");

            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  borderRadius: "0.75rem",
                  fontSize: "0.85rem",
                  margin: "0.75rem 0",
                }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="rounded bg-slate-200 px-1.5 py-0.5 text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre className="overflow-x-auto" {...props} />
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;