export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

export function toggle(el, cls, state) {
    if (!el) return;
    if (state === undefined) {
        el.classList.toggle(cls);
    } else {
        el.classList.toggle(cls, state);
    }
}
