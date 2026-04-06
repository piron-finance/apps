import { defineArrayMember, defineField, defineType } from "sanity";

const imageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: {
      hotspot: true,
    },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        validation: (rule) => rule.required().max(140),
      }),
      defineField({
        name: "caption",
        title: "Caption",
        type: "string",
        validation: (rule) => rule.max(180),
      }),
    ],
  });

export const postType = defineType({
  name: "post",
  title: "Post",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
    { name: "seo", title: "SEO & Social" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "settings",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 4,
      group: "content",
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "settings",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      group: "settings",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "settings",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "settings",
      of: [defineArrayMember({ type: "string" })],
      options: {
        layout: "tags",
      },
    }),
    imageField("mainImage", "Main image"),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [{ title: "Bullet", value: "bullet" }],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                title: "Link",
                type: "object",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                    validation: (rule) =>
                      rule.uri({
                        allowRelative: true,
                        scheme: ["http", "https", "mailto", "tel"],
                      }),
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (rule) => rule.max(140),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
              validation: (rule) => rule.max(180),
            }),
          ],
        }),
        defineArrayMember({ type: "callout" }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      group: "seo",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(160),
    }),
    imageField("socialImage", "Social image"),
    defineField({
      name: "socialTitle",
      title: "Social title",
      type: "string",
      group: "seo",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "socialDescription",
      title: "Social description",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "linkedinCopy",
      title: "Suggested LinkedIn copy",
      type: "text",
      rows: 4,
      group: "seo",
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: "xCopy",
      title: "Suggested X copy",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (rule) => rule.max(280),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category.title",
      media: "mainImage",
    },
  },
});
