import { css, html, LitElement } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import 'prismjs';
import '@vaadin/button';
import '@vaadin/icon';
import '@vaadin/icons';

/** Removes the indentation that every line of the snippet shares. */
const dedent = text => {
  const lines = text.replace(/^\s*\n|\n\s*$/g, '').split('\n');
  const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.match(/^ */)[0].length));
  return lines.map(line => line.slice(indent)).join('\n');
};

/**
 * Shows the example in its `<template>` and, below it, the template's code.
 *
 * The template is stamped into the light DOM, so its scripts run and the page
 * styles apply to the example.
 */
class DemoSnippet extends LitElement {
  static get properties() {
    return {
      _code: { state: true },
      _copied: { state: true }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        margin: 0 0 40px;
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
      }

      .demo {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
      }

      .code {
        position: relative;
        background: #f5f5f5;
      }

      pre {
        margin: 0;
        padding: 16px 20px;
        max-height: 320px;
        overflow: auto;
        font-family: 'Fira Code', Consolas, Monaco, monospace;
        font-size: 12px;
        line-height: 1.5;
        color: #000;
        tab-size: 2;
      }

      vaadin-button {
        position: absolute;
        top: 0;
        right: 16px;
        margin: 0;
        border-radius: 0 0 0 var(--lumo-border-radius-m);
        background: #e0e0e0;
        color: #333;
      }

      /* Prism's default theme. */
      .token.comment,
      .token.prolog,
      .token.doctype,
      .token.cdata {
        color: slategray;
      }
      .token.punctuation {
        color: #999;
      }
      .token.property,
      .token.tag,
      .token.boolean,
      .token.number,
      .token.constant,
      .token.symbol,
      .token.deleted {
        color: #905;
      }
      .token.selector,
      .token.attr-name,
      .token.string,
      .token.char,
      .token.builtin,
      .token.inserted {
        color: #690;
      }
      .token.operator,
      .token.entity,
      .token.url {
        color: #9a6e3a;
      }
      .token.atrule,
      .token.attr-value,
      .token.keyword {
        color: #07a;
      }
      .token.function,
      .token.class-name {
        color: #dd4a68;
      }
      .token.regex,
      .token.important,
      .token.variable {
        color: #e90;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    const template = this.querySelector(':scope > template');
    if (template) {
      this._code = dedent(template.innerHTML);
      // importNode, unlike innerHTML, gives scripts that run when inserted.
      this.appendChild(document.importNode(template.content, true));
      template.remove();
    }
  }

  render() {
    const { Prism } = window;
    return html`
      <div class="demo"><slot></slot></div>
      <div class="code">
        <pre><code>${unsafeHTML(Prism.highlight(this._code || '', Prism.languages.markup, 'markup'))}</code></pre>
        <vaadin-button
          theme="icon tertiary small"
          title="Copy to clipboard"
          aria-label="Copy to clipboard"
          @click="${this.__copy}"
        >
          <vaadin-icon icon="${this._copied ? 'vaadin:check' : 'vaadin:copy-o'}"></vaadin-icon>
        </vaadin-button>
      </div>
    `;
  }

  async __copy() {
    await navigator.clipboard.writeText(this._code);
    this._copied = true;
    setTimeout(() => {
      this._copied = false;
    }, 2000);
  }
}

customElements.define('demo-snippet', DemoSnippet);
