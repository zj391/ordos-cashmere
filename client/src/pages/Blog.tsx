import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import SocialShareButtons from "@/components/SocialShareButtons";
import BlogSubscription from "@/components/BlogSubscription";

export default function Blog() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Blog | DONGXIAO® CASHMERE - Industry Insights & News</title>
        <meta name="description" content="Stay updated with the latest cashmere industry news, B2B insights, sustainable practices, and company updates from DONGXIAO® CASHMERE." />
        <meta property="og:title" content="Blog | DONGXIAO® CASHMERE - Industry Insights & News" />
        <meta property="og:description" content="Stay updated with the latest cashmere industry news, B2B insights, sustainable practices, and company updates from DONGXIAO® CASHMERE." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | DONGXIAO® CASHMERE - Industry Insights & News" />
        <meta name="twitter:description" content="Stay updated with the latest cashmere industry news, B2B insights, sustainable practices, and company updates from DONGXIAO® CASHMERE." />
      </Helmet>
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-background py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              {t("blog.pageTitle")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("blog.pageDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <a className="block">
                    {/* Featured Image */}
                    <div className="relative overflow-hidden rounded-lg mb-6 h-64 md:h-72">
                      <img
                        src={post.image}
                        alt={post.title.en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Post Meta */}
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readingTime} {t("blog.minRead")}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-semibold rounded-full">
                        {post.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-display font-bold text-foreground mb-3 group-hover:text-amber-700 transition-colors">
                      {post.title.en}
                    </h2>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.description.en}
                    </p>

                    {/* Read More Link */}
                   <div className="flex items-center gap-2 text-amber-700 font-semibold group-hover:gap-3 transition-all">
                      {t("blog.readMore")}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </a>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <BlogSubscription />

      {/* Social Share Section */}
      <section className="py-12 bg-amber-50 border-t border-border">
        <div className="container">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              {t("blog.shareInsights")}
            </h3>
            <p className="text-muted-foreground">
              {t("blog.shareInsightsDesc")}
            </p>
          </div>
          <div className="flex justify-center">
            <SocialShareButtons
              url={typeof window !== "undefined" ? window.location.href : ""}
              title={t("blog.shareTitle")}
              description={t("blog.shareDescription")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-amber-900 to-amber-800">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              {t("blog.ctaTitle")}
            </h2>
            <p className="text-amber-100 mb-8">
              {t("blog.ctaDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <a className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-amber-900 font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                  {t("blog.shopNow")}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
              <Link href="/contact">
                <a className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                  {t("blog.getInTouch")}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
