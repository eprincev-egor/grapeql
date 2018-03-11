"use strict";

const path = require("path");
const glob = require("glob");

let entry = {};

let testsFiles = glob.sync("./tests/**/*-spec.js");
testsFiles.forEach(filePath => {
    let fileName = filePath.split(/[\\/]/) || [];
    fileName = fileName.pop();
    
    let entryName = fileName.split(".")[0];
    
    entry[ entryName ] = filePath;
});

module.exports = {
    devtool: "source-map",
    entry,
    // {
    //     testFilter: path.join(__dirname, "tests/Filter/Filter.js"),
    //     testFilterSql: path.join(__dirname, "tests/Filter/FilterSql.js"),
    //     testParser: path.join(__dirname, "tests/Parser/Parser.js"),
    //     testQueryBuilder: path.join(__dirname, "tests/QueryBuilder/QueryBuilder.js")
    // },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },

    module: {
        rules: [
            {
                exclude: /(node_modules|bower_components|videojs|underscore)/,
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    presets: ["es2015"]
                }
            }
        ]
    }
};
