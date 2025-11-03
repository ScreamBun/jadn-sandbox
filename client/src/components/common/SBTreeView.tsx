import { destructureField } from "components/create/data/lib/utils";
import React, { useEffect, useState } from "react";
import SBSidewaysToggleBtn from "./SBSidewaysToggleBtn";

interface SBTreeViewProps {
    schema: object;
    onClick?: () => void;
}

const SBTreeView = (props: SBTreeViewProps) => {
    let schema = props.schema;
    const [toggles, setToggles] = useState<{ [key: string]: boolean }>({});

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
            const currentPath = basePath ? `${basePath}.${_name}` : _name;
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

    // Count how many dots there are in path
    const countDots = (path: string) => {
        return path.split('.').length - 1;
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
            if (name !== parent) grouped[parent].push(name);
        });
        return grouped;
    }

    // Convert paths to cards
    const pathCards = (paths: string[]) => {
        const groupedPaths = groupPaths(paths);
        const cards = [];
        for (const [parent, pathList] of Object.entries(groupedPaths)) {
            // Create a card for each group
            cards.push(
                <div key={parent}>
                    <div className="d-flex align-items-center text-strong">
                        <SBSidewaysToggleBtn toggle={toggles[parent]} setToggle={(value: boolean) => setToggles({ ...toggles, [parent]: value })} />
                        <span className="ms-1">{parent}</span>
                    </div>
                    <div className={`ms-5 ${toggles[parent] ? '' : 'collapse'}`}>
                        {pathList.map((path, index) => (
                            <div key={index} className={`ms-${countDots(path) * 4} p-1`}>
                                {getName(path)}
                            </div>
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