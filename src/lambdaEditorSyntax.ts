export var syntax: any = {
    keywords: [],

    typeKeywords: [],

    operators: [
        '=', '->', '.', '\\'
    ],

    // The main tokenizer for our languages
    tokenizer: {
        root: [

            [/\\/, "keyword", "@insig"],
            [/^[^a-zA-Z_0-9]*[a-zA-Z_0-9]+(?=.*=)/, "keyword", "@insig"],

            // whitespace
            { include: '@whitespace' },
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\/.*$/, 'comment'],
            [/#.*$/, 'comment'],
            [/--.*$/, 'comment'],
        ],

        insig: [
            [/[a-zA-Z_0-9]+/, "string"],
            [/->|[\.=]/, "keyword", "@pop"]
        ]
    },
};
