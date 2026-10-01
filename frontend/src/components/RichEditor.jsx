import React, { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Minus,
  X,
  Check,
  Sparkles,
} from "lucide-react";

export default function RichEditor({ value = "", onChange, placeholder = "Tell your story..." }) {
  const editorRef = useRef(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [savedSelection, setSavedSelection] = useState(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(1);

  // Sync value into innerHTML initially or when updated externally (e.g. edit mode load)
  useEffect(() => {
    if (editorRef.current) {
      // Only set innerHTML if content is significantly different to prevent cursor jumps
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
      updateCounts();
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      updateCounts();
      if (onChange) {
        // If innerHTML is empty (e.g. single <br>), clear to empty string
        const cleanHtml = html === "<br>" ? "" : html;
        onChange(cleanHtml);
      }
    }
  };

  const updateCounts = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || editorRef.current.textContent || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setReadTime(Math.max(1, Math.ceil(words / 200)));
  };

  // Helper for execCommand
  const execCmd = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleInput();
    }
  };

  // Heading toggles
  const applyHeading = (tag) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    // Check current block
    const focusNode = selection.focusNode;
    let blockNode = focusNode?.nodeType === 3 ? focusNode.parentNode : focusNode;
    while (blockNode && blockNode !== editorRef.current && !["P", "H1", "H2", "H3", "BLOCKQUOTE", "DIV"].includes(blockNode.tagName)) {
      blockNode = blockNode.parentNode;
    }

    if (blockNode && blockNode.tagName === tag.toUpperCase()) {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
    handleInput();
  };

  const applyQuote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    let blockNode = selection.focusNode?.parentNode;
    while (blockNode && blockNode !== editorRef.current && !["P", "H1", "H2", "H3", "BLOCKQUOTE", "DIV"].includes(blockNode.tagName)) {
      blockNode = blockNode.parentNode;
    }

    if (blockNode && blockNode.tagName === "BLOCKQUOTE") {
      document.execCommand("formatBlock", false, "<p>");
    } else {
      document.execCommand("formatBlock", false, "<blockquote>");
    }
    handleInput();
  };

  // Save selection before opening modal
  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      setSavedSelection(sel.getRangeAt(0));
    }
  };

  const restoreSelection = (range) => {
    if (range) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  // Link Handler
  const openLinkDialog = () => {
    saveCurrentSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : "";
    setLinkText(selectedText);
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const confirmInsertLink = (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    const formattedUrl = linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;

    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection(savedSelection);

      if (linkText.trim()) {
        const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${linkText.trim()}</a>`;
        document.execCommand("insertHTML", false, linkHtml);
      } else {
        document.execCommand("createLink", false, formattedUrl);
      }
      handleInput();
    }

    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const removeLink = () => {
    execCmd("unlink");
  };

  // Image Handler (Multiple Images Support)
  const openImageDialog = () => {
    saveCurrentSelection();
    setImageUrl("");
    setImageCaption("");
    setImageAlt("");
    setShowImageModal(true);
  };

  const confirmInsertImage = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    const src = imageUrl.trim();
    const caption = imageCaption.trim();
    const alt = imageAlt.trim() || caption || "Story image";

    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection(savedSelection);

      const figureHtml = `
        <figure class="rich-figure" contenteditable="false">
          <img src="${src}" alt="${alt}" loading="lazy" />
          ${caption ? `<figcaption contenteditable="true" placeholder="Add image caption...">${caption}</figcaption>` : `<figcaption contenteditable="true" placeholder="Add image caption..."></figcaption>`}
        </figure>
        <p><br></p>
      `;

      document.execCommand("insertHTML", false, figureHtml);
      handleInput();
    }

    setShowImageModal(false);
    setImageUrl("");
    setImageCaption("");
    setImageAlt("");
  };

  return (
    <div className="rich-editor-wrapper">
      {/* Floating / Sticky Medium-Style Toolbar */}
      <div className="rich-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="tb-btn"
            onClick={() => execCmd("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={() => execCmd("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={() => execCmd("underline")}
            title="Underline (Ctrl+U)"
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={() => execCmd("strikeThrough")}
            title="Strikethrough"
          >
            <Strikethrough size={15} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={() => execCmd("formatBlock", "<code>")}
            title="Code snippet"
          >
            <Code size={15} />
          </button>
        </div>

        <div className="tb-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className="tb-btn"
            onClick={() => applyHeading("h2")}
            title="Section Heading (H2)"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={() => applyHeading("h3")}
            title="Sub Heading (H3)"
          >
            <Heading3 size={16} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={applyQuote}
            title="Blockquote"
          >
            <Quote size={15} />
          </button>
        </div>

        <div className="tb-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className="tb-btn"
            onClick={() => execCmd("insertUnorderedList")}
            title="Bulleted List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={() => execCmd("insertOrderedList")}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={() => execCmd("insertHorizontalRule")}
            title="Divider line"
          >
            <Minus size={16} />
          </button>
        </div>

        <div className="tb-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className="tb-btn"
            onClick={openLinkDialog}
            title="Add Link / URL"
          >
            <LinkIcon size={15} />
          </button>
          <button
            type="button"
            className="tb-btn"
            onClick={removeLink}
            title="Remove Link"
          >
            <Unlink size={15} />
          </button>
          <button
            type="button"
            className="tb-btn highlight-btn"
            onClick={openImageDialog}
            title="Add Multiple Images inline"
          >
            <ImageIcon size={15} />
            <span className="tb-btn-label">Image</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="editor-canvas-container">
        <div
          ref={editorRef}
          className="rich-editor-content"
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
        />
      </div>

      {/* Bottom Editor Bar */}
      <div className="editor-footer-stats">
        <span>{wordCount} words</span>
        <span>·</span>
        <span>{readTime} min read</span>
      </div>

      {/* MODAL: Insert Link */}
      {showLinkModal && (
        <div className="editor-modal-backdrop" onClick={() => setShowLinkModal(false)}>
          <div className="editor-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Insert Hyperlink</h3>
              <button type="button" onClick={() => setShowLinkModal(false)} className="close-btn">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={confirmInsertLink} className="modal-form">
              <label>
                Display Text (optional)
                <input
                  type="text"
                  placeholder="e.g. Read more here"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </label>
              <label>
                URL Address *
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowLinkModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <Check size={14} /> Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Insert Image */}
      {showImageModal && (
        <div className="editor-modal-backdrop" onClick={() => setShowImageModal(false)}>
          <div className="editor-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <ImageIcon size={18} style={{ color: "var(--accent)" }} /> Insert Inline Image
              </h3>
              <button type="button" onClick={() => setShowImageModal(false)} className="close-btn">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={confirmInsertImage} className="modal-form">
              <label>
                Image URL *
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <label>
                Caption (optional)
                <input
                  type="text"
                  placeholder="e.g. Photo by John Doe on Unsplash"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                />
              </label>
              <label>
                Alt Description (optional)
                <input
                  type="text"
                  placeholder="Describe image for accessibility"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </label>

              {/* Preset Sample Images Quick Selector */}
              <div className="preset-images-section">
                <span>Quick Preset Images:</span>
                <div className="preset-thumbnails">
                  {[
                    { label: "Writing Desk", url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop" },
                    { label: "Workspace", url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop" },
                    { label: "Minimalist Art", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop" },
                    { label: "Nature & Coffee", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop" }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="preset-btn"
                      onClick={() => {
                        setImageUrl(preset.url);
                        if (!imageCaption) setImageCaption(preset.label);
                      }}
                    >
                      <img src={preset.url} alt={preset.label} />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowImageModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  <Check size={14} /> Add Image to Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
