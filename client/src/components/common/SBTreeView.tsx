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
            const name = entry[1]["text"] || "";
            const children = entry[1]["value"] || null;
            const currentPath = basePath ? `${basePath}.${name}` : name;
            if (children && Array.isArray(children)) {
                for (const child of children) {
                    if (!paths.includes(child)) {
                        console.log(paths);
                        paths = paths.concat(pathAppend(child, currentPath));
                    }
                }
            }
        }
        return paths;
    };

    return (
        <p>
            {pathAppend(schema)}
        </p>
    );
}

export default SBTreeView;