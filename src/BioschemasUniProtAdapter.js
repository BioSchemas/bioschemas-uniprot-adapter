/*jslint node: true */
"use strict";

export default class BioschemasUniProtAdapter extends HTMLElement {
    constructor() {
        super();
        this._adapterType = 'bioschemas-uniprot-adapter';
    }

    connectedCallback() {
        console.log('connectedCallback');
    }
}