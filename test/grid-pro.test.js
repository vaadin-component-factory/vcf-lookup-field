import { expect, fixture, html } from '@open-wc/testing';
import { flush, lookupFixture, openDialog } from './helpers.js';
import '@vaadin/grid';

/** A stand-in for `<vaadin-grid-pro>`, which only needs to look the part. */
function fakeGridPro(tagName = 'VAADIN-GRID-PRO') {
  const calls = [];
  return {
    tagName,
    calls,
    _stopEdit(shouldCancel, shouldRestoreFocus) {
      calls.push(['_stopEdit', shouldCancel, shouldRestoreFocus]);
    },
    _switchEditCell(event) {
      calls.push(['_switchEditCell', event]);
    }
  };
}

describe('vcf-lookup-field: GridPro integration', () => {
  describe('_grid setter', () => {
    it('takes over the editor when assigned a grid-pro', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();

      el._grid = grid;

      expect(el._gridPro).to.equal(grid);
      expect(grid._editor).to.equal(el);
      expect(grid._oldStopEdit).to.be.a('function');
      expect(grid._stopEdit).to.not.equal(grid._oldStopEdit);
    });

    it('ignores a plain grid', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro('VAADIN-GRID');
      const original = grid._stopEdit;

      el._grid = grid;

      expect(el._gridPro).to.be.undefined;
      expect(grid._stopEdit).to.equal(original);
    });

    it('ignores a null assignment', async () => {
      const el = await lookupFixture();

      el._grid = null;

      expect(el._gridPro).to.be.undefined;
    });

    it('only takes over once, keeping the first _stopEdit override', async () => {
      const el = await lookupFixture();
      const first = fakeGridPro();
      el._grid = first;
      const override = first._stopEdit;

      const second = fakeGridPro();
      el._grid = second;

      expect(el._gridPro).to.equal(first);
      expect(first._stopEdit).to.equal(override);
      expect(second._editor).to.be.undefined;
    });
  });

  describe('_customStopEdit', () => {
    it('falls through to the original _stopEdit when nothing is in the way', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;

      grid._stopEdit(true, false);

      expect(grid.calls).to.deep.equal([['_stopEdit', true, false]]);
    });

    it('runs the pending focus callback instead of stopping the edit', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;
      let focused = 0;
      grid._hasFocusCallback = true;
      grid._focusCallback = () => (focused += 1);

      grid._stopEdit(true, true);

      expect(focused).to.equal(1);
      expect(grid._hasFocusCallback).to.be.false;
      expect(grid.calls).to.deep.equal([]);
    });

    it('consumes the focus callback only once', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;
      let focused = 0;
      grid._hasFocusCallback = true;
      grid._focusCallback = () => (focused += 1);

      grid._stopEdit(true, true);
      grid._stopEdit(true, true);

      expect(focused).to.equal(1);
      expect(grid.calls).to.deep.equal([['_stopEdit', true, true]]);
    });

    it('keeps the editor open while the lookup dialog is open', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;
      grid._dialogOpen = true;

      grid._stopEdit(true, true);

      expect(grid.calls).to.deep.equal([]);
    });
  });

  describe('dialog opened state', () => {
    it('marks the grid-pro editor as busy while the dialog is open', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;

      await openDialog(el);

      expect(grid._dialogOpen).to.be.true;
    });

    it('releases the grid-pro editor when the dialog closes', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;
      await openDialog(el);

      el.__close();
      await flush();

      expect(grid._dialogOpen).to.be.false;
    });
  });

  describe('tab navigation between the field and the search button', () => {
    it('moves focus to the search button on Tab from the field', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;

      const event = new KeyboardEvent('keydown', { keyCode: 9, shiftKey: false, bubbles: true });
      el._field.dispatchEvent(event);

      expect(grid._hasFocusCallback).to.be.true;
      expect(el.shadowRoot.activeElement || document.activeElement).to.exist;
    });

    it('moves focus back to the field on Shift+Tab from the search button', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;

      const event = new KeyboardEvent('keydown', { keyCode: 9, shiftKey: true, bubbles: true });
      el._searchButton.dispatchEvent(event);

      expect(grid._hasFocusCallback).to.be.true;
      grid._focusCallback();
      expect(el._field.hasAttribute('focus-ring')).to.be.true;
    });

    it('hands plain Tab on the search button back to the grid-pro', async () => {
      const el = await lookupFixture();
      const grid = fakeGridPro();
      el._grid = grid;

      el._searchButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, shiftKey: false, bubbles: true }));

      expect(grid.calls.map(c => c[0])).to.include('_switchEditCell');
    });
  });
});

describe('vcf-lookup-field: search button keydown', () => {
  it('does not throw when the field is used standalone', async () => {
    const el = await lookupFixture();

    expect(() => el._searchButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13 }))).to.not.throw();
  });

  it('leaves the event alone when there is no grid ancestor', async () => {
    const el = await lookupFixture();
    const event = new KeyboardEvent('keydown', { keyCode: 13, bubbles: true, cancelable: true });
    let stopped = false;
    event.stopPropagation = () => (stopped = true);

    el.__searchKeydown(event);

    expect(stopped).to.be.false;
  });

  it('does not throw on keydown when nested inside a grid', async () => {
    const wrapper = await fixture(html`
      <vaadin-grid>
        <vcf-lookup-field></vcf-lookup-field>
      </vaadin-grid>
    `);
    const el = wrapper.querySelector('vcf-lookup-field');
    await flush();

    let uncaught = null;
    const onError = e => (uncaught = e.message);
    window.addEventListener('error', onError);
    el._searchButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, bubbles: true }));
    window.removeEventListener('error', onError);

    expect(uncaught).to.be.null;
  });

  it('keeps a dispatched keydown from reaching the grid ancestor', async () => {
    const wrapper = await fixture(html`
      <vaadin-grid>
        <vcf-lookup-field></vcf-lookup-field>
      </vaadin-grid>
    `);
    const el = wrapper.querySelector('vcf-lookup-field');
    await flush();
    let reachedGrid = 0;
    wrapper.addEventListener('keydown', () => (reachedGrid += 1));

    el._searchButton.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, bubbles: true }));

    expect(reachedGrid).to.equal(0);
  });

  it('stops propagation when nested inside a grid', async () => {
    const wrapper = await fixture(html`
      <vaadin-grid>
        <vcf-lookup-field></vcf-lookup-field>
      </vaadin-grid>
    `);
    const el = wrapper.querySelector('vcf-lookup-field');
    await flush();
    const event = new KeyboardEvent('keydown', { keyCode: 13, bubbles: true, cancelable: true });
    let stopped = false;
    event.stopPropagation = () => (stopped = true);

    el.__searchKeydown(event);

    expect(stopped).to.be.true;
  });
});
