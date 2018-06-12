/*jslint node: true */
"use strict";

import ProtVistaUniProtEntryAdapter from 'protvista-uniprot-entry-adapter';
import ParserHelper from './ParserHelper';

export default class BioschemasUniProtAdapter extends ProtVistaUniProtEntryAdapter {
    constructor() {
        super();
        this._parser = new ParserHelper();
    }

    parseEntry(data) {
        this._adaptedData = this._parser.adaptData(data);
        this._renderEntry();
        return this._adaptedData;
    }

    _renderEntry() {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.innerHTML = JSON.stringify(this._adaptedData, null, 2);
        document.body.appendChild(s);
    }
}