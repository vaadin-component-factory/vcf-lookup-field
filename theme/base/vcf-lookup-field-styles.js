import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';

registerStyles(
  'vaadin-dialog-overlay',
  css`
    :host([theme~="lookup-dialog"]) [part="content"] {
        min-width: 400px;
    }
  `
);
