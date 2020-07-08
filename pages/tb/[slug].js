import { FaTwitter, FaLink } from 'react-icons/fa';
import { Email, Box, Item, Image, renderEmail } from 'react-html-email'

import Layout from 'components/Layout';
import { colors } from 'utils';

export default function Newsletter({ newsletter }) {
  const { content } = newsletter;

  const css = `
      html, body {
        font-family: Open Sans,-apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
          Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
          sans-serif;
      }

      .subtitle {
        margin-block-start: 0;
        margin-block-end: 0;
      }

      hr {
        height: 2px;
        border-width: 0;
        background-color: #eaeaea;
      }

      footer {
        display: grid;
        grid-template-columns: 1fr auto auto 1fr;
        margin: 2em;
      }

      button {
        border-radius: 50%;
        border: none;
        padding: 10px;
        margin: 1em;
        color: white;
        cursor: pointer;
      }
    `.trim()

  const email = (
    <Email headCSS={css}>
      <Box>
        <Item>
            <Image src="/thought_bytes.svg" width="100%" />
        </Item>

        <Item>
          <section dangerouslySetInnerHTML={{ __html: content }} />
        </Item>

        <hr />

        <Item>
          <footer>
            <span />

            <a href="https://kevinarifin.com">
              <button>
                <FaLink />
              </button>
            </a>

            <a href="https://twitter.com/kevarifin">
              <button style={{ backgroundColor: colors.twitterBlue }}>
                <FaTwitter />
              </button>
            </a>

            <span />

          </footer>
        </Item>

      </Box>
    </Email>
  );

  console.log(renderEmail(email));

  return (
    <>
      <Layout title={`Thought Bytes #${newsletter.slug}`} showLogo>
        {email}
      </Layout>

      <style>{css}</style>
    </>
  )
}

export async function getStaticProps(context) {
  const fs = require("fs");
  const html = require("remark-html");
  const highlight = require("remark-highlight.js");
  const unified = require("unified");
  const markdown = require("remark-parse");
  const matter = require("gray-matter");

  const slug = context.params.slug; // get slug from params
  const path = `${process.cwd()}/content/newsletters/${slug}.md`;

  const rawContent = fs.readFileSync(path, { encoding: "utf-8" });

  const { data, content } = matter(rawContent); // pass rawContent to gray-matter to get data and content

  const result = await unified()
    .use(markdown)
    .use(highlight) // highlight code block
    .use(html)
    .process(content); // pass content to process

  return {
    props: {
      newsletter: {
        ...data,
        content: result.toString(),
      }
    },
  };
}

// generate HTML paths at build time
export async function getStaticPaths(context) {
  const fs = require("fs");

  console.log(process.cwd());
  const path = `${process.cwd()}/content/newsletters`;
  const files = fs.readdirSync(path, "utf-8");

  const markdownFileNames = files
    .filter((fn) => fn.endsWith(".md"))
    .map((fn) => fn.replace(".md", ""));

  return {
    paths: markdownFileNames.map((fileName) => {
      return {
        params: {
          slug: fileName,
        },
      };
    }),
    fallback: false,
  };
}