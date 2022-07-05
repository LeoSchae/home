---
title: Leo Schäfer
description: "Homepage of Leo."
---

<style type="text/css">
h1 {
  padding: 0 15px;
  border-bottom: 1px solid black;
}

p::before {
  content: "";
  display: inline-block;
  width: 1em;
}

main a {
  position: relative;
  color: #017698;
  text-decoration: none;
}

main a:hover {
  color: #004fd9;
}

main a::before {
  content: "";
  position: absolute;
  bottom: -1px;
  width: 100%;
  box-sizing: content-box;
  border-bottom: 1px dotted currentColor;
}

main a:hover::before {
  border-bottom-style: solid;
}

</style>

# About me

My name is Leo Schäfer, I studied Mathematics at the Georg-August University of Göttingen. My main interests lie in the field of analytic number theory.

You can take a look at [some of my small web projects]({{ "/projects/" | link }} "A list of my smaller projects").

## About this website

No cookies! Everything is static and built with [Eleventy](https://www.11ty.dev/ "A cool static site generator"), [PostCSS](https://postcss.org/ "Fancy things on top of CSS"), [ESBuild](https://esbuild.github.io/ "A bundler for javascript and typescript") and <a href="https://katex.org/" title="Fast mathematics inside the browser">{% math "\\KaTeX" %}</a>. No data is collected :)

{% if isProduction == false %}
<a href="/home/buildlog.html" style="display: block; font-size: 0.75rem; float: right; bot: 0; right: 0; margin-top: 4rem;">buildlog</a>
{% endif %}
