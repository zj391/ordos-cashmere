import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import SocialShareButtons from "@/components/SocialShareButtons";
import { Streamdown } from "streamdown";

export default function BlogPost() {
  const { t, i18n } = useTranslation();
  const [match, params] = useRoute("/blog/:slug");

  if (!match) return null;

  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
 return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t("blog.articleNotFound")}</h1>
          <Link href="/blog">
            <a className="text-amber-700 hover:text-amber-900 font-semibold">
              ← {t("blog.backToBlog")}
            </a>
          </Link>
        </div>
      </div>
    );
  }

  const currentLang = i18n.language as keyof typeof post.title;
  const title = post.title[currentLang] || post.title.en;
  const description = post.description[currentLang] || post.description.en;
  const content = post.content[currentLang] || post.content.en;

  const postUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="bg-amber-50 border-b border-border">
        <div className="container py-4">
          <Link href="/blog">
            <a className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t("blog.backToBlog")}
            </a>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16">
        <div className="container max-w-3xl">
          {/* Category Badge */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-full">
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            {title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-muted-foreground border-b border-border pb-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(post.publishedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} {t("blog.minRead")}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt={title}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {description}
          </p>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="container max-w-3xl">
          <div className="prose prose-lg max-w-none">
            <Streamdown>{content}</Streamdown>
          </div>
        </div>
      </section>

      {/* Social Share Section */}
      <section className="py-12 bg-amber-50 border-t border-border">
        <div className="container max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-bold text-foreground">
              {t("blog.shareThisArticle")}
            </h3>
          </div>
          <SocialShareButtons
            url={postUrl}
            title={title}
            description={description}
          />
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-display font-bold text-foreground mb-12">
            {t("blog.moreArticles")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts
              .filter((p) => p.id !== post.id)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}/`}>
                  <a className="group block">
                    <div className="relative overflow-hidden rounded-lg mb-4 h-48">
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title.en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-amber-700 transition-colors">
                      {relatedPost.title.en}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {relatedPost.description.en}
                    </p>
                  </a>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-amber-900 to-amber-800">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {t("blog.ctaExperienceTitle")}
            </h2>
            <p className="text-amber-100 mb-8">
              {t("blog.ctaDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <a className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-amber-900 font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                  {t("blog.shopNow")}
                </a>
              </Link>
              <Link href="/contact">
                <a className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  {t("blog.getInTouch")}
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
