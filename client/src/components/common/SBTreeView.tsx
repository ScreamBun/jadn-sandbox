import { destructureField } from "components/create/data/lib/utils";
import React, { useEffect } from "react";

interface SBTreeViewProps {
    schema: object;
    onClick?: () => void;
}

const SBTreeView = (props: SBTreeViewProps) => {
    let schema = props.schema;

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

    // Count how many dots there are in path
    const countDots = (path: string) => {
        return path.split('.').length - 1;
    }

    // Convert paths to cards
    const pathCards = (paths: string[]) => {
        return paths.map((path, index) => (
            <div key={index} className={`card ms-${countDots(path) * 2} p-2 border border-gray-300 rounded`}>
                {getName(path)}
            </div>
        ));
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