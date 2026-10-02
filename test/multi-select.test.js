import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import '@vaadin/multi-select-combo-box';
import { flush, footerButtons, openDialog, OBJECT_ITEMS } from './helpers.js';

/** Ticks rows the way the selection column does. */
function tick(grid, ...items) {
  items.forEach(item => grid.selectItem(item));
}

describe('vcf-lookup-field: multi-select through the dialog', () => {
  describe('the default grid', () => {
    let el;

    beforeEach(async () => {
      el = await fixture(html`<vcf-lookup-field multi-select .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();
    });

    it('has a selection column in multi-select mode', async () => {
      const column = el._grod.querySelector('vaadin-grid-selection-column');

      expect(column).to.exist;
      expect(customElements.get('vaadin-grid-selection-column')).to.exist;
      expect(el._grod.firstElementChild).to.equal(column);
    });

    it('has no selection column in single-select mode', async () => {
      const single = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      expect(single._grod.querySelector('vaadin-grid-selection-column')).to.not.exist;
    });

    it('adds and removes the selection column when multiSelect changes', async () => {
      el.multiSelect = false;
      await nextFrame();
      expect(el._grod.querySelector('vaadin-grid-selection-column')).to.not.exist;

      el.multiSelect = true;
      await nextFrame();
      expect(el._grod.querySelector('vaadin-grid-selection-column')).to.exist;
    });

    it('enables Select once rows are ticked', async () => {
      await openDialog(el);

      tick(el._grod, OBJECT_ITEMS[1], OBJECT_ITEMS[2]);
      await nextFrame();

      expect(footerButtons(el).select.disabled).to.be.false;
    });
  });

  describe('a slotted vaadin-multi-select-combo-box', () => {
    let el;
    let field;

    beforeEach(async () => {
      el = await fixture(html`
        <vcf-lookup-field multi-select item-label-path="label" .items="${OBJECT_ITEMS}">
          <vaadin-multi-select-combo-box
            slot="field"
            item-label-path="label"
            item-id-path="value"
          ></vaadin-multi-select-combo-box>
        </vcf-lookup-field>
      `);
      await flush();
      field = el.field;
      el.selectedItems = [OBJECT_ITEMS[0]];
      await flush();
    });

    it('ticks the field selection in the grid when the dialog opens', async () => {
      await openDialog(el);

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[0]]);
      expect(footerButtons(el).select.disabled).to.be.false;
    });

    it('applies the whole grid selection to the field', async () => {
      const events = [];
      el.addEventListener('selected-items-changed', e => events.push(e.detail.value));
      await openDialog(el);

      tick(el._grod, OBJECT_ITEMS[1], OBJECT_ITEMS[2]);
      await nextFrame();
      footerButtons(el).select.click();
      await flush();

      const expected = [OBJECT_ITEMS[0], OBJECT_ITEMS[1], OBJECT_ITEMS[2]];
      expect(field.selectedItems).to.deep.equal(expected);
      expect(el.selectedItems).to.deep.equal(expected);
      expect(events.at(-1)).to.deep.equal(expected);
      expect(el._dialog.opened).to.be.false;
    });

    it('applies unticked rows too', async () => {
      await openDialog(el);

      el._grod.deselectItem(OBJECT_ITEMS[0]);
      tick(el._grod, OBJECT_ITEMS[3]);
      await nextFrame();
      el.__select();
      await flush();

      expect(field.selectedItems).to.deep.equal([OBJECT_ITEMS[3]]);
    });

    it('fires change on the field when Select changes the selection', async () => {
      let changes = 0;
      el.addEventListener('change', () => (changes += 1));
      await openDialog(el);

      tick(el._grod, OBJECT_ITEMS[1]);
      await nextFrame();
      el.__select();
      await flush();

      expect(changes).to.equal(1);
    });

    it('does not fire change when Select keeps the same selection', async () => {
      let changes = 0;
      el.addEventListener('change', () => (changes += 1));
      await openDialog(el);

      el.__select();
      await flush();

      expect(changes).to.equal(0);
    });

    it('clears a required error once rows are picked', async () => {
      el.selectedItems = [];
      field.required = true;
      await flush();
      field.validate();
      expect(field.invalid).to.be.true;

      await openDialog(el);
      tick(el._grod, OBJECT_ITEMS[2]);
      await nextFrame();
      el.__select();
      await flush();

      expect(field.invalid).to.be.false;
    });

    it('does not share the grid selection array with the field', async () => {
      await openDialog(el);
      el.__select();
      await flush();

      expect(field.selectedItems).to.not.equal(el._grod.selectedItems);
    });
  });

  describe('the default combo box', () => {
    let el;

    beforeEach(async () => {
      el = await fixture(html`<vcf-lookup-field multi-select .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();
    });

    it('ticks the field selection in the grid when the dialog opens', async () => {
      el._field.selectedItem = OBJECT_ITEMS[1];
      await nextFrame();

      await openDialog(el);

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[1]]);
    });

    it('opens with nothing ticked and Select disabled when the field is empty', async () => {
      await openDialog(el);

      expect(el._grod.selectedItems).to.deep.equal([]);
      expect(footerButtons(el).select.disabled).to.be.true;
    });
  });
});
