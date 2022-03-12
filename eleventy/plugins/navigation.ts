function renderParent({
  display,
  url,
  children,
}: {
  display: string;
  url?: string;
  children: { [key: string]: { display: string; url?: string } };
}) {
  let html;
  if (url) html = `<a href="${url}">${display}</a>`;
  else html = `<span tabindex="0">${display}</span>`;

  if (Object.values(children).length != 0)
    html += `<ul class="n-ul2">${Object.values(children)
      .map((child) => renderChild(child))
      .join("")}</ul>`;

  return `<li class="n-li1">${html}</li>`;
}

function renderChild({ display, url }: { display: string; url?: string }) {
  if (url) return `<li class="n-li2"><a href="${url}">${display}</a></li>`;
  return `<li class="n-li2"><span>${display}</span></li>`;
}

export default function (
  // @ts-ignore
  eleventyConfig: typeof import("@11ty/eleventy/src/UserConfig"),
  options: any
) {
  let { keyDelimiter = "::" } = options || {};

  eleventyConfig.addShortcode("navigation_html", function (collection: any[]) {
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

    return `<ul class="n-ul1">${Object.values(header)
      .map((parent) => renderParent(parent as any))
      .join("")}</ul>`;
  });
}
