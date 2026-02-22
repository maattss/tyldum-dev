import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { cache } from "react";
import { parseBlogFrontmatter } from "@/lib/content-schemas";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  locale: string;
  content: string;
}

const contentDirectory = path.join(process.cwd(), "content/blog");

function readBlogPosts(locale: string): BlogPost[] {
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
      const { data, content } = matter(fileContent);
      const frontmatter = parseBlogFrontmatter(data, fullPath);

      return {
        slug: file.replace(".mdx", ""),
        title: frontmatter.title,
        description: frontmatter.description,
        date: frontmatter.date,
        dateValue: frontmatter.dateValue,
        locale,
        content,
      };
    })
    .sort((a, b) => b.dateValue - a.dateValue)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.date,
      locale: post.locale,
      content: post.content,
    }));

  return posts;
}

export const getBlogPosts = cache((locale: string): BlogPost[] => readBlogPosts(locale));

export const getBlogPost = cache((slug: string, locale: string): BlogPost | null => {
  const posts = getBlogPosts(locale);
  return posts.find((post) => post.slug === slug) ?? null;
});
