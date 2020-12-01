import { registerStyles, css } from '@vaadin/vaadin-themable-mixin/register-styles.js';
import '@vaadin/vaadin-lumo-styles/spacing.js';
import '@vaadin/vaadin-lumo-styles/color.js';
import '@vaadin/vaadin-lumo-styles/mixins/overlay.js';

registerStyles(
  'vcf-enhanced-dialog-overlay',
  css`
    :host([theme~="lookup-dialog"]) [part="content"] {
        min-width: 400px;
    }
  `
);


registerStyles(
  'vcf-lookup-field',
  css`.search-button {
  margin-left: var(--lumo-space-xs);
}
  `
);


