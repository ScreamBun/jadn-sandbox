import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { Button, Form } from 'reactstrap'
import { getPageTitle } from 'reducers/util'
import { info, setSchema } from 'actions/util'
import JADNSchemaLoader from 'components/common/JADNSchemaLoader'
import ExampleCreator from './ExampleCreator'
import { sbToastError, sbToastSuccess } from 'components/common/SBToast'
import { JSONSchemaFaker } from 'json-schema-faker';
import { convertSchema } from 'actions/convert'

const ExampleGenerator = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState('');
    const [loadedSchema, setLoadedSchema] = useState('');
    const [generatedMessages, setGeneratedMessages] = useState<any[]>([]);

    const meta_title = useSelector(getPageTitle) + ' | Message Generation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    useEffect(() => {
        dispatch(info());
    }, [dispatch])

    useEffect(() => {
        setGeneratedMessages([]);
    }, [loadedSchema])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setSelectedFile('');
        setLoadedSchema('');
        setGeneratedMessages([]);
        dispatch(setSchema({ types: [] }));
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let schemaObj = loadedSchema;

        if (typeof schemaObj == 'string') {
            try {
                schemaObj = JSON.parse(loadedSchema);
            } catch (err) {
                if (err instanceof Error) {
                    sbToastError(err.message);
                }
            }
        }
        dispatch(convertSchema(schemaObj, 'json'))
            .then((convertSchemaVal) => {
                if (convertSchemaVal.error) {
                    console.error(convertSchemaVal.payload.response);
                    sbToastError('Failed to generate examples: Invalid JSON data');
                    return;
                }
                //CONVERTED JADN TO JSON SUCCESSFULLY : GENERATE FAKE DATA HERE
                const schema = JSON.parse(convertSchemaVal.payload.schema.convert);
                var generated: any[] = []
                const num = Math.floor(Math.random() * 11); // GENERATE A RANDOM NUM (1-10) OF EXAMPLES
                let i = 0;
                while (i < num) {
                    let ex = JSONSchemaFaker.generate(schema);
                    if (Object.values(ex).length != 0) { // CHECK GENERATED DATA IS NOT EMPTY
                        if (Object.values(ex).length > 1) { // IF GENERATED DATA HAS MULTIPLE OBJECTS
                            for (let j in Object.values(ex)) {
                                if (Object.values(ex)[j].length != 0) { // CHECK IF EACH OBJ HAS DATA
                                    generated.push(JSON.stringify(Object.values(ex)[j], null, 2));
                                }
                            }
                        } else {
                            // GENERATED DATA ONLY HAS 1 OBJECT
                            // TODO: if key is in exports, return Object.values(ex)
                            // ISSUE: JSON translated key is != export 
                            generated.push(JSON.stringify(ex, null, 2));
                        }
                        i += 1
                    }
                }
                if (generated.length != 0) {
                    sbToastSuccess('Examples generated successfully');
                    setGeneratedMessages(generated);
                }
            })
            .catch((convertSchemaErr) => {
                sbToastError(convertSchemaErr.payload.response);
            })
    }

    return (
        <div>
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>
            <div className='row'>
                <div className='col-md-12'>
                    <div className='card'>
                        <div className='card-header p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Message Generation</span></h5>
                            <Button color="danger" className='float-right ml-1 btn-sm' type="reset" onClick={onReset}>Reset</Button>
                        </div>
                        <div className='card-body p-2'>
                            <Form onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <JADNSchemaLoader
                                            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <ExampleCreator
                                            generatedMessages={generatedMessages}
                                            loadedSchema={loadedSchema}
                                        />
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ExampleGenerator 