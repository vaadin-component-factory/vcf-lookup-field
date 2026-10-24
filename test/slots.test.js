import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { customFilter, customGrid, dialogContent, flush, lookupFixture, openDialog, OBJECT_ITEMS } from './helpers.js';
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

    it('renders string items in the dialog', async () => {
      const el = await fixture(html`<vcf-lookup-field .items="${['Apple', 'Banana']}"></vcf-lookup-field>`);
      await flush();
      await openDialog(el);
      await flush();

      const cells = [...el._grod.querySelectorAll('vaadin-grid-cell-content')].map(c => c.textContent.trim());
      expect(cells).to.include.members(['Apple', 'Banana']);
    });

    it("follows a slotted field's itemLabelPath", async () => {
      const items = [
        { id: 'ada', name: 'Ada' },
        { id: 'grace', name: 'Grace' }
      ];
      const el = await fixture(html`
        <vcf-lookup-field .items="${items}">
          <vaadin-combo-box slot="field" item-label-path="name" item-value-path="id"></vaadin-combo-box>
        </vcf-lookup-field>
      `);
      await flush();
      await openDialog(el);
      await flush();

      expect(el._grod.querySelector('vaadin-grid-column').path).to.equal('name');
      const cells = [...el._grod.querySelectorAll('vaadin-grid-cell-content')].map(c => c.textContent.trim());
      expect(cells).to.include.members(['Ada', 'Grace']);
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

    /*
     * The generated filter reports its initial value after its listener is
     * attached. That used to replace the slotted grid's items with the
     * filtered host `items`, which are usually not set yet.
     */
    it('keeps the items of a slotted grid through initialization', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-grid slot="grid" .items="${OBJECT_ITEMS}"></vaadin-grid>
        </vcf-lookup-field>
      `);
      await flush();

      expect(el._grod.items).to.equal(OBJECT_ITEMS);
    });

    it('keeps the items of a slotted grid when the host items are set after attaching', async () => {
      const el = await fixture(html`
        <vcf-lookup-field>
          <vaadin-grid slot="grid" .items="${OBJECT_ITEMS}"></vaadin-grid>
        </vcf-lookup-field>
      `);
      el.items = [OBJECT_ITEMS[0]];
      await flush();

      expect(el._grod.items).to.equal(OBJECT_ITEMS);
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

      const content = dialogContent(el);
      expect(Array.from(content.children).map(child => child.id)).to.deep.equal([
        'late-filter',
        'late-grid',
        'late-selected'
      ]);
      expect(content.contains(original.grid)).to.be.false;
      expect(content.contains(original.filter)).to.be.false;
      expect(content.contains(original.selected)).to.be.false;
    });
  });

  describe('removing slotted dialog content', () => {
    async function slottedFixture() {
      const el = await lookupFixture(html`
        <vcf-lookup-field .items="${OBJECT_ITEMS}" item-label-path="label">
          <vaadin-text-field slot="filter" id="custom-filter"></vaadin-text-field>
          <vaadin-grid slot="grid" id="custom-grid"></vaadin-grid>
          <div slot="selected" id="custom-selected"></div>
        </vcf-lookup-field>
      `);
      return {
        el,
        filter: el.querySelector('#custom-filter'),
        grid: el.querySelector('#custom-grid'),
        selected: el.querySelector('#custom-selected')
      };
    }

    // Identity checks only: chai stalls describing these elements on a failure.
    function expectDefaults(el, removed) {
      expect(el._grod === el.__generatedGrid, 'default grid').to.be.true;
      expect(el._filter === el.__generatedFilter, 'default filter').to.be.true;
      expect(el._selected === removed.selected, 'removed selected element').to.be.false;
      expect(removed.grid.isConnected, 'removed grid connected').to.be.false;
      expect(removed.filter.isConnected, 'removed filter connected').to.be.false;
      expect(removed.selected.isConnected, 'removed selected element connected').to.be.false;
      const children = Array.from(dialogContent(el).children);
      expect(
        [el._filter, el._grod, el._selected].every((part, i) => children[i] === part),
        'dialog content'
      ).to.be.true;
    }

    it('falls back to the defaults when removed before the dialog opens', async () => {
      const { el, ...removed } = await slottedFixture();

      removed.grid.remove();
      removed.filter.remove();
      removed.selected.remove();
      await flush();
      await openDialog(el);

      expectDefaults(el, removed);
    });

    it('falls back to the defaults when removed after the dialog has been opened', async () => {
      const { el, ...removed } = await slottedFixture();
      await openDialog(el);
      el._dialog.opened = false;
      await flush();

      removed.grid.remove();
      removed.filter.remove();
      removed.selected.remove();
      await openDialog(el);

      expectDefaults(el, removed);
    });

    it('keeps the slotted content the dialog renderer moved into the dialog', async () => {
      const { el, ...slotted } = await slottedFixture();
      await openDialog(el);

      expect(el._grod === slotted.grid, 'slotted grid').to.be.true;
      expect(el._filter === slotted.filter, 'slotted filter').to.be.true;
      expect(el._selected === slotted.selected, 'slotted selected element').to.be.true;
    });

    it('falls back to the grid renderer when the slotted grid is removed', async () => {
      const { el, grid } = await slottedFixture();
      el.gridRenderer = () => customGrid('rendered-grid');

      grid.remove();
      await flush();

      expect(el._grod.id).to.equal('rendered-grid');
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
