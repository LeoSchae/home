---
title: Leo Schäfer
description: "Homepage of Leo."
layout: "main.njk"
---

<style type="text/css">
h1 {
  padding: 0 15px;
  border-bottom: 1px solid black;
}

p:before {
  content: "";
  display: inline-block;
  width: 1em;
}

h1, h2, h3, p {
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

main a {
  color: #017698;
  text-decoration: underline dotted 1px;
}

main a:hover {
  color: #004fd9;
}

</style>

# About me

My name is Leo Schäfer, I studied Mathematics at the Georg-August University of Göttingen. My main interests lie in the field of analytic number theory.

You can take a look at [some of my small web projects]({% urlCheck "/projects/", collections.all %} "A list of my smaller projects").

## About this website

No cookies! Everything is static, built with [Eleventy](https://www.11ty.dev/ "A cool static site generator"), [PostCSS](https://postcss.org/ "Fancy things on top of CSS") and [ESBuild](https://esbuild.github.io/ "A bundler for javascript and typescript"). No data is collected :)

{% if isProduction == false %}
<a href="/buildlog.html" style="display: block; font-size: 0.75rem; float: right; bot: 0; right: 0; margin-top: 4rem;">buildlog</a>
{% endif %}