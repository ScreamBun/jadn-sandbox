import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "reactstrap";
import { getConversions } from "reducers/convert";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { isNull } from "lodash";
import { useLocation } from "react-router-dom";
import SBCollapseViewer from "components/common/SBCollapseViewer";
import SBDownloadFile from "components/common/SBDownloadFile";
import Spinner from "components/common/Spinner";
import SBSelect, { Option } from "components/common/SBSelect";
const validTranslations = ['JSON', 'Relax', 'XSD'];

const SchemaTranslated = (props: any) => {
    const location = useLocation()
    const { navConvertTo } = location.state

    const { loadedSchema, translation, setTranslation, translatedSchema, setTranslatedSchema, isLoading } = props;
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

    const handleTranslation = (e: Option[]) => {
        let translateTo;
        if (e.length == 1) {
            translateTo = translateOpts[e[0].value];
        } else {
            translateTo = [];
            for (let i = 0; i < Object.values(e).length; i++) {
                translateTo.push(translateOpts[Object.values(e)[i].value])
            }
        }
        setTranslation(translateTo);
        setTranslatedSchema('');
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-6'>
                        <SBSelect id={"translation-list"} data={Object.keys(translateOpts)} onChange={handleTranslation}
                            placeholder={'Translate to...'} isMultiSelect
                        />
                    </div>
                    <div className='col-md-6'>
                        <div className={`${translation == 'all' || !translatedSchema ? ' d-none' : ''}`}>
                            <SBCopyToClipboard buttonId='copyTranslatededSchema' data={translatedSchema} customClass='float-right' />
                            <SBDownloadFile buttonId='schemaDownload' data={translatedSchema} ext={translation} customClass={`mr-1 float-right${translatedSchema ? '' : ' d-none'}`} />
                        </div>

                        {isLoading ? <Spinner action={'Translating'} /> : <Button color="success" type="submit" id="translateSchema" className="btn-sm mr-1 float-right"
                            disabled={loadedSchema && translation ? false : true}
                            title={"Translate the given JADN schema to the selected format"}
                        >
                            Translate
                        </Button>}
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                {typeof translation != 'string' && translatedSchema ? <SBCollapseViewer data={translatedSchema} /> :
                    <SBEditor data={typeof translatedSchema == 'object' ? translatedSchema[0].schema : translatedSchema} isReadOnly={true} convertTo={typeof translation == 'object' ? '' : translation}></SBEditor>
                }
            </div>
        </div>
    )
}
export default SchemaTranslated;