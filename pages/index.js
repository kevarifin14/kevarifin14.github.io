import Link from 'next/link';

import Layout from 'components/Layout';
import Subscribe from 'components/Subscribe';
import { listContent } from 'utils/content-manager';

export default function Home({ latestNewsletterSlug }) {
  return (
    <>
      <Layout title="Home">
        <div className="pb-20 flex flex-grow flex-col items-center justify-center">

          <img src="/blue.svg" className="h-40 w-40" />

          <h1 className="text-5xl text-center">
            Thought Bytes by Kevin Arifin
          </h1>

          <p className="text-xl mb-8 text-center">
            I send out a weekly newsletter on becoming a technical co-founder
          </p>

          <Subscribe />

          <span className="mt-12">
            <Link href="/tb/[slug]" as={`/tb/${latestNewsletterSlug}`}>
              <a className="hover:underline text-black no-underline">
                View the latest newsletter &rarr;
              </a>
            </Link>
          </span>

        </div>

      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const filenames = listContent('newsletters');
  const latestNewsletterSlug = Math.max(...filenames.map((filename) => parseInt(filename, 10)));

  return { props: { latestNewsletterSlug } };
}
