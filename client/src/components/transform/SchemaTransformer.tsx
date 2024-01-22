import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { getPageTitle } from 'reducers/util'
import { info } from 'actions/transform'
import { dismissAllToast } from 'components/common/SBToast'
import SBMultiSchemaLoader from 'components/common/SBMultiSchemaLoader'
import SchemaTransformed from './SchemaTransformed'


export interface SelectedSchema { id: string, name: string, type: string, data: {} };

const SchemaTransformer = () => {
    const dispatch = useDispatch();

    const schemaTransformedRef = useRef();
    const sbMultiSchemaLoaderRef = useRef();

    const [selectedSchemas, setSelectedSchemas] = useState<SelectedSchema[]>([]);
    const prevSelectedSchemasRef = useRef<SelectedSchema[]>([]);  // Used to reload schema data that's not on the server
    const [isLoading, setIsLoading] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Transformation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "transformation_form";

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch]);

    useEffect(() => {
        /**
         * assign the latest render value of count to the ref
         * However, assigning a value to ref doesn't re-render the app
         * So, prevCountRef.current in the return statement displays the
         * last value in the ref at the time of render i.e., the previous state value.
         */
        if (selectedSchemas.length > 0) {
            prevSelectedSchemasRef.current = [...selectedSchemas];
        }

    }, [selectedSchemas]);

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setSelectedSchemas([]);
        schemaTransformedRef.current?.onReset();
        sbMultiSchemaLoaderRef.current?.onReset();
    }

    const onSelectedSchemaAdd = (new_schema: SelectedSchema) => {
        setSelectedSchemas([
            ...selectedSchemas,
            new_schema
        ]);
    }

    const onSelectedSchemaReplaceAll = (new_schemas: SelectedSchema[]) => {
        // Check for empty data caused by uploaded schemas not saved on the server
        new_schemas?.map((schema: SelectedSchema) => {
            if (!schema.data) {
                prevSelectedSchemasRef.current.map((prev_schema: SelectedSchema) => {
                    if (schema.name == prev_schema.name) {
                        schema.data = prev_schema.data;
                    }
                });
            }
        });

        setSelectedSchemas([...new_schemas]);  // Completely replace...     
    }

    // Pass in '' to clear all schemas
    const onSelectedSchemaRemove = (schema_to_remove: string) => {
        if (schema_to_remove) {
            setSelectedSchemas(selectedSchemas.filter((schema) => schema.name !== schema_to_remove));
        } else {
            setSelectedSchemas([]);
        }
    }

    const onLoading = (isLoading: boolean) => {
        setIsLoading(isLoading);
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
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Transformation</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <div className='row'>
                                <div className='col-md-6 pr-1'>
                                    <SBMultiSchemaLoader
                                        ref={sbMultiSchemaLoaderRef}
                                        isLoading={isLoading}
                                        onLoading={onLoading}
                                        selectedSchemas={selectedSchemas}
                                        onSelectedSchemaAdd={onSelectedSchemaAdd}
                                        onSelectedSchemaReplaceAll={onSelectedSchemaReplaceAll}
                                        onSelectedSchemaRemove={onSelectedSchemaRemove}
                                    />
                                </div>
                                <div className='col-md-6 pl-1'>
                                    <SchemaTransformed
                                        ref={schemaTransformedRef}
                                        isLoading={isLoading}
                                        selectedSchemas={selectedSchemas}
                                        onSelectedSchemaReplaceAll={onSelectedSchemaReplaceAll}
                                        onLoading={onLoading}
                                        formId={formId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SchemaTransformer