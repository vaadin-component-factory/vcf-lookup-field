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
 * The component creates its combo box, search button and dialog in `ready()`,
 * but only applies the property bindings on the next animation frame. Waiting
 * for two frames guarantees both steps have run before a test inspects them.
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
 * The three footer buttons, in DOM order. They start out in the element's
 * shadow root and the dialog's footer renderer moves them into the dialog on
 * the first open, so look in both places.
 */
export function footerButtons(el) {
  const root = el.$.dialogfooter.children.length ? el.$.dialogfooter : el._dialog;
  const [create, cancel, select] = root.querySelectorAll('vaadin-button');
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
