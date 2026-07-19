import rss from '@astrojs/rss';
import { SITE } from '../config';
import { allPosts, urlOf, excerptOf } from '../lib/posts';

export async function GET(context) {
  const posts = await allPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: excerptOf(p),
      link: urlOf(p),
    })),
  });
}
