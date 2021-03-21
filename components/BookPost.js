import ReactMarkdown from 'react-markdown';

import { CodeBlock, LinkRenderer } from 'utils';

export default function BookPost({ slug, content }) {
  return (
    <div className="max-w-screen-lg mx-auto py-8">

      <div className="grid grid-cols-auto-1fr gap-8">

        <div className="h-screen sticky hidden sm:block" style={{ top: '10px' }}>
          <img src={`/books/${slug}-cover.jpg`} className="w-64 shadow-xl" />
        </div>

        <div className="prose max-w-prose">
          <ReactMarkdown
            escapeHtml={false}
            source={content}
            renderers={{ code: CodeBlock, link: LinkRenderer }}
          />
        </div>
      </div>

    </div>
  );
}
