// Blog page - Currently hidden, uncomment in header navigation when ready
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBlogPosts } from "@/lib/blog";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";
import { locales } from "@/i18n/config";
import { formatIsoDate } from "@/lib/format";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    // `absolute` avoids the parent layout's "tyldum.dev | %s" template being
    // applied on top of a title that already contains the site name.
    title: { absolute: t("title") },
    // The blog is intentionally unlinked until there is content to publish.
    robots: { index: false, follow: false },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
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
                      {formatIsoDate(post.date, locale)}
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
