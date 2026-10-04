const sanitizeHtml = require("sanitize-html");

/**
 * Sanitize user-generated HTML content.
 * Allows legitimate rich text formatting while stripping XSS vectors.
 */
function sanitizeContent(dirty) {
  if (!dirty || typeof dirty !== "string") return "";

  return sanitizeHtml(dirty, {
    allowedTags: [
      // Block elements
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "div", "blockquote", "pre", "code",
      "ul", "ol", "li", "hr", "br",
      // Inline formatting
      "b", "i", "u", "s", "em", "strong", "strike", "del",
      "sub", "sup", "mark", "small", "span",
      // Media & links
      "a", "img", "figure", "figcaption",
      // Tables (for future use)
      "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "loading", "width", "height"],
      figure: ["class"],
      figcaption: ["contenteditable", "placeholder"],
      code: ["class"],
      pre: ["class"],
      span: ["class", "style"],
      div: ["class"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Force safe link attributes
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
    // Strip all event handlers (onclick, onerror, etc.)
    allowedStyles: {
      span: {
        color: [/^#[0-9a-fA-F]{3,6}$/],
        "background-color": [/^#[0-9a-fA-F]{3,6}$/],
      },
    },
  });
}

module.exports = { sanitizeContent };
