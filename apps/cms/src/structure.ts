export const structure = (S: any) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Blog settings")
        .id("blogSettings")
        .child(
          S.editor()
            .title("Blog settings")
            .schemaType("blogSettings")
            .documentId("blogSettings"),
        ),
      S.divider(),
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("author").title("Authors"),
    ]);
