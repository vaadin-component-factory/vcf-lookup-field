import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/color.js';
import '@vaadin/vaadin-lumo-styles/mixins/overlay.js';

registerStyles(
  'vaadin-dialog-overlay',
  css`
    :host([theme~="lookup-dialog"]) [part="overlay"] {
        min-width: 400px;
    }
  `
);
