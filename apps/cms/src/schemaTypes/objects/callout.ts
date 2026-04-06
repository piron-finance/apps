import { defineField, defineType } from "sanity";

export const calloutType = defineType({
  name: "callout",
  title: "Callout",
  type: "object",
  fields: [
    defineField({
      name: "tone",
      title: "Tone",
      type: "string",
      options: {
        list: [
          { title: "Neutral", value: "neutral" },
          { title: "Success", value: "success" },
          { title: "Warning", value: "warning" },
        ],
      },
      initialValue: "neutral",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(280),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "tone",
    },
  },
});
