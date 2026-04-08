import { authorType } from "./documents/author";
import { categoryType } from "./documents/category";
import { postType } from "./documents/post";
import { blogSettingsType } from "./singletons/blogSettings";
import { calloutType } from "./objects/callout";

export const schemaTypes = [
  authorType,
  categoryType,
  postType,
  blogSettingsType,
  calloutType,
];
