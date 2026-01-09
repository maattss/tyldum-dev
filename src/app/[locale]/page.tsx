import { Hero } from "@/components/hero";

export function generateStaticParams() {
  return [{ locale: "no" }, { locale: "en" }];
}

export default async function Home() {
  return (
    <div className="container mx-auto px-4">
      <Hero />
    </div>
  );
}
