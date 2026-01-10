// Blog page - Currently hidden, uncomment in header navigation when ready
import { getTranslations, getLocale } from "next-intl/server";
import { getBlogPosts } from "@/lib/blog";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export function generateStaticParams() {
  return [{ locale: "no" }, { locale: "en" }];
}

export default async function BlogPage() {
  const t = await getTranslations("blog");
  const locale = await getLocale();
  const posts = getBlogPosts(locale);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-4xl font-bold">{t("title")}</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">{t("noPosts")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/${locale}/blog/${post.slug}`}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    <span className="block text-sm text-muted-foreground">
                      {new Date(post.date).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {post.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
