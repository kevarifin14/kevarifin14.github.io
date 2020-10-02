import ReactMarkdown from 'react-markdown';

import Layout from 'components/Layout';
import Subscribe from 'components/Subscribe';
import useSal from 'hooks/useSal';
import { CodeBlock, LinkRenderer } from 'utils';
import { getContent } from 'utils/content-manager';
import { slideUp, fadeIn } from 'utils/sal-props';

export default function About({ content }) {
  useSal();

  return (
    <Layout title="About" showLogo>
      <div className="sm">
        <div className="flex justify-center" {...slideUp}>
          <img src="/kevin.jpg" className="rounded-full h-48 w-48" />
        </div>

        <div className="markdown-body" {...fadeIn}>
          <ReactMarkdown
            escapeHtml={false}
            source={content}
            renderers={{ code: CodeBlock, link: LinkRenderer }}
          />
        </div>

        <div
          className="flex flex-col justify-center max-w-lg text-center mx-auto mb-8"
          {...fadeIn}
        >
          <h3>
            Get my newsletter on becoming a technical co-founder
            <span role="img" aria-label="point-down">👇</span>
          </h3>
          <Subscribe className="max-w-sm mx-auto" />
        </div>

      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const { content } = getContent('', 'about.md');
  return { props: { content } };
}
