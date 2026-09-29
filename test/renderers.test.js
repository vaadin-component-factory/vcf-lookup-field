import { expect, fixture, html } from '@open-wc/testing';
import { customFilter, customGrid, dialogContent, flush, lookupFixture, openDialog, OBJECT_ITEMS } from './helpers.js';

describe('vcf-lookup-field: dialog content renderers', () => {
  describe('gridRenderer', () => {
    it('uses the rendered grid instead of creating the default one', async () => {
      const el = await lookupFixture(html`<vcf-lookup-field .gridRenderer="${() => customGrid('rendered-grid')}"></vcf-lookup-field>`);

      expect(el._grod.id).to.equal('rendered-grid');
      expect(el.querySelectorAll('vaadin-grid')).to.have.lengthOf(1);
    });

    it('passes the lookup field to the renderer', async () => {
      let received;
      const el = await lookupFixture(html`
        <vcf-lookup-field
          .items="${OBJECT_ITEMS}"
          .gridRenderer="${lookupField => {
            received = lookupField;
            const grid = customGrid('rendered-grid');
            grid.items = lookupField.items;
            return grid;
          }}"
        ></vcf-lookup-field>
      `);

      expect(received).to.equal(el);
      expect(el._grod.items).to.deep.equal(OBJECT_ITEMS);
    });

    it('binds the selection to the rendered grid', async () => {
      const el = await lookupFixture(html`
        <vcf-lookup-field .items="${OBJECT_ITEMS}" .gridRenderer="${() => customGrid('rendered-grid')}"></vcf-lookup-field>
      `);

      el._grod.dispatchEvent(new CustomEvent('selected-items-changed', { detail: { value: [OBJECT_ITEMS[1]] } }));

      expect(el._grodSelectedItem).to.deep.equal([OBJECT_ITEMS[1]]);
    });

    it('renders the rendered grid into the dialog', async () => {
      const el = await lookupFixture(html`<vcf-lookup-field .gridRenderer="${() => customGrid('rendered-grid')}"></vcf-lookup-field>`);

      await openDialog(el);

      expect(dialogContent(el).querySelector('#rendered-grid')).to.exist;
    });

    it('falls back to the default grid when the renderer returns nothing', async () => {
      const el = await lookupFixture(html`<vcf-lookup-field .gridRenderer="${() => null}"></vcf-lookup-field>`);

      expect(el._grod).to.equal(el.__generatedGrid);
    });

    it('lets a slotted grid take precedence', async () => {
      let calls = 0;
      const el = await fixture(html`
        <vcf-lookup-field
          .gridRenderer="${() => {
            calls++;
            return customGrid('rendered-grid');
          }}"
        >
          <vaadin-grid slot="grid" id="slotted-grid"></vaadin-grid>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._grod.id).to.equal('slotted-grid');
      expect(calls).to.equal(0);

      el.gridRenderer = () => customGrid('later');
      expect(el._grod.id).to.equal('slotted-grid');
    });

    it('swaps in a renderer set after initialization and drops the default grid', async () => {
      const el = await lookupFixture();
      const defaultGrid = el._grod;

      el.gridRenderer = () => customGrid('rendered-grid');

      expect(el._grod.id).to.equal('rendered-grid');
      expect(defaultGrid.isConnected).to.be.false;
      expect(el.__generatedGrid).to.be.null;

      // The selection follows the new grid, not the old one.
      defaultGrid.dispatchEvent(new CustomEvent('selected-items-changed', { detail: { value: [OBJECT_ITEMS[0]] } }));
      expect(el._grodSelectedItem).to.be.undefined;
      el._grod.dispatchEvent(new CustomEvent('selected-items-changed', { detail: { value: [OBJECT_ITEMS[2]] } }));
      expect(el._grodSelectedItem).to.deep.equal([OBJECT_ITEMS[2]]);
    });

    it('updates the open dialog when the renderer changes', async () => {
      const el = await lookupFixture();
      await openDialog(el);

      el.gridRenderer = () => customGrid('rendered-grid');
      await flush();

      const content = dialogContent(el);
      expect(content.querySelector('#rendered-grid')).to.exist;
      expect(content.querySelectorAll('vaadin-grid')).to.have.lengthOf(1);
    });

    it('goes back to the default grid when the renderer is removed', async () => {
      const el = await lookupFixture(html`
        <vcf-lookup-field .items="${OBJECT_ITEMS}" .gridRenderer="${() => customGrid('rendered-grid')}"></vcf-lookup-field>
      `);
      const renderedGrid = el._grod;

      el.gridRenderer = null;

      expect(el._grod).to.equal(el.__generatedGrid);
      expect(el._grod.items).to.deep.equal(OBJECT_ITEMS);
      expect(renderedGrid.isConnected).to.be.false;
    });
  });

  describe('filterRenderer', () => {
    it('uses the rendered filter instead of creating the default one', async () => {
      const el = await lookupFixture(html`<vcf-lookup-field .filterRenderer="${() => customFilter('rendered-filter')}"></vcf-lookup-field>`);

      expect(el._filter.id).to.equal('rendered-filter');
      expect(el.__generatedFilter).to.be.undefined;
    });

    it('renders the rendered filter into the dialog and focuses it on open', async () => {
      const el = await lookupFixture(html`<vcf-lookup-field .filterRenderer="${() => customFilter('rendered-filter')}"></vcf-lookup-field>`);

      await openDialog(el);

      expect(dialogContent(el).firstElementChild.id).to.equal('rendered-filter');
      expect(el._filter.hasAttribute('focus-ring')).to.be.true;
    });

    it('lets a slotted filter take precedence', async () => {
      const el = await fixture(html`
        <vcf-lookup-field .filterRenderer="${() => customFilter('rendered-filter')}">
          <vaadin-text-field slot="filter" id="slotted-filter"></vaadin-text-field>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._filter.id).to.equal('slotted-filter');
    });

    it('swaps in a renderer set after initialization and stops the default filter driving the grid', async () => {
      const el = await lookupFixture();
      const defaultFilter = el._filter;

      el.filterRenderer = () => customFilter('rendered-filter');

      expect(el._filter.id).to.equal('rendered-filter');
      expect(defaultFilter.isConnected).to.be.false;
      expect(el.__generatedFilter).to.be.null;
    });

    it('goes back to the default filter, showing the current filter text, when the renderer is removed', async () => {
      const el = await lookupFixture(html`<vcf-lookup-field .filterRenderer="${() => customFilter('rendered-filter')}"></vcf-lookup-field>`);
      el._filterdata = 'ban';

      el.filterRenderer = undefined;

      expect(el._filter).to.equal(el.__generatedFilter);
      expect(el._filter.value).to.equal('ban');
    });
  });
});
