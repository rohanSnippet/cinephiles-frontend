import {load} from '@cashfreepayments/cashfree-js';

export const cashfree = await load({
	mode: "sandbox" //or production
});