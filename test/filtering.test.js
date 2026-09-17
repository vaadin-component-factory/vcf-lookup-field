import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { flush, lookupFixture, OBJECT_ITEMS, STRING_ITEMS } from './helpers.js';

describe('vcf-lookup-field: filtering', () => {
  describe('_getItemLabel', () => {
    it('reads the label through itemLabelPath for object items', async () => {
      const el = await lookupFixture();
      expect(el._getItemLabel({ label: 'Apple', value: 'apple' })).to.equal('Apple');
    });

    it('follows a nested itemLabelPath', async () => {
      const el = await fixture(html`<vcf-lookup-field item-label-path="name.first"></vcf-lookup-field>`);
      await flush();

      expect(el._getItemLabel({ name: { first: 'Ada' } })).to.equal('Ada');
    });

    it('falls back to toString() for plain string items', async () => {
      const el = await lookupFixture();
      expect(el._getItemLabel('Apple')).to.equal('Apple');
    });

    it('falls back to toString() when the path does not resolve', async () => {
      const el = await lookupFixture();
      expect(el._getItemLabel({ value: 'apple', toString: () => 'fallback' })).to.equal('fallback');
    });

    it('returns an empty string for a null-ish item', async () => {
      const el = await lookupFixture();
      expect(el._getItemLabel(undefined)).to.equal('');
      expect(el._getItemLabel(null)).to.equal('');
    });
  });

  describe('filterItems', () => {
    it('returns every item when no filter is given', async () => {
      const el = await lookupFixture();
      expect(el.filterItems(OBJECT_ITEMS, '')).to.deep.equal(OBJECT_ITEMS);
      expect(el.filterItems(OBJECT_ITEMS, undefined)).to.deep.equal(OBJECT_ITEMS);
      expect(el.filterItems(OBJECT_ITEMS, null)).to.deep.equal(OBJECT_ITEMS);
    });

    it('returns the items untouched when there are none', async () => {
      const el = await lookupFixture();
      expect(el.filterItems(undefined, 'a')).to.be.undefined;
      expect(el.filterItems([], 'a')).to.deep.equal([]);
    });

    it('matches object items on a substring of their label', async () => {
      const el = await lookupFixture();
      expect(el.filterItems(OBJECT_ITEMS, 'berry')).to.deep.equal([OBJECT_ITEMS[3]]);
    });

    it('matches several items at once', async () => {
      const el = await lookupFixture();
      const result = el.filterItems(OBJECT_ITEMS, 'B');
      expect(result.map(i => i.label)).to.deep.equal(['Banana', 'Blueberry']);
    });

    it('ignores case in both the item label and the filter', async () => {
      const el = await lookupFixture();
      expect(el.filterItems(OBJECT_ITEMS, 'APPLE')).to.deep.equal([OBJECT_ITEMS[0]]);
      expect(el.filterItems(OBJECT_ITEMS, 'apple')).to.deep.equal([OBJECT_ITEMS[0]]);
    });

    it('matches plain string items', async () => {
      const el = await lookupFixture();
      expect(el.filterItems(STRING_ITEMS, 'err')).to.deep.equal(['Cherry', 'Blueberry']);
    });

    it('returns an empty array when nothing matches', async () => {
      const el = await lookupFixture();
      expect(el.filterItems(OBJECT_ITEMS, 'zzz')).to.deep.equal([]);
    });
  });

  describe('__filterGrid', () => {
    it('narrows the grid items down to the matches', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      el.__filterGrid({ detail: { value: 'berry' } });

      expect(el._grod.items).to.deep.equal([OBJECT_ITEMS[3]]);
    });

    it('restores every item when the filter is cleared', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      el.__filterGrid({ detail: { value: 'berry' } });
      el.__filterGrid({ detail: { value: '' } });

      expect(el._grod.items).to.deep.equal(OBJECT_ITEMS);
    });

    it('runs when the filter text field value changes', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      el._filter.value = 'cherry';
      await nextFrame();

      expect(el._grod.items).to.deep.equal([OBJECT_ITEMS[2]]);
    });

    it('delegates to the server connector when one is present', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();
      const calls = [];
      el.$server = { filterGrid: value => calls.push(value) };

      el.__filterGrid({ detail: { value: 'berry' } });

      expect(calls).to.deep.equal(['berry']);
      expect(el._grod.items).to.deep.equal(OBJECT_ITEMS);
    });
  });

  describe('field filter-changed', () => {
    it('records the combo box filter value', async () => {
      const el = await lookupFixture();

      el._field.dispatchEvent(new CustomEvent('filter-changed', { detail: { value: 'ban' } }));

      expect(el._filterValue).to.equal('ban');
    });
  });
});
