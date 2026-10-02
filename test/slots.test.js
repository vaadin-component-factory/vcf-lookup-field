import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import {
  customFilter,
  customGrid,
  dialogContentElements,
  flush,
  footerButtons,
  isShownInDialog,
  lookupFixture,
  openDialog,
  OBJECT_ITEMS
} from './helpers.js';
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

    /**
     * The flattened-nodes observer re-reports the field `ready()` already
     * adopted, and on every later slot change. That used to register the
     * `filter-changed` listener once more each time.
     */
    it('listens to filter-changed on the field once, however often the slot changes', async () => {
      const field = document.createElement('vaadin-combo-box');
      field.setAttribute('slot', 'field');
      const active = new Set();
      const addEventListener = field.addEventListener.bind(field);
      const removeEventListener = field.removeEventListener.bind(field);
      field.addEventListener = (type, listener, options) => {
        if (type === 'filter-changed') {
          active.add(listener);
        }
        addEventListener(type, listener, options);
      };
      field.removeEventListener = (type, listener, options) => {
        if (type === 'filter-changed') {
          active.delete(listener);
        }
        removeEventListener(type, listener, options);
      };

      const el = document.createElement('vcf-lookup-field');
      el.appendChild(field);
      const container = await fixture(html`<div></div>`);
      container.appendChild(el);
      await flush();

      const header = document.createElement('div');
      header.setAttribute('slot', 'dialog-header');
      el.appendChild(header);
      await flush();

      expect([...active]).to.deep.equal([el.__fieldListeners['filter-changed']]);
    });

    it('stops tracking the filter value of a field it no longer wraps', async () => {
      const el = await lookupFixture();
      const original = el.field;

      const replacement = document.createElement('vaadin-combo-box');
      replacement.setAttribute('slot', 'field');
      original.remove();
      el.appendChild(replacement);
      await flush();

      original.dispatchEvent(new CustomEvent('filter-changed', { detail: { value: 'old' } }));
      expect(el._filterValue).to.not.equal('old');

      replacement.dispatchEvent(new CustomEvent('filter-changed', { detail: { value: 'new' } }));
      expect(el._filterValue).to.equal('new');
    });
  });

  describe('default grid', () => {
    /**
     * The old template declared `path="name" path="{{itemLabelPath}}"` on the
     * default column; the parser kept the first attribute, so the column was
     * stuck on `name` whatever the item paths were.
     */
    it('shows the item label in its column', async () => {
      const el = await lookupFixture();

      const column = el._grod.querySelector('vaadin-grid-column');
      expect(column.path).to.equal('label');
    });

    it('follows a custom itemLabelPath', async () => {
      const el = await fixture(html`<vcf-lookup-field item-label-path="title"></vcf-lookup-field>`);
      await flush();

      expect(el._grod.querySelector('vaadin-grid-column').path).to.equal('title');
    });

    it('follows itemLabelPath changed after initialization', async () => {
      const el = await lookupFixture();

      el.itemLabelPath = 'title';
      await flush();

      expect(el._grod.querySelector('vaadin-grid-column').path).to.equal('title');
    });

    it('renders the item labels in the dialog', async () => {
      const items = [
        { title: 'Apple', value: 'apple' },
        { title: 'Banana', value: 'banana' }
      ];
      const el = await fixture(
        html`<vcf-lookup-field item-label-path="title" .items="${items}"></vcf-lookup-field>`
      );
      await flush();
      await openDialog(el);
      await flush();

      const cells = [...el._grod.querySelectorAll('vaadin-grid-cell-content')].map(c => c.textContent.trim());
      expect(cells).to.include.members(['Apple', 'Banana']);
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

      expect(isShownInDialog(el, el.querySelector('#custom-filter'))).to.be.true;
      expect(isShownInDialog(el, el.querySelector('#custom-selected'))).to.be.true;
    });

    it('shows a grid, filter and selected element slotted while the dialog is open', async () => {
      const el = await lookupFixture();
      await openDialog(el);
      const original = { filter: el._filter, grid: el._grod, selected: el._selected };

      const grid = customGrid('late-grid', 'grid');
      const filter = customFilter('late-filter', 'filter');
      const selected = document.createElement('div');
      selected.setAttribute('slot', 'selected');
      selected.id = 'late-selected';
      el.append(grid, filter, selected);
      await flush();

      expect(dialogContentElements(el).map(child => child.id)).to.deep.equal([
        'late-filter',
        'late-grid',
        'late-selected'
      ]);
      // The defaults they replace are gone, so they do not show next to them.
      expect(original.grid.isConnected).to.be.false;
      expect(original.filter.isConnected).to.be.false;
      expect(original.selected.isConnected).to.be.false;
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
      expect(isShownInDialog(el, el._dialogHeader)).to.be.true;
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
      expect(isShownInDialog(el, el._dialogFooter)).to.be.true;
      // The built-in Create/Cancel/Select buttons are the slot's fallback
      // content, so the slotted footer replaces them.
      expect(el.$.dialogFooterSlot.assignedNodes({ flatten: true })).to.deep.equal([el._dialogFooter]);
    });
  });

  /**
   * The dialog used to move the slotted nodes into its overlay and never move
   * them back, so a framework rendering the light DOM of the lookup field --
   * React, Lit, Vue, Angular -- failed on its next update (#47).
   */
  describe('slotted content stays in the host', () => {
    async function slottedFixture() {
      const el = await fixture(html`
        <vcf-lookup-field .items="${OBJECT_ITEMS}">
          <vaadin-text-field slot="filter" id="custom-filter"></vaadin-text-field>
          <vaadin-grid slot="grid" id="custom-grid"></vaadin-grid>
          <div slot="selected" id="custom-selected"></div>
          <h2 slot="dialog-header" id="custom-header">My header</h2>
          <div slot="dialog-footer" id="custom-footer">My footer</div>
        </vcf-lookup-field>
      `);
      await flush();
      return el;
    }

    const IDS = ['custom-filter', 'custom-grid', 'custom-selected', 'custom-header', 'custom-footer'];

    it('keeps every slotted node a child of the host while the dialog is open', async () => {
      const el = await slottedFixture();

      await openDialog(el);

      IDS.forEach(id => {
        const node = el.querySelector(`#${id}`);
        expect(isShownInDialog(el, node), id).to.be.true;
      });
    });

    it('keeps every slotted node a child of the host after the dialog closes', async () => {
      const el = await slottedFixture();
      await openDialog(el);

      el.__close();
      await flush();

      IDS.forEach(id => {
        const node = el.querySelector(`#${id}`);
        expect(node && node.parentNode, id).to.equal(el);
      });
      // What a framework does on its next update.
      const grid = el.querySelector('#custom-grid');
      expect(() => el.insertBefore(document.createElement('span'), grid)).to.not.throw();
    });

    it('keeps the generated defaults children of the host too', async () => {
      const el = await lookupFixture();
      await openDialog(el);

      [el._filter, el._grod, el._selected].forEach(node => expect(isShownInDialog(el, node)).to.be.true);
      el.__close();
      await flush();
      [el._filter, el._grod, el._selected].forEach(node => expect(node.parentNode).to.equal(el));
    });

    it('lets a framework replace a slotted grid while the dialog is open', async () => {
      const el = await slottedFixture();
      await openDialog(el);
      const original = el.querySelector('#custom-grid');

      const replacement = customGrid('replacement-grid', 'grid');
      el.replaceChild(replacement, original);
      await flush();

      expect(el._grod).to.equal(replacement);
      expect(isShownInDialog(el, replacement)).to.be.true;
    });

    it('goes back to the default grid and filter when the slotted ones are removed', async () => {
      const el = await slottedFixture();
      await openDialog(el);

      el.querySelector('#custom-grid').remove();
      el.querySelector('#custom-filter').remove();
      await flush();

      expect(el._grod).to.equal(el.__generatedGrid);
      expect(el._grod.items).to.deep.equal(OBJECT_ITEMS);
      expect(el._filter).to.equal(el.__generatedFilter);
      expect(isShownInDialog(el, el._grod)).to.be.true;
      expect(isShownInDialog(el, el._filter)).to.be.true;
    });

    it('goes back to the header title and the default buttons when the slotted ones are removed', async () => {
      const el = await fixture(html`
        <vcf-lookup-field header="Pick a fruit">
          <h2 slot="dialog-header">My header</h2>
          <div slot="dialog-footer">My footer</div>
        </vcf-lookup-field>
      `);
      await flush();
      expect(el._dialog.headerTitle).to.be.not.ok;

      el._dialogHeader.remove();
      el._dialogFooter.remove();
      await flush();

      expect(el._dialogHeader).to.be.null;
      expect(el._dialogFooter).to.be.null;
      expect(el._dialog.headerTitle).to.equal('Pick a fruit');
      const { create, cancel, select } = footerButtons(el);
      expect(el.$.dialogFooterSlot.assignedNodes({ flatten: true })).to.include.members([create, cancel, select]);
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
