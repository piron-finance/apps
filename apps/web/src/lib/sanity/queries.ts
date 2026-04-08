const postCardFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "publishedAt": coalesce(publishedAt, _createdAt),
  tags,
  "category": category->{
    title,
    "slug": slug.current,
    description
  },
  "author": author->{
    name,
    role,
    image{
      alt,
      asset->{
        url,
        metadata{
          lqip,
          dimensions
        }
      }
    }
  },
  "image": mainImage{
    alt,
    caption,
    asset->{
      url,
      metadata{
        lqip,
        dimensions
      }
    }
  },
  seoTitle,
  seoDescription,
  socialTitle,
  socialDescription,
  "socialImage": socialImage{
    alt,
    caption,
    asset->{
      url,
      metadata{
        lqip,
        dimensions
      }
    }
  },
  linkedinCopy,
  xCopy
`;

export const categoriesQuery = `
  *[_type == "category"] | order(title asc) {
    title,
    "slug": slug.current,
    description
  }
`;

export const blogSettingsQuery = `
  *[_type == "blogSettings"][0]{
    title,
    description,
    ctaTitle,
    ctaDescription,
    ctaLabel,
    ctaHref,
    "heroPost": heroPost->{
      ${postCardFields},
      body
    },
    "featuredPosts": featuredPosts[]->{
      ${postCardFields},
      body
    }
  }
`;

export const latestPostsQuery = `
  *[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc)[0...$limit]{
    ${postCardFields},
    body
  }
`;

export const recentPostsQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    !(_id in $excludeIds)
  ] | order(coalesce(publishedAt, _createdAt) desc)[$start...$end]{
    ${postCardFields},
    body
  }
`;

export const recentPostsCountQuery = `
  count(*[
    _type == "post" &&
    defined(slug.current) &&
    !(_id in $excludeIds)
  ])
`;

export const filteredPostsQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    ($category == "" || category->slug.current == $category) &&
    ($search == "" || title match $search || excerpt match $search)
  ] | order(coalesce(publishedAt, _createdAt) desc)[$start...$end]{
    ${postCardFields},
    body
  }
`;

export const filteredPostsCountQuery = `
  count(*[
    _type == "post" &&
    defined(slug.current) &&
    ($category == "" || category->slug.current == $category) &&
    ($search == "" || title match $search || excerpt match $search)
  ])
`;

export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0]{
    ${postCardFields},
    body
  }
`;

export const relatedPostsQuery = `
  *[
    _type == "post" &&
    defined(slug.current) &&
    slug.current != $slug &&
    category->slug.current == $category
  ] | order(coalesce(publishedAt, _createdAt) desc)[0...3]{
    ${postCardFields},
    body
  }
`;
