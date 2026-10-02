import { fixture, html, nextFrame } from '@open-wc/testing';
import '../src/vcf-lookup-field.js';

export const OBJECT_ITEMS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Blueberry', value: 'blueberry' }
];

export const STRING_ITEMS = ['Apple', 'Banana', 'Cherry', 'Blueberry'];

/**
 * The component creates its combo box, search button and dialog in `ready()`
 * and applies the host state to them right away, but the children themselves
 * render asynchronously. Waiting for two frames guarantees everything a test
 * inspects has settled.
 */
export async function flush() {
  await nextFrame();
  await nextFrame();
}

/** Renders a `<vcf-lookup-field>` and waits until it is fully initialized. */
export async function lookupFixture(template = html`<vcf-lookup-field></vcf-lookup-field>`) {
  const el = await fixture(template);
  await flush();
  return el;
}

/**
 * The three footer buttons, in DOM order. They are the fallback content of the
 * `dialog-footer` slot, which the footer renderer forwards into the dialog.
 */
export function footerButtons(el) {
  const [create, cancel, select] = el.$.dialogFooterSlot.querySelectorAll(':scope > vaadin-button');
  return { create, cancel, select };
}

/** Opens the lookup dialog by clicking the search button and waits for it to render. */
export async function openDialog(el) {
  el._searchButton.click();
  await flush();
  return el._dialog;
}

/** The content the dialog renderer builds inside the opened dialog. */
export function dialogContent(el) {
  return el._dialog.querySelector('[part="lookup-field-dialog-content"]');
}

/**
 * The elements the dialog content shows, in order: whatever is assigned to the
 * slots the dialog renderer forwards.
 */
export function dialogContentElements(el) {
  return Array.from(dialogContent(el).querySelectorAll('slot')).flatMap(slot => slot.assignedElements());
}

/**
 * True when `node` is still a child of the lookup field and the dialog shows it
 * through a forwarded slot -- it is never moved into the dialog itself.
 */
export function isShownInDialog(el, node) {
  return !!node && node.parentNode === el && !!node.assignedSlot && el._dialog.contains(node.assignedSlot);
}

/**
 * A grid for a renderer to return or to slot in, told apart by its `id`. Pass a
 * `slot` to slot it; a renderer's element gets its slot from the lookup field.
 */
export function customGrid(id = 'custom-grid', slot) {
  return customElement('vaadin-grid', id, slot);
}

/** A filter field for a renderer to return or to slot in. See `customGrid`. */
export function customFilter(id = 'custom-filter', slot) {
  return customElement('vaadin-text-field', id, slot);
}

function customElement(tagName, id, slot) {
  const element = document.createElement(tagName);
  element.id = id;
  if (slot) {
    element.setAttribute('slot', slot);
  }
  return element;
}
