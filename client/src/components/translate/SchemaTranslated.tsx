import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getValidTranslations } from "reducers/convert";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { useLocation } from "react-router-dom";
import SBCollapseViewer from "components/common/SBCollapseViewer";
import SBSelect, { Option } from "components/common/SBSelect";
import { initConvertedSchemaState } from "components/visualize/SchemaVisualizer";
import { getSelectedSchema } from "reducers/util";
import SBDownloadBtn from "components/common/SBDownloadBtn";
import SBSubmitBtn from "components/common/SBSubmitBtn";
import SBDownloadFileBtn from "components/common/SBDownloadFileBtn";
import { LANG_XSD } from "components/utils/constants";

const SchemaTranslated = (props: any) => {
    const location = useLocation();

    const { translation, setTranslation, translatedSchema, setTranslatedSchema, isLoading, ext, setSchemaFormat, formId } = props;
    const validSchema = useSelector(getSelectedSchema);
    const data = useSelector(getValidTranslations);
    let translateOpts: Option[] = data && data[ext] ? Object.entries(data[ext]).map(([key, value]) => ({
        value: value,
        label: key
    })) : [];

    useEffect(() => {
        if (location.state) {
            Object.keys(data).map((key) => {
                const fmt = key.toLowerCase();
                Object.entries(data[key]).map(([key, value]) => {
                    if (value == location.state) {
                        setSchemaFormat({ value: fmt, label: fmt });
                        setTranslation({ value: value, label: key });
                    }
                })
            })
        }
    }, [])

    const handleTranslation = (e: Option[]) => {
        let translateTo = [];
        for (let i = 0; i < Object.values(e).length; i++) {
            translateTo.push(Object.values(e)[i])
        }
        setTranslation(translateTo);
        setTranslatedSchema(initConvertedSchemaState);
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-6'>
                        <SBSelect id={"translation-list"} data={translateOpts} onChange={handleTranslation}
                            placeholder={'Translate to...(select at least one)'}
                            value={translation} isMultiSelect isSmStyle isClearable
                        />
                    </div>
                    <div className='col-md-6 align-self-center'>
                        <div className={`${translatedSchema.length == 1 && translatedSchema[0].schema ? '' : ' d-none'}`}>
                            <SBCopyToClipboard buttonId='copyTranslatededSchema' data={translatedSchema[0].schema} customClass='float-end' />
                            <SBDownloadBtn buttonId='schemaDownload' data={translatedSchema[0].schema} ext={(translation.length == 1 ? translation[0].value : translation)} customClass={`me-1 float-end`} />
                            <div className={`${translatedSchema[0].fmt == LANG_XSD.toUpperCase() ? '' : ' d-none'}`}>
                                <SBDownloadFileBtn buttonId='jadnBaseTypesDownload' buttonTitle='Download JADN Base Types Schema' fileName='jadn_base_types.xsd' customClass={`me-1 float-end`}></SBDownloadFileBtn>
                            </div>
                        </div>
                        <SBSubmitBtn buttonId="translateSchema" 
                            buttonTitle="Translate the given JADN schema to the selected format"
                            buttonTxt="Translate"
                            customClass="me-1 float-end" 
                            isLoading={isLoading}
                            formId={formId}
                            isDisabled={Object.keys(validSchema).length != 0 && translation.length != 0 ? false : true}>
                        </SBSubmitBtn>
                    </div>
                </div>
            </div>
            <div className="card-body-page">
                {translation.length > 1 && translatedSchema.length > 1 ?
                    <SBCollapseViewer data={translatedSchema} /> :
                    <SBEditor data={translatedSchema[0].schema} isReadOnly={true} convertTo={(translation.length == 1 ? translation[0].value : translation)}></SBEditor>
                }
            </div>
        </div>
    )
}
export default SchemaTranslated;