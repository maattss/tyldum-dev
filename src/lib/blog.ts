import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface BlogFrontmatter {
  title?: string;
  description?: string;
  date?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  locale: string;
  content: string;
}

const contentDirectory = path.join(process.cwd(), "content/blog");

export function getBlogPosts(locale: string): BlogPost[] {
  const localeDirectory = path.join(contentDirectory, locale);

  if (!fs.existsSync(localeDirectory)) {
    return [];
  }

  const files = fs.readdirSync(localeDirectory);

  const posts = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const fullPath = path.join(localeDirectory, file);
      const fileContent = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContent) as { data: BlogFrontmatter; content: string };

      return {
        slug: file.replace(".mdx", ""),
        title: data.title ?? "",
        description: data.description ?? "",
        date: data.date ?? "",
        locale,
        content,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getBlogPost(slug: string, locale: string): BlogPost | null {
  const fullPath = path.join(contentDirectory, locale, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContent = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContent) as { data: BlogFrontmatter; content: string };

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    locale,
    content,
  };
}
