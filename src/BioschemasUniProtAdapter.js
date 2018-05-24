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
        return this._adaptedData;
    }
}