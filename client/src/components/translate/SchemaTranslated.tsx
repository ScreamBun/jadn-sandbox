import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { getConversions } from "reducers/convert";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { isNull } from "lodash";
import { useLocation } from "react-router-dom";
const validTranslations = ['JSON', 'Relax', 'XSD'];

const SchemaTranslated = (props: any) => {
    const location = useLocation()
    const { navConvertTo } = location.state

    const { loadedSchema, translation, setTranslation, translatedSchema, setTranslatedSchema } = props;
    const data = useSelector(getConversions);
    let translateOpts = {};
    for (let i = 0; i < Object.keys(data).length; i++) {
        if (validTranslations.includes(Object.keys(data)[i])) {
            translateOpts[Object.keys(data)[i]] = Object.values(data)[i];
        }
    }

    useEffect(() => {
        if (!isNull(navConvertTo)) {
            setTranslation(navConvertTo);
        }
    }, [])

    const handleTranslation = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTranslation(e.target.value);
        setTranslatedSchema('');
    }

    const onDownloadSchemaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (translatedSchema != '') {
            try {
                const data = translatedSchema;
                const fmt = translation;
                const filename = `schema.${fmt}`;

                const blob = new Blob([data], { type: "application/json" });
                const elem = document.createElement('a');
                elem.href = URL.createObjectURL(blob);
                elem.download = filename;
                document.body.appendChild(elem);
                elem.click();

                elem.remove();
                URL.revokeObjectURL(elem.href);
            } catch (err) {
                console.log(err);
                sbToastError(`File cannot be downloaded`);
            }
        } else {
            sbToastError(`No Translated Schema Exists`);
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-3'>
                        <select id="translate-to" name="translate-to" className="form-control form-control-sm" value={translation} onChange={handleTranslation}>
                            <option value=""> Translate To... </option>
                            <option value="all"> All </option>
                            {Object.entries(translateOpts).map(([d, c]) => <option key={d} value={c}> {d} </option>)}
                        </select>
                    </div>
                    <div className='col-md-9'>
                        <SBCopyToClipboard buttonId='copyTranslatededSchema' data={translatedSchema} customClass='float-right' />
                        <Button id='schemaDownload' title="Download translated schema" color="info" className={`btn-sm mr-1 float-right${translatedSchema ? '' : ' d-none'}`} onClick={onDownloadSchemaClick}>
                            <FontAwesomeIcon icon={faFileDownload} />
                        </Button>

                        <Button color="success" type="submit" id="translateSchema" className="btn-sm mr-1 float-right"
                            disabled={loadedSchema && translation ? false : true}
                            title={!loadedSchema && !translation ? "Please select schema and language for translation" :
                                !loadedSchema && translation ? "Please select a schema" :
                                    loadedSchema && !translation ? 'Please select a language to translate to' :
                                        loadedSchema && translation ? "Translate the given JADN schema to the selected format" : "Translate the given JADN schema to the selected format"}
                        >
                            Translate
                        </Button>
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <SBEditor data={translatedSchema} isReadOnly={true} convertTo={translation}></SBEditor>
            </div>
        </div>
    )
}
export default SchemaTranslated;