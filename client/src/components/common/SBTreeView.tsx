import { destructureField, isDerived } from "components/create/data/lib/utils";
import React, { useEffect, useState } from "react";
import SBSidewaysToggleBtn from "./SBSidewaysToggleBtn";
import { getSelectedSchema } from "reducers/util";
import { useSelector } from "react-redux";
interface SBTreeViewProps {
    schema: object;
    onClick?: () => void;
}

const SBTreeView = (props: SBTreeViewProps) => {
    let schema = props.schema;
    const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});
    const schemaObj = useSelector(getSelectedSchema);
    const schemaRoots = schemaObj?.meta?.roots || [];
    const schemaTypes = schemaObj?.types || [];

    useEffect(() => {
        schema = props.schema;
        if (typeof schema == "string") {
            schema = JSON.parse(schema);
        }
    }, [props.schema])

    // Append paths with dot notation
    const pathAppend = (obj: any, basePath: string = ''): string[] => {
        let paths: string[] = [];
        for (const entry of Object.entries(obj)) {
            const field = entry[1]["value"] || null;
            const [_idx, _name, _type, _options, _comment, _children] = field ? destructureField(field) : [undefined, undefined, undefined, undefined, undefined, undefined];
            const pathID = _name && _type && isDerived(_type) ? _type || _name : _name;
            const currentPath = basePath ? `${basePath}.${pathID}` : pathID;
            if (field && currentPath) paths.push(currentPath);
            if (_children && Array.isArray(_children)) {
                for (const child of _children) {
                    const [__idx, __name] = destructureField(child);
                    paths = paths.concat(pathAppend([{text: __name, value: child}], currentPath));
                }
            }
        }
        return paths;
    };

    // Pull out name
    const getName = (path: string) => {
        const parts = path.split('.');
        return parts[parts.length - 1];
    }

    // Pull out parent
    const getParent = (path: string) => {
        const parts = path.split('.');
        return parts[0];
    }

    // Group paths by parent
    const groupPaths = (paths: string[]) => {
        const grouped: { [key: string]: string[] } = {};
        paths.forEach(path => {
            const name = getName(path);
            const parent = getParent(path);
            if (!grouped[parent]) {
                grouped[parent] = [];
            }
            if (name !== parent) grouped[parent].push(path);
        });
        return grouped;
    }

    // Get type def
    const getTypeDef = (name: string) => {
        for (const typeDef of schemaTypes) {
            if (typeDef[0] === name) {
                return typeDef;
            }
            if (typeDef[4] && Array.isArray(typeDef[4])) {
                for (const child of typeDef[4]) {
                    const [_idx, _name] = destructureField(child);
                    if (_name === name) {
                        return child.slice(1);
                    }
                }
            }
        }
        return null;
    };

    // Render field
    const renderField = (path: string, paths: string[], renderedPaths: string[] = []) => {
        const name = getName(path);
        const parent = getParent(path);

        const typeDef = getTypeDef(name);
        const type = typeDef ? typeDef[1] : name;
        const hasChildren = typeDef && typeDef[4] && Array.isArray(typeDef[4]) && typeDef[4].length > 0;

        const recurse = name && parent && typeDef && hasChildren && type !== name;

        if (!renderedPaths.includes(path)) {
            renderedPaths.push(path);
        } else {
            return null;
        }

        if (recurse) {
            const derivedPaths = paths.filter(p => p.startsWith(name + '.'));
            return (
                pathCards(derivedPaths)
            )
        }

        return (
            <div key={path} className={`ms-4 ps-3`}>
                {getName(path)}
            </div>
        );
    }

    // Convert paths to cards
    const pathCards = (paths: string[]) => {
        const groupedPaths = groupPaths(paths);
        const renderedPaths: string[] = [];
        const cards = [];
        for (const [parent, pathList] of Object.entries(groupedPaths)) {
            // Create a card for each group
            cards.push(
                <div key={parent}>
                    <div className="d-flex align-items-center text-strong">
                        <SBSidewaysToggleBtn toggle={toggles[parent]} setToggle={(value: boolean) => setToggles({ ...toggles, [parent]: value })} />
                        <span>{parent}</span>
                    </div>
                    <div className={`ms-4 ${toggles[parent] ? '' : 'collapse'}`}>
                        {pathList.map((path) => (
                            renderField(path, paths, renderedPaths)
                        ))}
                    </div>
                </div>
            );
        }
        return cards;
    }

    // Generate paths and cards
    const cards = pathCards(pathAppend(schema));

    return (
        <p>
            {cards}
        </p>
    );
}

export default SBTreeView;