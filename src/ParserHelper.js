/*jslint node: true */
"use strict";

import _filter from 'lodash-es/filter';
import _assign from 'lodash-es/assign';
import _map from 'lodash-es/map';
import {context} from './Context';

export default class ParserHelper {
    constructor() {
        this._adaptedData = _assign({}, context);
        this._entry = {};
    }

    adaptData(entry) {
        this._entry = entry;
        this._adaptRecord();
        this._adaptMinimum();
        this._adaptRecommended();
        this._adaptOptional();
        return this._adaptedData;
    }

    _adaptRecord() {
        this._adaptedData = _assign(this._adaptedData, {
            "@type": "DataRecord",
            "@id": `http://www.identifiers.org/uniprot:${this._entry.accession}`,
            "identifier": this._entry.accession,
            "url": `http://www.uniprot.org/uniprot/${this._entry.accession}`,
            "dateCreated": this._entry.info.created,
            "dateModified": this._entry.info.modified,
            "version": this._entry.info.version,
            "distribution": {
                "@type": "DataDownload",
                "url": `http://www.uniprot.org/uniprot/${this._entry.accession}.fasta`
            },
            "sameAs": `http://purl.uniprot.org/uniprot/${this._entry.accession}`
        });
        //this._adaptStructures();
    }

    _adaptStructures() {
        const structures = _filter(this._entry.dbReferences, (reference) => {
            return reference.type === 'PDB';
        });

        if (structures && (structures.length !== 0)) {
            this._adaptedData.seeAlso = _map(structures, (structure) => {
                return `http://www.ebi.ac.uk/pdbe/entry/pdb/${structure.id}`;
            });
        }
    }

    _adaptMinimum() {
        this._adaptedData.mainEntity = {
            "@type": ["BioChemEntity", "Protein"],
            "identifier": this._entry.accession
        };
        try {
            this._adaptedData.mainEntity.name = this._entry.protein.recommendedName.fullName.value;
        } catch (e) {
            this._adaptedData.mainEntity.name = this._entry.id;
        }
    }

    _adaptRecommended() {
        this._addDescription();
        this._addGene();
        this._addAssociatedDisease();
        //this._addImage();
        this._addContainedIn();
    }

    _adaptOptional() {
        this._addAlternativeNames();
        //this._addROEnables();
        //this._addROInvolvedIn();
        //this._addContains();
    }

    _addDescription() {
        const allBits = _filter(this._entry.comments, comment => comment.type === 'FUNCTION')
            .map(cmt => cmt.text[0].value);
        this._adaptedData.mainEntity.description = 'Function: ' + allBits.join('. ');
    }

    _addGene() {
        const genes = this._entry.gene;
        if (genes && (genes.length !== 0)) {
            this._adaptedData.mainEntity['sio:010083'] = genes.map(gene => {
                return {
                    "@type": ["BioChemEntity", "Gene"],
                    "identifier": gene.name.value,
                    "name": gene.name.value
                }
            });
        }
    }

    _addAssociatedDisease() {
        const diseases = _filter(this._entry.comments, cmt => {return cmt.type === 'DISEASE'});
        if (diseases && (diseases.length !== 0)) {
            this._adaptedData.mainEntity['so:associated_with'] = diseases.map(disease => {
                return {
                    "@type": "MedicalCondition",
                    "name": disease.diseaseId,
                    "code": {
                        "@type": "MedicalCode",
                        "codeValue": disease.dbReference.id,
                        "codingSystem": "MIM"
                    },
                    "sameAs": `http://purl.uniprot.org/mim/${disease.dbReference.id}`
                }
            });
        }
    }

    _addContainedIn() {
        if (this._entry.organism) {
            const organism = {
                "@type": "BioChemEntity",
                "identifier": `${this._entry.organism.taxonomy}`,
                "categoryCode": {
                    "codeValue": `${this._entry.organism.taxonomy}`,
                    "url": `http://purl.uniprot.org/taxonomy/${this._entry.organism.taxonomy}`
                },
                "url": `http://www.uniprot.org/taxonomy/${this._entry.organism.taxonomy}`
            };
            organism.name = this._entry.organism.names.map(name => name.value);
            this._adaptedData.mainEntity.isContainedIn = [organism];
        }
    }

    _addAlternativeNames() {
        this._adaptedData.mainEntity.alternateName = this._entry.protein.alternativeName.map(
            name => name.fullName.value
        );
    }
}