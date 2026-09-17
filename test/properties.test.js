import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { flush, lookupFixture, OBJECT_ITEMS } from './helpers.js';

describe('vcf-lookup-field: properties', () => {
  describe('defaults', () => {
    it('uses "label" and "value" as the default item paths', async () => {
      const el = await lookupFixture();
      expect(el.itemLabelPath).to.equal('label');
      expect(el.itemValuePath).to.equal('value');
    });

    it('defaults to single selection and a disabled select button', async () => {
      const el = await lookupFixture();
      expect(el.multiSelect).to.be.false;
      expect(el.defaultselectdisabled).to.be.true;
      expect(el.programselectdisabled).to.be.true;
      expect(el.selectdisabled).to.be.true;
      expect(el.hasselected).to.be.false;
    });

    it('hides the create button by default', async () => {
      const el = await lookupFixture();
      expect(el.createhidden).to.be.true;
    });

    it('uses "lookup-dialog" as the default theme', async () => {
      const el = await lookupFixture();
      expect(el.theme).to.equal('lookup-dialog');
    });

    it('provides English i18n strings', async () => {
      const el = await lookupFixture();
      expect(el.i18n).to.deep.equal({
        select: 'Select',
        cancel: 'Cancel',
        search: 'Search',
        searcharialabel: 'Click to open the search dialog',
        headerprefix: '',
        headerpostfix: '',
        emptyselection: 'Please select an item.',
        create: 'Create new'
      });
    });
  });

  describe('computeselectdisabled', () => {
    it('only enables Select once both flags allow it', async () => {
      const el = await lookupFixture();
      expect(el.computeselectdisabled(true, true)).to.be.true;
      expect(el.computeselectdisabled(true, false)).to.be.false;
      expect(el.computeselectdisabled(false, true)).to.be.false;
      expect(el.computeselectdisabled(false, false)).to.be.false;
    });

    it('recomputes selectdisabled when programselectdisabled changes', async () => {
      const el = await lookupFixture();
      expect(el.selectdisabled).to.be.true;

      el.programselectdisabled = false;
      expect(el.selectdisabled).to.be.false;
    });
  });

  describe('computehasselected', () => {
    it('is the inverse of programselectdisabled', async () => {
      const el = await lookupFixture();
      expect(el.computehasselected(true)).to.be.false;
      expect(el.computehasselected(false)).to.be.true;

      el.programselectdisabled = false;
      expect(el.hasselected).to.be.true;
    });
  });

  describe('computebuttondisabled', () => {
    it('disables the search button when readonly or disabled', async () => {
      const el = await lookupFixture();
      expect(el.computebuttondisabled(false, false)).to.be.false;
      expect(el.computebuttondisabled(true, false)).to.be.true;
      expect(el.computebuttondisabled(false, true)).to.be.true;
      expect(el.computebuttondisabled(true, true)).to.be.true;
    });

    it('creates a disabled search button when the field starts out readonly', async () => {
      const el = await fixture(html`<vcf-lookup-field readonly></vcf-lookup-field>`);
      await flush();

      expect(el.buttondisabled).to.be.true;
      expect(el._searchButton.disabled).to.be.true;
    });

    it('creates a disabled search button when the field starts out disabled', async () => {
      const el = await fixture(html`<vcf-lookup-field disabled></vcf-lookup-field>`);
      await flush();

      expect(el.buttondisabled).to.be.true;
      expect(el._searchButton.disabled).to.be.true;
    });
  });

  describe('state attribute reflection', () => {
    ['readonly', 'disabled', 'invalid', 'multiSelect'].forEach(prop => {
      const attribute = prop === 'multiSelect' ? 'multi-select' : prop;

      it(`reflects ${prop} to the ${attribute} attribute`, async () => {
        const el = await lookupFixture();
        expect(el.hasAttribute(attribute)).to.be.false;

        el[prop] = true;
        await nextFrame();
        expect(el.hasAttribute(attribute)).to.be.true;

        el[prop] = false;
        await nextFrame();
        expect(el.hasAttribute(attribute)).to.be.false;
      });
    });
  });

  describe('items', () => {
    it('pushes items set after initialization to the field', async () => {
      const el = await lookupFixture();

      el.items = OBJECT_ITEMS;
      await nextFrame();

      expect(el._field.items).to.deep.equal(OBJECT_ITEMS);
    });

    it('feeds the default grid through the filterItems binding', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${OBJECT_ITEMS}"></vcf-lookup-field>`);
      await flush();

      expect(el._grod.items).to.deep.equal(OBJECT_ITEMS);
    });
  });
});
