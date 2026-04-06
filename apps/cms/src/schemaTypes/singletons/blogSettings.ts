import { defineField, defineType } from "sanity";

export const blogSettingsType = defineType({
  name: "blogSettings",
  title: "Blog settings",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Blog title",
      type: "string",
      initialValue: "Piron Journal",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "description",
      title: "Blog description",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(220),
    }),
    defineField({
      name: "heroPost",
      title: "Hero post",
      type: "reference",
      to: [{ type: "post" }],
    }),
    defineField({
      name: "featuredPosts",
      title: "Featured posts",
      type: "array",
      of: [{ type: "reference", to: [{ type: "post" }] }],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "ctaTitle",
      title: "CTA title",
      type: "string",
      initialValue: "Ready to start earning with Piron?",
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: "ctaDescription",
      title: "CTA description",
      type: "text",
      rows: 3,
      initialValue:
        "Explore the app, review live pools, and move from research into action with clearer access to fixed-income opportunities.",
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA button label",
      type: "string",
      initialValue: "Launch app",
      validation: (rule) => rule.max(30),
    }),
    defineField({
      name: "ctaHref",
      title: "CTA button URL",
      type: "string",
      initialValue: "/",
      validation: (rule) => rule.required().max(200),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Blog settings",
      subtitle: "Controls hero, featured posts, and CTA copy",
    }),
  },
});
