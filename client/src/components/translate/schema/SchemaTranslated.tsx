import React, { useEffect, useState } from "react";
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

    const { translation, setTranslation, translatedSchema, setTranslatedSchema, isLoading, formId } = props;
    const validSchema = useSelector(getSelectedSchema);
    const translations = useSelector(getValidTranslations);
    const [translateOpts, setTranslateOpts] = useState<Option[]>([]);


    useEffect(() => {
        if (Array.isArray(translations) && translations.length > 0) {
            const opts: Option[] = [];
            translations.forEach(obj => {
                Object.entries(obj).forEach(([label, value]) => {
                    opts.push({ label, value });
                });
            });
            setTranslateOpts(opts);
        }
    }, [translations]);

    useEffect(() => {
        if (location && location.state) {
            const index = translateOpts.findIndex(opt => opt.value === location.state);
            if (index !== -1) {
                setTranslation([{ value: translateOpts[index].value, label: translateOpts[index].label }]);
            }
        }
    }, [translateOpts]);

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