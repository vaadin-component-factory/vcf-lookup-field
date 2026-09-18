import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { flush, lookupFixture, openDialog, OBJECT_ITEMS } from './helpers.js';
import '@vaadin/combo-box';

/**
 * The lookup field keeps no copy of the value: `value`, `selectedItem` and
 * `selectedItems` read and write the field in the `field` slot directly. These
 * tests pin that down, because a stored copy is exactly what used to let the
 * host and the combo box disagree.
 */
describe('vcf-lookup-field: value', () => {
  describe('reading through to the field', () => {
    it('reports the value of the field', async () => {
      const el = await lookupFixture();

      el.field.value = 'apple';

      expect(el.value).to.equal('apple');
    });

    it('reports the selected item of the field', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      el.field.selectedItem = OBJECT_ITEMS[1];

      expect(el.selectedItem).to.deep.equal(OBJECT_ITEMS[1]);
    });

    it('exposes the field itself as a documented escape hatch', async () => {
      const el = await lookupFixture();

      expect(el.field).to.equal(el._field);
      expect(el.field.localName).to.equal('vaadin-combo-box');
    });
  });

  describe('writing through to the field', () => {
    it('sets the value on the field', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      el.value = 'banana';
      await nextFrame();

      expect(el.field.value).to.equal('banana');
      expect(el.value).to.equal('banana');
    });

    it('sets the selected item on the field', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      el.selectedItem = OBJECT_ITEMS[2];
      await nextFrame();

      expect(el.field.selectedItem).to.deep.equal(OBJECT_ITEMS[2]);
      expect(el.field.value).to.equal('cherry');
      expect(el.value).to.equal('cherry');
    });

    it('applies a value written before the field exists', async () => {
      const el = document.createElement('vcf-lookup-field');
      el.items = OBJECT_ITEMS;
      // No field has been adopted yet, so this is buffered rather than lost.
      el.value = 'blueberry';
      expect(el.value).to.equal('blueberry');

      document.body.appendChild(el);
      await flush();

      expect(el.field.value).to.equal('blueberry');
      expect(el.value).to.equal('blueberry');
      el.remove();
    });
  });

  describe('the host and the field cannot disagree', () => {
    it('reports the item the lookup dialog selected', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      await openDialog(el);
      el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[3]] } });
      await nextFrame();
      el.__select();
      await flush();

      expect(el.selectedItem).to.deep.equal(OBJECT_ITEMS[3]);
      expect(el.value).to.equal('blueberry');
      expect(el.value).to.equal(el.field.value);
    });

    it('re-dispatches the field value-changed exactly once', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      const values = [];
      el.addEventListener('value-changed', e => values.push(e.detail.value));

      el.field.value = 'cherry';
      await flush();

      expect(values).to.deep.equal(['cherry']);
    });

    it('re-dispatches selected-item-changed, which the field fires non-bubbling', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      const items = [];
      el.addEventListener('selected-item-changed', e => items.push(e.detail.value));

      el.field.selectedItem = OBJECT_ITEMS[0];
      await flush();

      expect(items).to.deep.equal([OBJECT_ITEMS[0]]);
    });
  });

  describe('a field with no value property', () => {
    /**
     * `vaadin-multi-select-combo-box` carries `selectedItems` and has no `value`
     * at all. It is not a dependency of this package, so this stands in for it:
     * what matters is that the host reports whatever the field it wraps has,
     * with no translation layer that could fall out of step.
     */
    before(() => {
      if (!customElements.get('fake-multi-select-field')) {
        customElements.define(
          'fake-multi-select-field',
          class extends HTMLElement {
            constructor() {
              super();
              this.selectedItems = [];
            }
          }
        );
      }
    });

    it('reports selectedItems and leaves value undefined', async () => {
      const el = await fixture(html`
        <vcf-lookup-field multi-select>
          <fake-multi-select-field slot="field"></fake-multi-select-field>
        </vcf-lookup-field>
      `);
      await flush();

      el.field.selectedItems = [OBJECT_ITEMS[0], OBJECT_ITEMS[2]];

      expect(el.selectedItems).to.deep.equal([OBJECT_ITEMS[0], OBJECT_ITEMS[2]]);
      expect(el.value).to.be.undefined;
    });

    it('writes selectedItems through to the field', async () => {
      const el = await fixture(html`
        <vcf-lookup-field multi-select>
          <fake-multi-select-field slot="field"></fake-multi-select-field>
        </vcf-lookup-field>
      `);
      await flush();

      el.selectedItems = [OBJECT_ITEMS[1]];

      expect(el.field.selectedItems).to.deep.equal([OBJECT_ITEMS[1]]);
    });
  });

  describe('replacing the field', () => {
    it('lets go of the field it no longer wraps', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();
      const original = el.field;

      const replacement = document.createElement('vaadin-combo-box');
      replacement.setAttribute('slot', 'field');
      replacement.items = OBJECT_ITEMS;
      el.appendChild(replacement);
      await flush();

      expect(el.field).to.equal(replacement);

      const values = [];
      el.addEventListener('value-changed', e => values.push(e.detail.value));

      original.value = 'apple';
      await flush();

      expect(values).to.be.empty;
      expect(el.value).to.not.equal('apple');
    });
  });
});
