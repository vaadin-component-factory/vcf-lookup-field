import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { flush, OBJECT_ITEMS } from './helpers.js';

describe('vcf-lookup-field: grid selection', () => {
  let el;

  beforeEach(async () => {
    el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
    await flush();
  });

  describe('active-item-changed', () => {
    it('selects the activated row in single-select mode', async () => {
      el._grod.dispatchEvent(new CustomEvent('active-item-changed', { detail: { value: OBJECT_ITEMS[1] } }));

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[1]]);
    });

    it('clears the selection when the row is deactivated', async () => {
      el._grod.selectedItems = [OBJECT_ITEMS[1]];

      el._grod.dispatchEvent(new CustomEvent('active-item-changed', { detail: { value: null } }));

      expect(el._grod.selectedItems).to.deep.equal([]);
    });

    it('replaces the previous selection rather than adding to it', async () => {
      el.__onSelectItem({ detail: { value: OBJECT_ITEMS[0] } });
      el.__onSelectItem({ detail: { value: OBJECT_ITEMS[2] } });

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[2]]);
    });

    it('leaves the selection alone in multi-select mode', async () => {
      el.multiSelect = true;
      el._grod.selectedItems = [OBJECT_ITEMS[0]];

      el.__onSelectItem({ detail: { value: OBJECT_ITEMS[2] } });

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[0]]);
    });
  });

  describe('selected-items-changed', () => {
    it('enables Select once at least one row is selected', async () => {
      expect(el.programselectdisabled).to.be.true;

      el._grod.dispatchEvent(
        new CustomEvent('selected-items-changed', { detail: { value: [OBJECT_ITEMS[1]] } })
      );

      expect(el.programselectdisabled).to.be.false;
      expect(el.hasselected).to.be.true;
      expect(el._grodSelectedItem).to.deep.equal([OBJECT_ITEMS[1]]);
    });

    it('disables Select again when the selection is emptied', async () => {
      el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[1]] } });

      el.__onSelectChanged({ detail: { value: [] } });

      expect(el.programselectdisabled).to.be.true;
      expect(el.hasselected).to.be.false;
      expect(el._grodSelectedItem).to.deep.equal([]);
    });

    it('copies the selection instead of holding a reference to the grid array', async () => {
      const selection = [OBJECT_ITEMS[1]];

      el.__onSelectChanged({ detail: { value: selection } });
      selection.push(OBJECT_ITEMS[2]);

      expect(el._grodSelectedItem).to.deep.equal([OBJECT_ITEMS[1]]);
    });

    it('keeps every selected row in multi-select mode', async () => {
      el.multiSelect = true;
      await nextFrame();

      el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[0], OBJECT_ITEMS[2]] } });

      expect(el._grodSelectedItem).to.deep.equal([OBJECT_ITEMS[0], OBJECT_ITEMS[2]]);
      expect(el.programselectdisabled).to.be.false;
    });
  });

  describe('end to end', () => {
    it('carries a grid row through to the field value', async () => {
      el._searchButton.click();
      await flush();

      el._grod.dispatchEvent(new CustomEvent('active-item-changed', { detail: { value: OBJECT_ITEMS[3] } }));
      await nextFrame();
      el.__select();
      await flush();

      expect(el._field.selectedItem).to.deep.equal(OBJECT_ITEMS[3]);
      expect(el._field.value).to.equal('blueberry');
      expect(el._dialog.opened).to.be.false;
    });

    it('reopens with the previous choice preselected', async () => {
      el._searchButton.click();
      await flush();
      el.__onSelectChanged({ detail: { value: [OBJECT_ITEMS[2]] } });
      el.__select();
      await flush();

      el._searchButton.click();
      await flush();

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[2]]);
      expect(el.selectdisabled).to.be.false;
    });
  });
});
