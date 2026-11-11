// Type-checked by `npm run test:types`; never run. Imports go through the
// package name, so they also check the `types` and `exports` of package.json.
import '@vaadin-component-factory/vcf-lookup-field';
import {
  LookupField,
  LookupFieldCreateItemEvent,
  LookupFieldI18n,
  LookupFieldSelectedItemChangedEvent
} from '@vaadin-component-factory/vcf-lookup-field';
import { LookupField as LookupFieldFromSrc } from '@vaadin-component-factory/vcf-lookup-field/src/vcf-lookup-field.js';

const assertType = <T>(value: T): T => value;

// The tag name maps to the class.
const lookupField = document.createElement('vcf-lookup-field');
assertType<LookupField>(lookupField);
assertType<typeof LookupField>(LookupFieldFromSrc);
assertType<string>(LookupField.version);

// Properties
lookupField.items = [{ id: 1, name: 'Apple' }];
lookupField.itemLabelPath = 'name';
lookupField.itemValuePath = 'id';
lookupField.label = 'Fruit';
lookupField.header = 'Pick a fruit';
lookupField.multiSelect = false;
lookupField.disabled = false;
lookupField.readonly = false;
lookupField.required = true;
lookupField.invalid = false;
lookupField.errorMessage = 'Required';
lookupField.theme = 'integrated full-width';
lookupField.createhidden = true;
assertType<boolean>(lookupField.selectdisabled);
assertType<string | undefined>(lookupField.value);
assertType<HTMLElement | null | undefined>(lookupField.field);
// @ts-expect-error there is no field before the lookup field is connected
assertType<HTMLElement | null>(lookupField.field);

// A partial i18n object can be assigned; reading it gives every text.
lookupField.i18n = { select: 'Choose' };
assertType<LookupFieldI18n>(lookupField.i18n);
assertType<string>(lookupField.i18n.cancel);

// Renderers get the lookup field.
lookupField.gridRenderer = field => {
  assertType<LookupField>(field);
  return document.createElement('vaadin-grid' as 'div');
};
lookupField.filterRenderer = () => null;

// Methods
assertType<boolean>(lookupField.validate());
assertType<boolean>(lookupField.checkValidity());

// Events are typed by name.
lookupField.addEventListener('create-item', event => {
  assertType<LookupFieldCreateItemEvent>(event);
  assertType<string>(event.detail.filter);
});
lookupField.addEventListener('selected-item-changed', event => {
  assertType<LookupFieldSelectedItemChangedEvent<unknown>>(event);
});
lookupField.addEventListener('validated', event => {
  assertType<boolean>(event.detail.valid);
});

// A typed item.
interface Fruit {
  id: number;
  name: string;
}
const fruits = new LookupFieldFromSrc() as LookupField<Fruit>;
fruits.items = [{ id: 1, name: 'Apple' }];
fruits.selectedItem = fruits.items[0];

// @ts-expect-error an item of the wrong type
fruits.items = [{ id: 'one' }];

// @ts-expect-error not a property of the lookup field
lookupField.notAProperty = true;
