import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { flush, lookupFixture, openDialog, OBJECT_ITEMS } from './helpers.js';
import '@vaadin/combo-box';
import '@vaadin/grid';
import '@vaadin/text-field';

describe('vcf-lookup-field: slotted content', () => {
  describe('field', () => {
    it('adopts a slotted field instead of creating a combo box', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-combo-box slot="field" id="custom"></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._field.id).to.equal('custom');
      expect(el.querySelectorAll('vaadin-combo-box')).to.have.lengthOf(1);
    });

    it('still creates the search button and dialog alongside a slotted field', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-combo-box slot="field"></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._searchButton).to.exist;
      expect(el._dialog).to.exist;
    });

    it('drives the dialog from the slotted field selection', async () => {
      const el = await fixture(html`
        <vcf-lookup-field .items="${OBJECT_ITEMS}">
          <vaadin-combo-box slot="field" .items="${OBJECT_ITEMS}" item-label-path="label"></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();
      el._field.selectedItem = OBJECT_ITEMS[2];
      await nextFrame();

      await openDialog(el);

      expect(el._grod.selectedItems).to.deep.equal([OBJECT_ITEMS[2]]);
    });

    it('tracks the filter value of a slotted field', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-combo-box slot="field"></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();

      el._field.dispatchEvent(new CustomEvent('filter-changed', { detail: { value: 'che' } }));

      expect(el._filterValue).to.equal('che');
    });
  });

  describe('grid', () => {
    it('adopts a slotted grid', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-grid slot="grid" id="custom-grid"></vaadin-grid>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._grod.id).to.equal('custom-grid');
    });

    it('listens to selection events on a slotted grid', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-grid slot="grid" id="custom-grid"></vaadin-grid>
        </vcf-lookup-field>
      `);
      await flush();

      el._grod.dispatchEvent(
        new CustomEvent('selected-items-changed', { detail: { value: [OBJECT_ITEMS[0]] } })
      );

      expect(el.programselectdisabled).to.be.false;
    });

    it('moves its listeners over when the grid is replaced at runtime', async () => {
      const el = await lookupFixture();
      const original = el._grod;

      const replacement = document.createElement('vaadin-grid');
      replacement.setAttribute('slot', 'grid');
      el.appendChild(replacement);
      await flush();

      expect(el._grod).to.equal(replacement);

      original.dispatchEvent(new CustomEvent('selected-items-changed', { detail: { value: [OBJECT_ITEMS[0]] } }));
      expect(el.programselectdisabled).to.be.true;

      replacement.dispatchEvent(new CustomEvent('selected-items-changed', { detail: { value: [OBJECT_ITEMS[0]] } }));
      expect(el.programselectdisabled).to.be.false;
    });
  });

  describe('filter and selected', () => {
    it('adopts a slotted filter field', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-text-field slot="filter" id="custom-filter"></vaadin-text-field>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._filter.id).to.equal('custom-filter');
    });

    it('adopts a slotted selected element', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <div slot="selected" id="custom-selected"></div>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._selected.id).to.equal('custom-selected');
    });

    it('renders the slotted filter and selected elements into the dialog', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-text-field slot="filter" id="custom-filter"></vaadin-text-field>
          <div slot="selected" id="custom-selected">Chosen</div>
        </vcf-lookup-field>
      `);
      await flush();

      await openDialog(el);

      expect(el._dialog.querySelector('#custom-filter')).to.exist;
      expect(el._dialog.querySelector('#custom-selected')).to.exist;
    });
  });

  describe('dialog header and footer', () => {
    it('replaces the dialog header with slotted content', async () => {
      const el = await fixture(html`
        <vcf-lookup-field header="Ignored">
          <h2 slot="dialog-header" id="custom-header">My header</h2>
        </vcf-lookup-field>
      `);
      await flush();

      await openDialog(el);

      expect(el._dialogHeader.id).to.equal('custom-header');
      expect(el._dialog.querySelector('#custom-header')).to.exist;
      expect(el._dialog.headerTitle).to.be.null;
    });

    it('replaces the dialog footer with slotted content', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <div slot="dialog-footer" id="custom-footer">My footer</div>
        </vcf-lookup-field>
      `);
      await flush();

      await openDialog(el);

      expect(el._dialogFooter.id).to.equal('custom-footer');
      expect(el._dialog.querySelector('#custom-footer')).to.exist;
      // The built-in Create/Cancel/Select buttons stay behind in the shadow root.
      expect(el._dialog.querySelectorAll('vaadin-button')).to.have.lengthOf(0);
      expect(el.$.dialogfooter.querySelectorAll('vaadin-button')).to.have.lengthOf(3);
    });
  });

  describe('unknown slots', () => {
    it('ignores nodes that carry no recognised slot', async () => {
      const el = await lookupFixture();
      const before = { field: el._field, grid: el._grod, filter: el._filter, selected: el._selected };

      el.appendChild(document.createElement('span'));
      el.appendChild(document.createTextNode('stray text'));
      await flush();

      expect(el._field).to.equal(before.field);
      expect(el._grod).to.equal(before.grid);
      expect(el._filter).to.equal(before.filter);
      expect(el._selected).to.equal(before.selected);
    });
  });
});
