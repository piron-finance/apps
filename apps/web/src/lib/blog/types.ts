export type BlogCategory = {
  title: string;
  slug: string;
  description?: string;
};

export type BlogImageAsset = {
  url?: string;
  metadata?: {
    lqip?: string;
    dimensions?: {
      width?: number;
      height?: number;
      aspectRatio?: number;
    };
  };
};

export type BlogImage = {
  alt?: string;
  caption?: string;
  asset?: BlogImageAsset;
};

export type BlogAuthor = {
  name: string;
  role?: string;
  image?: BlogImage;
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category?: BlogCategory;
  author?: BlogAuthor;
  image?: BlogImage;
  body: any[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  socialTitle?: string;
  socialDescription?: string;
  socialImage?: BlogImage;
  linkedinCopy?: string;
  xCopy?: string;
};

export type BlogSettings = {
  title: string;
  description: string;
  heroPost?: BlogPost | null;
  featuredPosts: BlogPost[];
  ctaTitle: string;
  ctaDescription: string;
  ctaLabel: string;
  ctaHref: string;
};

export type BlogIndexData = {
  configured: boolean;
  settings: BlogSettings;
  categories: BlogCategory[];
  heroPost?: BlogPost | null;
  featuredPosts: BlogPost[];
  recentPosts: BlogPost[];
  totalRecentPosts: number;
  page: number;
  hasMore: boolean;
  searchQuery: string;
  activeCategory: string;
};

export type BlogPostPageData = {
  configured: boolean;
  post: BlogPost | null;
  settings: BlogSettings;
  relatedPosts: BlogPost[];
};
