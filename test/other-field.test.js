import { expect, html } from '@open-wc/testing';
import '@vaadin/text-field';
import { flush, lookupFixture, OBJECT_ITEMS, openDialog } from './helpers.js';

// The lookup field is built around `vaadin-combo-box`, but the `field` slot
// takes any element. These check that a field without the combo box API does
// not break the lookup field.
describe('vcf-lookup-field: a slotted field that is not a combo box', () => {
  [
    ['vaadin-text-field', () => html`<vaadin-text-field slot="field" value="Ban"></vaadin-text-field>`],
    ['native input', () => html`<input slot="field" value="Ban" />`]
  ].forEach(([name, field]) => {
    describe(name, () => {
      let el;

      beforeEach(async () => {
        el = await lookupFixture(html`
          <vcf-lookup-field .items="${OBJECT_ITEMS}" item-label-path="label" item-value-path="value">
            ${field()}
          </vcf-lookup-field>
        `);
      });

      it('opens the dialog with the field text as the filter', async () => {
        const dialog = await openDialog(el);

        expect(dialog.opened).to.be.true;
        expect(el._filterdata).to.equal('Ban');
      });

      it('labels items with the host item label path', () => {
        expect(el._getItemLabel(OBJECT_ITEMS[1])).to.equal('Banana');
      });

      it('focuses the field', async () => {
        el.focus();
        await new Promise(resolve => setTimeout(resolve, 150));
        await flush();

        expect(el.field.contains(document.activeElement) || el.field === document.activeElement).to.be.true;
      });
    });
  });
});
