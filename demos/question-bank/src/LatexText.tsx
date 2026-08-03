import katex from 'katex';

type LatexTextProps = {
  value: string;
  className?: string;
};

export function LatexText({ value, className }: LatexTextProps) {
  const parts = value.split(/(\$[^$]+\$)/g).filter(Boolean);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part.startsWith('$') || !part.endsWith('$')) {
          return <span key={index}>{part}</span>;
        }

        const html = katex.renderToString(part.slice(1, -1), {
          throwOnError: false,
          output: 'html',
        });
        return (
          <span
            className="latex-token"
            key={index}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </span>
  );
}
