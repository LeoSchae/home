/** @jsx jsx */
/** @jsxFrag jsx.Fragment */
import { jsx } from "@lib/UnsafeXML";

type HeaderItems = {
  display: string;
  url?: string;
  children?: { [key: string]: HeaderItems };
};

function Children({
  items,
  list_classes,
  item_classes,
}: {
  items: HeaderItems[];
  list_classes: string[];
  item_classes: string[];
}) {
  let props = { list_classes: list_classes.slice(1), item_classes };
  return (
    <ul class={list_classes[0]}>
      {...items.map((item) => <Item item={item} {...props} />)}
    </ul>
  );
}

function Item({
  item,
  list_classes,
  item_classes,
}: {
  item: HeaderItems;
  list_classes: string[];
  item_classes: string[];
}) {
  let props = {
    items: Object.values(item.children || {}),
    item_classes: item_classes.slice(1),
    list_classes,
  };
  let hasChildren = props.items.length != 0;

  return (
    <li class={item_classes[0]}>
      {Name(item)}
      {hasChildren ? <Children {...props} /> : <></>}
    </li>
  );
}

function Name(item: { display: string; url?: string }) {
  if (item.url) return <a href={item.url}>{item.display}</a>;
  return <span tabindex="0">{item.display}</span>;
}

export default function (
  // @ts-ignore
  eleventyConfig: typeof import("@11ty/eleventy/src/UserConfig"),
  options: any
) {
  let { keyDelimiter = "::" } = options || {};

  eleventyConfig.addShortcode(
    "navigation_html",
    function (
      collection: any[],
      opt?: {
        list_classes?: string[];
        item_classes?: string[];
      }
    ) {
      let options = {
        list_classes: opt?.list_classes || [],
        item_classes: opt?.item_classes || [],
      };
      /** @type {{[key: string]: { display: string, url?: string, children: {[key: string]: {display: string, url?: string}}} }} */
      const header = {} as any;

      for (let page of collection) {
        if (!("nav" in page.data)) continue;
        if (!("key" in page.data.nav)) {
          console.warn(
            `warning: Page "${page.url}" has data "nav", but not "nav.key".`
          );
          continue;
        }
        const key = page.data.nav.key.split(keyDelimiter);
        if (key.length == 0 || key.length > 2)
          console.warn(
            `warning: Page "${page.url}" has invalid "nav.key" length after splitting.`
          );

        let parent;
        if (key[0] in header) parent = header[key[0]];
        else {
          parent = { display: key[0], children: {} };
          header[key[0]] = parent;
        }

        if (key.length == 1) {
          parent["url"] = page.url;
          continue;
        }

        let child;
        if (key[1] in parent.children) {
          child = parent.children[key[1]];
          console.warn(
            `warning: Duplicate navigation entry: "${page.url}" and "${child.url}"`
          );
        } else {
          child = { display: key[1], url: page.url };
          parent.children[key[1]] = child;
        }
      }

      return (
        <Children
          items={Object.values(header)}
          list_classes={options.list_classes}
          item_classes={options.item_classes}
        />
      ).toString();
    }
  );
}
